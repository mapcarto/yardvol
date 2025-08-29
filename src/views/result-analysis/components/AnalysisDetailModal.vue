<template>
  <div class="modal" :class="{ show: show }" @click="emit('close')">
    <div class="modal-content" @click.stop v-if="item">
      <div class="modal-header">
        <h2>分析结果详情</h2>
        <button class="modal-close-btn" @click="emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="detail-section">
        <h3>基本信息</h3>
        <div class="detail-info-grid">
          <div class="info-item">
            <label>结果ID:</label>
            <div>{{ item.id }}</div>
          </div>
          <div class="info-item">
            <label>场地:</label>
            <div>{{ item.site }}</div>
          </div>
          <div class="info-item">
            <label>物料类型:</label>
            <div>{{ item.material }}</div>
          </div>
          <div class="info-item">
            <label>测量日期:</label>
            <div>{{ item.date }}</div>
          </div>
          <div class="info-item">
            <label>堆数:</label>
            <div>{{ item.piles }}</div>
          </div>
          <div class="info-item">
            <label>总体积:</label>
            <div>{{ formatNumber(item.totalVolume) }} m³</div>
          </div>
          <div class="info-item">
            <label>平均体积:</label>
            <div>{{ item.avgVolume }} m³</div>
          </div>
          <div class="info-item">
            <label>精度:</label>
            <div>{{ item.accuracy }}%</div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="emit('close')">
          关闭
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="emit('exportDetail', item)"
        >
          <i class="fas fa-download"></i>导出详情
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalysisItem } from "@/stores/analysis";

defineProps<{
  show: boolean;
  item: AnalysisItem | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "exportDetail", item: AnalysisItem): void;
}>();

const formatNumber = (num: number) => (num ? num.toLocaleString() : "0");
</script>

<style scoped>
/* Styles from original component */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.modal.show {
  opacity: 1;
  visibility: visible;
}

.modal.show .modal-content {
  transform: scale(1);
}

.modal-content {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background: var(--bg-color-hover);
  color: var(--text-primary);
}

.detail-section {
  padding: 1.5rem;
}

.detail-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item div {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-color-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-color-hover);
  transform: translateY(-1px);
}
</style>
