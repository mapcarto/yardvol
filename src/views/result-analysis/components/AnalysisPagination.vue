<template>
  <div class="pagination-container">
    <div class="pagination-info">
      共 <span class="highlight">{{ totalItems }}</span> 条记录
    </div>
    <div class="pagination-size">
      每页
      <el-select
        :model-value="pageSize"
        @update:modelValue="emit('update:pageSize', $event)"
        placeholder="10"
      >
        <el-option :value="10" label="10" />
        <el-option :value="20" label="20" />
        <el-option :value="50" label="50" />
        <el-option :value="100" label="100" />
      </el-select>
      条
    </div>
    <div class="pagination-buttons">
      <button
        class="pagination-button"
        :disabled="currentPage === 1"
        @click="emit('goToPage', currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <template v-for="(page, index) in displayedPages" :key="index">
        <button
          v-if="page !== '...'"
          class="pagination-button"
          :class="{ active: currentPage === page }"
          @click="emit('goToPage', page as number)"
        >
          {{ page }}
        </button>
        <span v-else class="pagination-ellipsis">...</span>
      </template>
      <button
        class="pagination-button"
        :disabled="currentPage === totalPages"
        @click="emit('goToPage', currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    <div class="pagination-jump">
      前往
      <input
        type="number"
        :value="jumpToPage"
        @input="
          emit('update:jumpToPage', ($event.target as HTMLInputElement).value)
        "
        min="1"
        :max="totalPages"
        @keyup.enter="emit('handleJump')"
      />
      页
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalItems: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  displayedPages: (string | number)[];
  jumpToPage: string;
}>();

const emit = defineEmits<{
  (e: "update:pageSize", value: number): void;
  (e: "update:jumpToPage", value: string): void;
  (e: "goToPage", page: number): void;
  (e: "handleJump"): void;
}>();
</script>

<style scoped>
/* Styles from original component */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.pagination-info .highlight {
  color: var(--primary-color);
  font-weight: 600;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.pagination-button {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--bg-color-secondary);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination-button:hover:not(:disabled) {
  background: var(--bg-color-hover);
  border-color: var(--primary-color);
}
.pagination-button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-ellipsis {
  padding: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.pagination-jump {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.pagination-jump input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  text-align: center;
}
</style>
