<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, type UploadFile, type UploadRawFile } from 'element-plus';

defineProps<{ isLoading: boolean }>();
const emit = defineEmits(['process-file']);

const fileList = ref<UploadFile[]>([]);

const handleBeforeUpload = (rawFile: UploadRawFile) => {
  if (rawFile.type !== 'application/json') {
    ElMessage.error('Файл должен быть в формате .json');
    return false;
  }
  return true;
};

const handleChange = (uploadFile: UploadFile) => {
  fileList.value = [uploadFile];
};

const handleRemove = () => {
  fileList.value = [];
};

const submit = () => {
  if (fileList.value.length > 0 && fileList.value[0].raw) {
    emit('process-file', fileList.value[0].raw);
  }
};
</script>

<template>
  <el-card class="uploader-card" shadow="never">
    <el-alert
      title="Как получить файл для анализа?"
      type="info"
      :closable="false"
      show-icon
      class="instructions-alert"
    >
      <ol class="instructions-list">
        <li>Откройте **Telegram Desktop** и найдите чат с ботом <strong>Majestic</strong>.</li>
        <li>Нажмите на <strong>⋮</strong> в правом верхнем углу и выберите "Экспорт истории чата".</li>
        <li>В настройках экспорта выберите формат **JSON**.</li>
        <li>Перетащите полученный файл <code>result.json</code> в область ниже.</li>
      </ol>
    </el-alert>

    <el-divider />

    <el-upload
      v-model:file-list="fileList"
      drag
      action="#"
      :auto-upload="false"
      :limit="1"
      :before-upload="handleBeforeUpload"
      :on-change="handleChange"
      :on-remove="handleRemove"
      accept=".json"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        Перетащите файл <code>result.json</code> сюда
      </div>
      <template #tip>
        <div class="el-upload__tip">
          Все данные обрабатываются в вашем браузере и никуда не отправляются
        </div>
      </template>
    </el-upload>

    <el-button
      type="primary"
      size="large"
      @click="submit"
      :disabled="fileList.length === 0 || isLoading"
      :loading="isLoading"
      class="process-button"
    >
      Анализировать
    </el-button>
  </el-card>
</template>

<style lang="scss" scoped>
.uploader-card {
  width: 100%;
  max-width: 550px;
  border: none;
}

.instructions-alert {
  text-align: left;
}

.instructions-list {
  padding-left: 20px;
  margin: 10px 0 0 0;

  li {
    margin-bottom: 8px;
    line-height: 1.5;
  }
}

.el-divider {
  margin: 24px 0;
}

.process-button {
  width: 100%;
  margin-top: 1.5rem;
}
</style>
