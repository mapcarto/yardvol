<template>
  <div class="result-analysis-layout">
    <div class="page-header">
      <h1>结果分析</h1>
      <p>数据分析、异常预警和趋势监控</p>
    </div>

    <!-- Filters -->
    <AnalysisFilters
      :model-value="filters"
      @update:modelValue="handleFilterUpdate"
      @apply="handleApplyFilters"
      @reset="handleResetFilters"
      @export-all="handleExportAll"
    />

    <!-- Charts -->
    <div class="charts-grid">
      <AnalysisChartCard title="货量趋势分析" delay="0.1s">
        <div ref="volumeTrendChartRef" class="chart-instance"></div>
      </AnalysisChartCard>
      <AnalysisChartCard title="场地体积分布" delay="0.2s">
        <div ref="siteDistributionChartRef" class="chart-instance"></div>
      </AnalysisChartCard>
      <AnalysisChartCard title="物料类型占比" delay="0.3s">
        <div ref="materialDistributionChartRef" class="chart-instance"></div>
      </AnalysisChartCard>
      <AnalysisChartCard title="周转率分析" delay="0.4s">
        <div ref="accuracyChartRef" class="chart-instance"></div>
      </AnalysisChartCard>
    </div>

    <!-- Table and Pagination -->
    <div class="table-wrapper">
      <AnalysisTable
        :data="paginatedData"
        @view="handleShowDetail"
        @export="handleExportItem"
      />
      <AnalysisPagination
        :total-items="filteredData.length"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-pages="totalPages"
        :displayed-pages="displayedPages"
        :jump-to-page="jumpToPage"
        @update:pageSize="handlePageSizeUpdate"
        @update:jumpToPage="(v) => (jumpToPage = v)"
        @goToPage="goToPage"
        @handleJump="handleJumpToPage"
      />
    </div>

    <!-- Detail Modal -->
    <AnalysisDetailModal
      :show="showDetailModal"
      :item="selectedItem"
      @close="handleCloseModal"
      @exportDetail="handleExportDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from "vue";
import { storeToRefs } from "pinia";
import {
  useAnalysisStore,
  type AnalysisItem,
  type FiltersState,
} from "@/stores/analysis";
import { usePagination } from "./composables/usePagination";
import { useAnalysisCharts } from "./composables/useAnalysisCharts";
import { exportToCsv } from "@/utils/export";

// Import Components
import AnalysisFilters from "./components/AnalysisFilters.vue";
import AnalysisChartCard from "./components/AnalysisChartCard.vue";
import AnalysisTable from "./components/AnalysisTable.vue";
import AnalysisPagination from "./components/AnalysisPagination.vue";
import AnalysisDetailModal from "./components/AnalysisDetailModal.vue";

// --- Store and State Management ---
const analysisStore = useAnalysisStore();
const { filteredData } = storeToRefs(analysisStore);

// Local reactive copy for filters to avoid direct mutation before "apply"
const filters = reactive<FiltersState>({
  site: "all",
  material: "all",
  dateFrom: "",
  dateTo: "",
});

onMounted(() => {
  analysisStore.fetchData();
  // Initialize local filters from store
  Object.assign(filters, analysisStore.filters);
});

// --- Composables ---
const {
  currentPage,
  pageSize,
  jumpToPage,
  totalPages,
  paginatedData,
  displayedPages,
  goToPage,
  handlePageSizeChange,
  handleJumpToPage,
  resetCurrentPageIfNeeded,
} = usePagination(filteredData);

// --- Charting ---
const volumeTrendChartRef = ref<HTMLElement | null>(null);
const siteDistributionChartRef = ref<HTMLElement | null>(null);
const materialDistributionChartRef = ref<HTMLElement | null>(null);
const accuracyChartRef = ref<HTMLElement | null>(null);

useAnalysisCharts(
  filteredData,
  volumeTrendChartRef,
  siteDistributionChartRef,
  materialDistributionChartRef,
  accuracyChartRef,
);

// --- Event Handlers ---
const handleFilterUpdate = (payload: Partial<FiltersState>) => {
  Object.assign(filters, payload);
};

const handleApplyFilters = () => {
  analysisStore.applyFilters(filters);
  currentPage.value = 1; // Reset to first page on new filter
};

const handleResetFilters = () => {
  analysisStore.resetFilters();
  Object.assign(filters, analysisStore.filters); // Sync local state
  currentPage.value = 1;
};

const handlePageSizeUpdate = (value: number) => {
  pageSize.value = value;
  handlePageSizeChange();
};

watch(filteredData, () => {
  resetCurrentPageIfNeeded();
});

// --- Modal Logic ---
const showDetailModal = ref(false);
const selectedItem = ref<AnalysisItem | null>(null);

const handleShowDetail = (item: AnalysisItem) => {
  selectedItem.value = item;
  showDetailModal.value = true;
};

const handleCloseModal = () => {
  showDetailModal.value = false;
};

// --- Export Logic ---
const handleExportAll = () => {
  if (filteredData.value.length === 0) {
    alert("没有可导出的数据。");
    return;
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  exportToCsv(`analysis-export-${timestamp}.csv`, filteredData.value);
};

const handleExportItem = (item: AnalysisItem) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  exportToCsv(`item-${item.id}-export-${timestamp}.csv`, [item]);
};

const handleExportDetail = (item: AnalysisItem) => {
  // For detail export, we might want to format the data differently,
  // but for now, we'll export it as a single-row CSV.
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  exportToCsv(`detail-${item.id}-export-${timestamp}.csv`, [item]);
};
</script>

<style scoped>
.result-analysis-layout {
  padding: 1.5rem;
  background: var(--bg-color);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-instance {
  width: 100%;
  height: 100%;
}

.table-wrapper {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .result-analysis-layout {
    padding: 1rem;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
