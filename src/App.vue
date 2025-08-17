<script setup lang="ts">
import HistoryUploader from './components/HistoryUploader.vue';
import AnalysisResults from './components/AnalysisResults.vue';
import { useTheme } from './composables/useTheme';
import { useHistoryProcessor } from '@/composables/useHistoryProcessor';

const { currentTheme, toggleTheme } = useTheme();
const { isLoading, analysisResult, errorMessage, processFile } = useHistoryProcessor();
</script>

<template>
  <el-container class="main-layout">
    <el-header class="main-header">
      <div class="header-content">
        <div></div>
        <div class="header-title">
          <h1 class="title">Majestic Finance Analytics</h1>
          <p class="subtitle">Загрузите историю чата из Telegram, чтобы проанализировать ваши доходы</p>
        </div>
        <div class="theme-switcher">
          <el-switch
            class="epic-theme-switcher"
            :model-value="currentTheme === 'dark'"
            @change="toggleTheme"
            inline-prompt
            active-icon="Moon"
            inactive-icon="Sunny"
            style="--el-switch-on-color: #2c2c2c; --el-switch-off-color: #f2f2f2;"
          />
        </div>
      </div>
    </el-header>

    <el-main class="main-content">
      <HistoryUploader v-if="!analysisResult" @process-file="processFile" :is-loading="isLoading" />
      <AnalysisResults v-else :result="analysisResult" :error="errorMessage" />
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
  padding: 2rem 1rem;
}

.main-header {
  height: auto;
  margin-bottom: 2rem;
}

.header-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
}

.header-title {
  text-align: center;
}

.main-content {
  display: flex;
  justify-content: center;
}

.theme-switcher {
  display: flex;
  justify-content: flex-end;

  .epic-theme-switcher {
    transform: scale(1.5);
    margin-right: 1rem;

    &:not(.is-checked) {
      :deep(.el-icon) {
        color: #f59e0b;
      }
    }
  }
}
</style>
