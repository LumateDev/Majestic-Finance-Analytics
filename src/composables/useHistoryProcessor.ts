import { ref } from 'vue';
import type { AnalysisResult, FinancialEvent } from '@/types/analysis';

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
      const htmlContent = await readFileAsText(file);
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const messageNodes = doc.querySelectorAll('div.message.default');
      const parsedEvents: FinancialEvent[] = [];
      const rentRegex = /Сервер: (.*?)\s*Персонаж: .*?\s*Транспорт: (.*?)\s*Цена: \$(.*?)\s*Длительность: .*?\s*Арендатор: (.*)/s;
      const storageRegex = /Предмет: (.*?)\nКоличество: (\d+)/s;

      for (const node of messageNodes) {
        const dateTitle = node.querySelector('div.date.details')?.getAttribute('title');
        const textContent = node.querySelector('div.text')?.innerHTML.replace(/<br\s*\/?>/gi, '\n');

        if (!dateTitle || !textContent) continue;

        const dateMatch = dateTitle.match(/(\d{2}\.\d{2}\.\d{4}\s\d{2}:\d{2}:\d{2})/);
        if (!dateMatch) continue;

        const [day, month, year, time] = dateMatch[0].split(/[.\s]/);
        const timestamp = new Date(`${year}-${month}-${day}T${time}`).toISOString();

        const rentMatch = textContent.match(rentRegex);
        if (rentMatch) {
          const priceStr = rentMatch[3].replace(/\s|,/g, '');
          parsedEvents.push({
            timestamp,
            eventType: 'Аренда',
            server: rentMatch[1].trim(), // Сохраняем сервер
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
        throw new Error("Не найдено ни одного события. Убедитесь, что файл экспортирован правильно.");
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
      console.error('Ошибка при обработке файла:', error);
      errorMessage.value = error.message || 'Произошла неизвестная ошибка при обработке файла.';
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {

  };

  return { isLoading, analysisResult, errorMessage, processFile, reset };
}
