<!-- src/components/HistoryUploader.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, type UploadFile, type UploadRawFile } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue'


defineProps<{ isLoading: boolean }>();
const emit = defineEmits(['process-file']);

const fileList = ref<UploadFile[]>([]);

const handleBeforeUpload = (rawFile: UploadRawFile) => {
  if (rawFile.type !== 'text/html') {
    ElMessage.error('Файл должен быть в формате .html');
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
    <el-upload
      v-model:file-list="fileList"
      drag
      action="#"
      :auto-upload="false"
      :limit="1"
      :before-upload="handleBeforeUpload"
      :on-change="handleChange"
      :on-remove="handleRemove"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        Перетащите файл сюда или <em>кликните для загрузки</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          Загрузите один файл в формате .html
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
  max-width: 500px;
  border: none;
}
.process-button {
  width: 100%;
  margin-top: 1.5rem;
}
</style>
