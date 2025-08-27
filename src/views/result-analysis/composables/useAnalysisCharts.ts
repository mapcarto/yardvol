import { ref, onMounted, onUnmounted, nextTick, watch, type Ref } from "vue";
import * as echarts from "echarts";
import type { AnalysisItem } from "@/stores/analysis";
import { useThemeStore } from "@/stores/theme";

// 获取主题颜色
const getThemeColors = (isDark: boolean) => {
  if (isDark) {
    return {
      textColor: "#f7fafc",
      backgroundColor: "#1a202c",
      borderColor: "#4a5568",
      tooltipBg: "#2d3748",
      splitLineColor: "#4a5568",
      gridColor: "#4a5568",
    };
  } else {
    return {
      textColor: "#2d3748",
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      tooltipBg: "#f9fafb",
      splitLineColor: "#e2e8f0",
      gridColor: "#e2e8f0",
    };
  }
};

export function useAnalysisCharts(
  analysisData: Ref<AnalysisItem[]>,
  volumeTrendChart: Ref<HTMLElement | null>,
  siteDistributionChart: Ref<HTMLElement | null>,
  materialDistributionChart: Ref<HTMLElement | null>,
  accuracyChart: Ref<HTMLElement | null>,
) {
  const themeStore = useThemeStore();
  const colors = ref(getThemeColors(themeStore.isDark));

  let volumeTrendChartInstance: echarts.ECharts | null = null;
  let siteDistributionChartInstance: echarts.ECharts | null = null;
  let materialDistributionChartInstance: echarts.ECharts | null = null;
  let accuracyChartInstance: echarts.ECharts | null = null;

  const initCharts = () => {
    nextTick(() => {
      // 货量趋势分析图表
      if (volumeTrendChart.value) {
        if (volumeTrendChartInstance) volumeTrendChartInstance.dispose();
        volumeTrendChartInstance = echarts.init(volumeTrendChart.value);
        volumeTrendChartInstance.setOption({
          tooltip: {
            trigger: "axis",
            backgroundColor: colors.value.tooltipBg,
            borderColor: colors.value.borderColor,
            textStyle: { color: colors.value.textColor },
          },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: {
            type: "category",
            data: [
              "08-14",
              "08-15",
              "08-16",
              "08-17",
              "08-18",
              "08-19",
              "08-20",
              "08-21",
            ],
            axisLabel: { color: colors.value.textColor },
            axisLine: { lineStyle: { color: colors.value.borderColor } },
          },
          yAxis: {
            type: "value",
            name: "总货量 (m³)",
            nameTextStyle: { color: colors.value.textColor },
            axisLabel: { color: colors.value.textColor },
            splitLine: { lineStyle: { color: colors.value.splitLineColor } },
          },
          series: [
            {
              name: "总货量",
              type: "line",
              data: [10000, 12568, 18756, 14325, 5689, 15234, 11456, 20123],
              smooth: true,
              lineStyle: { color: "#667eea", width: 2 },
              itemStyle: { color: "#667eea" },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(102, 126, 234, 0.3)" },
                    { offset: 1, color: "rgba(102, 126, 234, 0.05)" },
                  ],
                },
              },
            },
          ],
        });
      }

      // 场地体积分布图表
      if (siteDistributionChart.value) {
        if (siteDistributionChartInstance)
          siteDistributionChartInstance.dispose();
        siteDistributionChartInstance = echarts.init(
          siteDistributionChart.value,
        );
        siteDistributionChartInstance.setOption({
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            backgroundColor: colors.value.tooltipBg,
            borderColor: colors.value.borderColor,
            textStyle: { color: colors.value.textColor },
          },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: {
            type: "category",
            data: ["龙口煤场", "秦皇岛煤场", "天津港", "黄骅港", "日照港"],
            axisLabel: { color: colors.value.textColor },
            axisLine: { lineStyle: { color: colors.value.borderColor } },
          },
          yAxis: {
            type: "value",
            name: "体积 (m³)",
            nameTextStyle: { color: colors.value.textColor },
            axisLabel: { color: colors.value.textColor },
            splitLine: { lineStyle: { color: colors.value.splitLineColor } },
          },
          series: [
            {
              name: "体积分布",
              type: "bar",
              data: [27802, 18756, 21328, 14325, 5689],
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "#667eea" },
                    { offset: 1, color: "#764ba2" },
                  ],
                },
              },
            },
          ],
        });
      }

      // 物料类型占比图表
      if (materialDistributionChart.value) {
        if (materialDistributionChartInstance)
          materialDistributionChartInstance.dispose();
        materialDistributionChartInstance = echarts.init(
          materialDistributionChart.value,
        );
        materialDistributionChartInstance.setOption({
          tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b}: {c} ({d}%)",
            backgroundColor: colors.value.tooltipBg,
            borderColor: colors.value.borderColor,
            textStyle: { color: colors.value.textColor },
          },
          legend: {
            orient: "vertical",
            left: "left",
            textStyle: { color: colors.value.textColor },
          },
          series: [
            {
              name: "物料类型",
              type: "pie",
              radius: "50%",
              data: [
                { value: 65883, name: "煤炭" },
                { value: 21328, name: "矿石" },
                { value: 5689, name: "粮食" },
                { value: 2000, name: "其他" },
              ],
              itemStyle: {
                borderColor: colors.value.backgroundColor,
                borderWidth: 2,
              },
              label: { color: colors.value.textColor },
              labelLine: { lineStyle: { color: colors.value.textColor } },
            },
          ],
        });
      }

      // 周转率分析图表
      if (accuracyChart.value) {
        if (accuracyChartInstance) accuracyChartInstance.dispose();
        accuracyChartInstance = echarts.init(accuracyChart.value);
        accuracyChartInstance.setOption({
          tooltip: {
            trigger: "axis",
            backgroundColor: colors.value.tooltipBg,
            borderColor: colors.value.borderColor,
            textStyle: { color: colors.value.textColor },
          },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: {
            type: "category",
            data: ["龙口煤场", "秦皇岛煤场", "天津港", "黄骅港", "日照港"],
            axisLabel: { color: colors.value.textColor },
            axisLine: { lineStyle: { color: colors.value.borderColor } },
          },
          yAxis: {
            type: "value",
            name: "精度 (%)",
            min: 95,
            max: 100,
            nameTextStyle: { color: colors.value.textColor },
            axisLabel: { color: colors.value.textColor },
            splitLine: { lineStyle: { color: colors.value.splitLineColor } },
          },
          series: [
            {
              name: "测量精度",
              type: "bar",
              data: [98.35, 98.3, 96.85, 98.0, 97.5],
              itemStyle: {
                color: (params: any) =>
                  params.value >= 98
                    ? "#22c55e"
                    : params.value >= 97
                      ? "#f59e0b"
                      : "#ef4444",
              },
            },
          ],
        });
      }
    });
  };

  const resizeCharts = () => {
    volumeTrendChartInstance?.resize();
    siteDistributionChartInstance?.resize();
    materialDistributionChartInstance?.resize();
    accuracyChartInstance?.resize();
  };

  // 监听主题变化
  watch(
    () => themeStore.isDark,
    (isDark) => {
      colors.value = getThemeColors(isDark);
      // 销毁并重新初始化图表以应用新颜色
      initCharts();
    },
    { deep: true },
  );

  // 监听数据变化 (此部分将在后续步骤中用于更新图表)
  watch(
    analysisData,
    () => {
      // 在这里可以根据新的 analysisData 更新图表数据
      // 例如: volumeTrendChartInstance.setOption({ ... })
      // 为了简化，我们暂时只在初始化时设置数据
    },
    { deep: true },
  );

  onMounted(() => {
    initCharts();
    window.addEventListener("resize", resizeCharts);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", resizeCharts);
    volumeTrendChartInstance?.dispose();
    siteDistributionChartInstance?.dispose();
    materialDistributionChartInstance?.dispose();
    accuracyChartInstance?.dispose();
  });
}
