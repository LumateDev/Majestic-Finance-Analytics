<script setup lang="ts">
import HistoryUploader from './components/HistoryUploader.vue';
import AnalysisResults from './components/AnalysisResults.vue';
import { useTheme } from './composables/useTheme';
import { useHistoryProcessor } from '@/composables/useHistoryProcessor';

const { currentTheme, toggleTheme } = useTheme();
const { isLoading, analysisResult, errorMessage, processFile } = useHistoryProcessor();
const githubUrl = 'https://github.com/LumateDev/Majestic-Finance-Analytics';
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

        <div class="header-actions">
          <a :href="githubUrl" target="_blank" rel="noopener noreferrer" title="View source on GitHub" class="github-link">
            <svg
              class="github-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.89 1.53 2.34 1.09 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.95c0-1.09.39-1.98 1.03-2.65c-.09-.25-.47-1.25.03-2.62c0 0 .84-.27 2.75 1.02A9.564 9.564 0 0 1 12 6.8c.85 0 1.7.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.5 1.37.12 2.37.03 2.62c.64.67 1.03 1.56 1.03 2.65c0 3.85-2.34 4.7-4.57 4.95c.36.31.68.92.68 1.85v2.73c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"></path>
            </svg>
          </a>
          <el-switch
            class="theme-switch"
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
  min-height: 80vh;
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

.header-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 32px;
}

.github-link {
  display: flex;
  align-items: center;
  color: var(--el-text-color-secondary);
  transition: color 0.2s ease, transform 0.2s ease;

  &:hover {
    color: var(--el-text-color-primary);
    transform: scale(1.1);
  }
}

.github-icon {
  width: 48px;
  height: 48px;
  fill: currentColor;
}

.theme-switch {
 scale: (1.5);
  &:not(.is-checked) {
    :deep(.el-icon) {
      color: #f59e0b;
    }
  }
}
</style>
