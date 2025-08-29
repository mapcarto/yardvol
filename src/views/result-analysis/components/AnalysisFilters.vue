<template>
  <div class="filter-card fade-in-up">
    <div class="form-group">
      <label for="siteFilter">场地</label>
      <el-select
        id="siteFilter"
        :model-value="modelValue.site"
        @update:modelValue="emitUpdate({ site: $event })"
        placeholder="全部场地"
        class="form-control"
      >
        <el-option value="all" label="全部场地" />
        <el-option value="龙口煤场" label="龙口煤场" />
        <el-option value="秦皇岛煤场" label="秦皇岛煤场" />
        <el-option value="天津港" label="天津港" />
        <el-option value="黄骅港" label="黄骅港" />
        <el-option value="日照港" label="日照港" />
      </el-select>
    </div>
    <div class="form-group">
      <label for="materialFilter">物料类型</label>
      <el-select
        id="materialFilter"
        :model-value="modelValue.material"
        @update:modelValue="emitUpdate({ material: $event })"
        placeholder="全部物料"
        class="form-control"
      >
        <el-option value="all" label="全部物料" />
        <el-option value="煤炭" label="煤炭" />
        <el-option value="矿石" label="矿石" />
        <el-option value="粮食" label="粮食" />
        <el-option value="其他" label="其他" />
      </el-select>
    </div>
    <div class="form-group">
      <label for="dateFrom">开始日期</label>
      <el-date-picker
        :model-value="modelValue.dateFrom"
        @update:modelValue="emitUpdate({ dateFrom: $event })"
        type="date"
        placeholder="选择开始日期"
        class="form-control"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
    </div>
    <div class="form-group">
      <label for="dateTo">结束日期</label>
      <el-date-picker
        :model-value="modelValue.dateTo"
        @update:modelValue="emitUpdate({ dateTo: $event })"
        type="date"
        placeholder="选择结束日期"
        class="form-control"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
    </div>
    <div>
      <div class="filter-buttons">
        <button class="btn btn-primary" @click="emit('apply')">
          <i class="fas fa-filter"></i>
          应用筛选
        </button>
        <button class="btn btn-secondary" @click="emit('reset')">
          <i class="fas fa-redo"></i>
          重置
        </button>
        <button class="btn btn-success" @click="emit('export-all')">
          <i class="fas fa-file-excel"></i>
          导出全部
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FiltersState } from "@/stores/analysis";

interface Props {
  modelValue: FiltersState;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", payload: Partial<FiltersState>): void;
  (e: "apply"): void;
  (e: "reset"): void;
  (e: "export-all"): void;
}>();

const emitUpdate = (payload: Partial<FiltersState>) => {
  emit("update:modelValue", payload);
};
</script>

<style scoped>
/* Styles copied from original index.vue */
.filter-card {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.3s ease;
  text-align: center;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

.filter-buttons {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-shrink: 0;
}
</style>
