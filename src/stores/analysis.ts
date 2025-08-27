import { defineStore } from "pinia";
import { ref, computed } from "vue";

// 定义数据项的类型
export interface AnalysisItem {
  id: string;
  site: string;
  material: string;
  piles: number;
  totalVolume: number;
  avgVolume: number;
  date: string;
  accuracy: number;
  change: number;
}

// 定义筛选条件的状态类型
export interface FiltersState {
  site: string;
  material: string;
  dateFrom: string;
  dateTo: string;
}

// 模拟数据
const mockAnalysisData: AnalysisItem[] = [
  {
    id: "R001",
    site: "龙口煤场",
    material: "煤炭",
    piles: 24,
    totalVolume: 12568,
    avgVolume: 523.7,
    date: "2025-08-15",
    accuracy: 98.2,
    change: 2.3,
  },
  {
    id: "R002",
    site: "秦皇岛煤场",
    material: "煤炭",
    piles: 32,
    totalVolume: 18756,
    avgVolume: 586.1,
    date: "2025-08-16",
    accuracy: 97.8,
    change: -5.8,
  },
  {
    id: "R003",
    site: "天津港",
    material: "矿石",
    piles: 18,
    totalVolume: 9872,
    avgVolume: 548.4,
    date: "2025-08-17",
    accuracy: 96.5,
    change: 12.5,
  },
  {
    id: "R004",
    site: "黄骅港",
    material: "煤炭",
    piles: 26,
    totalVolume: 14325,
    avgVolume: 551.0,
    date: "2025-08-17",
    accuracy: 98.0,
    change: -23.2,
  },
  {
    id: "R005",
    site: "日照港",
    material: "粮食",
    piles: 12,
    totalVolume: 5689,
    avgVolume: 474.1,
    date: "2025-08-18",
    accuracy: 97.5,
    change: -0.2,
  },
  {
    id: "R006",
    site: "龙口煤场",
    material: "煤炭",
    piles: 28,
    totalVolume: 15234,
    avgVolume: 544.1,
    date: "2025-08-19",
    accuracy: 98.5,
    change: 8.7,
  },
  {
    id: "R007",
    site: "天津港",
    material: "矿石",
    piles: 22,
    totalVolume: 11456,
    avgVolume: 520.7,
    date: "2025-08-20",
    accuracy: 97.2,
    change: -12.3,
  },
  {
    id: "R008",
    site: "秦皇岛煤场",
    material: "煤炭",
    piles: 35,
    totalVolume: 20123,
    avgVolume: 575.2,
    date: "2025-08-21",
    accuracy: 98.8,
    change: 15.6,
  },
  // 增加更多数据以测试分页
  {
    id: "R009",
    site: "日照港",
    material: "其他",
    piles: 8,
    totalVolume: 4500,
    avgVolume: 562.5,
    date: "2025-08-22",
    accuracy: 99.1,
    change: 3.1,
  },
  {
    id: "R010",
    site: "龙口煤场",
    material: "矿石",
    piles: 15,
    totalVolume: 8900,
    avgVolume: 593.3,
    date: "2025-08-23",
    accuracy: 97.0,
    change: -1.5,
  },
  {
    id: "R011",
    site: "天津港",
    material: "煤炭",
    piles: 40,
    totalVolume: 22000,
    avgVolume: 550.0,
    date: "2025-08-24",
    accuracy: 98.1,
    change: 10.2,
  },
  {
    id: "R012",
    site: "黄骅港",
    material: "粮食",
    piles: 20,
    totalVolume: 10500,
    avgVolume: 525.0,
    date: "2025-08-25",
    accuracy: 96.9,
    change: 5.5,
  },
];

export const useAnalysisStore = defineStore("analysis", () => {
  // State
  const loading = ref(false);
  const analysisData = ref<AnalysisItem[]>([]);
  const filters = ref<FiltersState>({
    site: "all",
    material: "all",
    dateFrom: "",
    dateTo: "",
  });

  // Getters
  const filteredData = computed(() => {
    return analysisData.value.filter((item) => {
      const siteMatch =
        filters.value.site === "all" || item.site === filters.value.site;
      const materialMatch =
        filters.value.material === "all" ||
        item.material === filters.value.material;
      const dateFromMatch =
        !filters.value.dateFrom || item.date >= filters.value.dateFrom;
      const dateToMatch =
        !filters.value.dateTo || item.date <= filters.value.dateTo;
      return siteMatch && materialMatch && dateFromMatch && dateToMatch;
    });
  });

  // Actions
  async function fetchData() {
    loading.value = true;
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));
    analysisData.value = mockAnalysisData;
    loading.value = false;
  }

  function applyFilters(newFilters: Partial<FiltersState>) {
    filters.value = { ...filters.value, ...newFilters };
  }

  function resetFilters() {
    filters.value = {
      site: "all",
      material: "all",
      dateFrom: "",
      dateTo: "",
    };
  }

  return {
    // State
    loading,
    filters,
    // Getters
    filteredData,
    // Actions
    fetchData,
    applyFilters,
    resetFilters,
  };
});
