<template>
  <div class="table-card fade-in-up" style="animation-delay: 0.5s">
    <div class="table-container">
      <table class="analysis-table">
        <thead>
          <tr>
            <th>结果ID</th>
            <th>场地</th>
            <th>物料类型</th>
            <th>堆数</th>
            <th>总体积 (m³)</th>
            <th>平均体积 (m³)</th>
            <th>测量日期</th>
            <th>精度 (%)</th>
            <th>变化情况</th>
            <th>预警状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.length === 0">
            <td colspan="11" class="no-data">没有找到匹配的数据。</td>
          </tr>
          <tr v-for="item in data" :key="item.id" :data-id="item.id">
            <td>
              <strong>{{ item.id }}</strong>
            </td>
            <td>{{ item.site }}</td>
            <td>{{ item.material }}</td>
            <td>{{ item.piles }}</td>
            <td>{{ formatNumber(item.totalVolume) }}</td>
            <td>{{ item.avgVolume }}</td>
            <td>{{ item.date }}</td>
            <td>{{ item.accuracy }}</td>
            <td>
              <div :class="getChangeClass(item.change)">
                <i :class="getChangeIcon(item.change)"></i>
                {{ item.change > 0 ? "+" : "" }}{{ item.change.toFixed(1) }}%
              </div>
            </td>
            <td>
              <span :class="getAlertClass(item.change)">
                <i :class="getAlertIcon(item.change)"></i>
                {{ getAlertText(item.change) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  class="action-btn action-btn-view"
                  @click="emit('view', item)"
                >
                  <i class="fas fa-eye"></i>查看详情
                </button>
                <button
                  class="action-btn action-btn-export"
                  @click="emit('export', item)"
                >
                  <i class="fas fa-download"></i>导出
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalysisItem } from "@/stores/analysis";

defineProps<{
  data: AnalysisItem[];
}>();

const emit = defineEmits<{
  (e: "view", item: AnalysisItem): void;
  (e: "export", item: AnalysisItem): void;
}>();

// Helper functions from original component
const formatNumber = (num: number) => num.toLocaleString();

const getChangeClass = (change: number) => {
  if (change > 0) return "change-indicator positive";
  if (change < -20) return "change-indicator negative critical";
  if (change < 0) return "change-indicator negative";
  return "change-indicator stable";
};

const getChangeIcon = (change: number) => {
  if (change > 0) return "fas fa-arrow-up";
  if (change < 0) return "fas fa-arrow-down";
  return "fas fa-minus";
};

const getAlertClass = (change: number) => {
  if (change <= -20) return "alert-badge alert-warning";
  if (change < -10) return "alert-badge alert-caution";
  return "alert-badge alert-normal";
};

const getAlertIcon = (change: number) => {
  if (change <= -20) return "fas fa-exclamation-triangle";
  if (change < -10) return "fas fa-exclamation-circle";
  return "fas fa-check-circle";
};

const getAlertText = (change: number) => {
  if (change <= -20) return "异常减少";
  if (change < -10) return "显著减少";
  return "正常";
};
</script>

<style scoped>
/* Styles from original component */
.table-card {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-container {
  overflow-x: auto;
}

.analysis-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.analysis-table th,
.analysis-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.analysis-table th {
  background: var(--bg-color-tertiary);
  font-weight: 600;
  color: var(--text-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.analysis-table td {
  color: var(--text-primary);
}

.analysis-table tbody tr:hover {
  background: var(--bg-color-hover);
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.change-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.change-indicator.positive {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}
.change-indicator.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.change-indicator.negative.critical {
  background: rgba(220, 38, 38, 0.2);
  color: #dc2626;
  font-weight: 600;
}
.change-indicator.stable {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.alert-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.alert-badge.alert-normal {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}
.alert-badge.alert-caution {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.alert-badge.alert-warning {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}
.action-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.action-btn-view {
  background: var(--primary-color);
  color: white;
}
.action-btn-view:hover {
  background: var(--primary-color-hover);
  transform: translateY(-1px);
}
.action-btn-export {
  background: var(--success-color);
  color: white;
}
.action-btn-export:hover {
  background: var(--success-color-hover);
  transform: translateY(-1px);
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
