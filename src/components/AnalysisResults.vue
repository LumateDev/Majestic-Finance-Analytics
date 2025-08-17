<script setup lang="ts">
import type { AnalysisResult } from '@/types/analysis';
import { computed, ref, type PropType } from 'vue';

const props = defineProps({
  result: { type: Object as PropType<AnalysisResult | null>, default: null },
  error: { type: String as PropType<string | null>, default: null }
});

const activeTab = ref('rent');
const selectedServer = ref(props.result?.servers[0] || null);
const selectedVehicle = ref<string | null>(null); // null означает "все"
const selectedDateRange = ref<[Date, Date] | null>(null);

const filteredEvents = computed(() => {
  if (!props.result) return [];


  let events = props.result.events.filter(event => event.eventType === 'Аренда');

  if (selectedServer.value) {
    events = events.filter(event => event.server === selectedServer.value);
  }

  if (selectedVehicle.value) {
    events = events.filter(event => event.itemName === selectedVehicle.value);
  }

  if (selectedDateRange.value) {
    const [startDate, endDate] = selectedDateRange.value;
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    events = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  return events;
});

const kpiTotalRevenue = computed(() => filteredEvents.value.reduce((sum, e) => sum + (e.price || 0), 0));
const kpiEventsCount = computed(() => filteredEvents.value.length);
const kpiAvgDailyRevenue = computed(() => {
  const events = filteredEvents.value;
  if (events.length === 0) {
    return 0;
  }

  const uniqueDays = new Set(
    events.map(event => new Date(event.timestamp).toISOString().split('T')[0])
  );

  const numberOfActiveDays = uniqueDays.size;

  if (numberOfActiveDays === 0) {
    return 0;
  }

  return kpiTotalRevenue.value / numberOfActiveDays;
});

const kpiTodayRevenue = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (props.result?.events || [])
    .filter(e =>
      e.eventType === 'Аренда' &&
      new Date(e.timestamp) >= today &&
      (!selectedServer.value || e.server === selectedServer.value)
    )
    .reduce((sum, e) => sum + (e.price || 0), 0);
});


const formatCurrency = (value: number) => {
  if (isNaN(value)) return '$0'; // Защита от NaN
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
};
</script>

<template>
  <div class="results-container">
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

    <el-tabs v-if="result" v-model="activeTab" class="dashboard-tabs">
      <el-tab-pane label="Аренда" name="rent">
        <el-card shadow="never" class="filters-card">
          <el-row :gutter="20" align="middle">
            <el-col :sm="24" :md="6">
              <el-select v-model="selectedServer" placeholder="Сервер">
                <el-option v-for="server in result.servers" :key="server" :label="server" :value="server" />
              </el-select>
            </el-col>
            <el-col :sm="24" :md="10">
              <el-date-picker
                v-model="selectedDateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="Начальная дата"
                end-placeholder="Конечная дата"
                style="width: 100%;"
              />
            </el-col>
            <el-col :sm="24" :md="8">
              <el-select v-model="selectedVehicle" placeholder="Все автомобили" clearable style="width: 100%;">
                <el-option v-for="vehicle in result.vehicles" :key="vehicle" :label="vehicle" :value="vehicle" />
              </el-select>
            </el-col>
          </el-row>
        </el-card>

        <el-row :gutter="20">
          <el-col :sm="12" :md="6">
            <el-card shadow="hover">
              <el-statistic title="Общий доход (за период)" :value="kpiTotalRevenue" :formatter="formatCurrency" />
            </el-card>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-card shadow="hover">
              <el-statistic title="Доход за сегодня" :value="kpiTodayRevenue" :formatter="formatCurrency" />
            </el-card>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-card shadow="hover">
              <el-statistic title="Количество аренд" :value="kpiEventsCount" />
            </el-card>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-card shadow="hover">
              <el-statistic title="Средний доход в день" :value="kpiAvgDailyRevenue" :formatter="formatCurrency" />
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never">
          <el-table :data="filteredEvents" height="450" style="width: 100%" stripe>
            <el-table-column prop="timestamp" label="Дата" sortable width="180">
              <template #default="scope">{{ new Date(scope.row.timestamp).toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="itemName" label="Транспорт" sortable />
            <el-table-column prop="renterName" label="Арендатор" />
            <el-table-column prop="price" label="Сумма" sortable align="right">
              <template #default="scope">
                <span class="price">{{ formatCurrency(scope.row.price || 0) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

      </el-tab-pane>
      <el-tab-pane label="Предметы" name="items" disabled>В разработке</el-tab-pane>
      <el-tab-pane label="Недвижимость" name="realty" disabled>В разработке</el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.results-container {
  width: 100%;
  max-width: 1200px;
}
.dashboard-tabs {
  :deep(.el-tabs__content) {
    padding-top: 20px;
  }
}
.filters-card {
  margin-bottom: 20px;
  .el-select, .el-date-picker {
    width: 100%;
  }
}
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.price {
  font-weight: 600;
  color: var(--el-color-success);
}
</style>
