import { ref } from 'vue';
import type { AnalysisResult, FinancialEvent, TelegramExport } from '@/types/analysis';



export function useHistoryProcessor() {
  const isLoading = ref(false);
  const analysisResult = ref<AnalysisResult | null>(null);
  const errorMessage = ref<string | null>(null);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, 'UTF-8');
    });
  };

  const processFile = async (file: File) => {
    isLoading.value = true;
    analysisResult.value = null;
    errorMessage.value = null;

    try {
      const jsonContent = await readFileAsText(file);
      const data: TelegramExport = JSON.parse(jsonContent);
      if (!data.messages || !Array.isArray(data.messages)) {
        throw new Error("Неверный формат JSON. Отсутствует массив 'messages'.");
      }

      const parsedEvents: FinancialEvent[] = [];

      const rentRegex = /Сервер: (.*?)\s*Персонаж: .*?\s*Транспорт: (.*?)\s*Цена: \$(.*?)\s*Длительность: .*?\s*Арендатор: (.*)/s;
      const storageRegex = /Предмет: (.*?)\nКоличество: (\d+)/s;

      for (const message of data.messages) {
        if (message.from !== 'Majestic') continue;

        const textContent = Array.isArray(message.text)
          ? message.text.map(item => typeof item === 'string' ? item : item.text).join('')
          : message.text;

        if (!textContent) continue;

        const timestamp = new Date(message.date).toISOString();

        const rentMatch = textContent.match(rentRegex);
        if (rentMatch) {
          const priceStr = rentMatch[3].replace(/\s|,/g, '');
          parsedEvents.push({
            timestamp,
            eventType: 'Аренда',
            server: rentMatch[1].trim(),
            itemName: rentMatch[2].trim(),
            price: parseFloat(priceStr),
            renterName: rentMatch[4].trim(),
          });
          continue;
        }

        const storageMatch = textContent.match(storageRegex);
        if (storageMatch) {
          parsedEvents.push({
            timestamp,
            eventType: 'Склад',
            itemName: storageMatch[1].trim(),
            quantity: parseInt(storageMatch[2], 10),
          });
        }
      }

      if (parsedEvents.length === 0) {
        throw new Error("Не найдено ни одного релевантного события в файле.");
      }

      const rentEvents = parsedEvents.filter(e => e.eventType === 'Аренда');
      const servers = [...new Set(rentEvents.map(e => e.server).filter(Boolean) as string[])];
      const vehicles = [...new Set(rentEvents.map(e => e.itemName).filter(Boolean) as string[])];
      const totalRevenue = rentEvents.reduce((sum, event) => sum + (event.price || 0), 0);
      const revenueByVehicle = rentEvents.reduce((acc, event) => {
        acc[event.itemName!] = (acc[event.itemName!] || 0) + (event.price || 0);
        return acc;
      }, {} as Record<string, number>);

      analysisResult.value = {
        totalRevenue,
        totalEvents: parsedEvents.length,
        revenueByVehicle,
        events: parsedEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        servers,
        vehicles,
      };

    } catch (error: any) {
      console.error('Ошибка при обработке JSON файла:', error);
      errorMessage.value = error.message.includes("Unexpected token")
        ? "Ошибка: файл не является корректным JSON. Пожалуйста, экспортируйте заново."
        : error.message;
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => { analysisResult.value = null; errorMessage.value = null; };

  return { isLoading, analysisResult, errorMessage, processFile, reset };
}
