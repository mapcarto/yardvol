<template>
  <div class="result-analysis">
    <div class="page-header">
      <h1>结果分析</h1>
      <p>数据分析、异常预警和趋势监控</p>
    </div>

    <!-- 筛选器 -->
    <div class="filter-card fade-in-up">
      <div class="form-group">
        <label for="siteFilter">场地</label>
        <el-select id="siteFilter" v-model="filters.site" placeholder="全部场地" class="form-control">
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
        <el-select id="materialFilter" v-model="filters.material" placeholder="全部物料" class="form-control">
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
          v-model="filters.dateFrom" 
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
          v-model="filters.dateTo" 
          type="date" 
          placeholder="选择结束日期" 
          class="form-control"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </div>
      <div>
        <div class="filter-buttons">
          <button class="btn btn-primary" @click="applyFilters">
            <i class="fas fa-filter"></i>
            应用筛选
          </button>
          <button class="btn btn-secondary" @click="resetFilters">
            <i class="fas fa-redo"></i>
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- 图表 -->
    <div class="charts-grid">
      <div class="chart-card fade-in-up" style="animation-delay: 0.1s;">
        <h3>货量趋势分析</h3>
        <div ref="volumeTrendChart" class="chart-container"></div>
      </div>
      <div class="chart-card fade-in-up" style="animation-delay: 0.2s;">
        <h3>场地体积分布</h3>
        <div ref="siteDistributionChart" class="chart-container"></div>
      </div>
      <div class="chart-card fade-in-up" style="animation-delay: 0.3s;">
        <h3>物料类型占比</h3>
        <div ref="materialDistributionChart" class="chart-container"></div>
      </div>
      <div class="chart-card fade-in-up" style="animation-delay: 0.4s;">
        <h3>周转率分析</h3>
        <div ref="accuracyChart" class="chart-container"></div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-card fade-in-up" style="animation-delay: 0.5s;">
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
            <tr v-for="item in paginatedData" :key="item.id" :data-id="item.id">
              <td><strong>{{ item.id }}</strong></td>
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
                  {{ item.change > 0 ? '+' : '' }}{{ item.change.toFixed(1) }}%
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
                  <button class="action-btn action-btn-view" @click="showDetail(item)">
                    <i class="fas fa-eye"></i>查看详情
                  </button>
                  <button class="action-btn action-btn-export" @click="exportData(item)">
                    <i class="fas fa-download"></i>导出
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination-container">
        <div class="pagination-info">
          共 <span class="highlight">{{ filteredData.length }}</span> 条记录
        </div>
        <div class="pagination-size">
          每页
          <el-select v-model="pageSize" @change="handlePageSizeChange" placeholder="10">
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
            @click="goToPage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <template v-for="page in displayedPages" :key="page">
            <button 
              v-if="page !== '...'" 
              class="pagination-button" 
              :class="{ active: currentPage === page }"
              @click="goToPage(page as number)"
            >
              {{ page }}
            </button>
            <span v-else class="pagination-ellipsis">...</span>
          </template>
          <button 
            class="pagination-button" 
            :disabled="currentPage === totalPages" 
            @click="goToPage(currentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="pagination-jump">
          前往
          <input 
            type="number" 
            v-model="jumpToPage" 
            min="1" 
            :max="totalPages" 
            @keyup.enter="handleJumpToPage"
          />
          页
        </div>
      </div>
    </div>

    <!-- 详情模态框 -->
    <div class="modal" :class="{ show: showDetailModal }" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>分析结果详情</h2>
          <button class="modal-close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="detail-section" v-if="selectedItem">
          <h3>基本信息</h3>
          <div class="detail-info-grid">
            <div class="info-item">
              <label>结果ID:</label>
              <div>{{ selectedItem.id }}</div>
            </div>
            <div class="info-item">
              <label>场地:</label>
              <div>{{ selectedItem.site }}</div>
            </div>
            <div class="info-item">
              <label>物料类型:</label>
              <div>{{ selectedItem.material }}</div>
            </div>
            <div class="info-item">
              <label>测量日期:</label>
              <div>{{ selectedItem.date }}</div>
            </div>
            <div class="info-item">
              <label>堆数:</label>
              <div>{{ selectedItem.piles }}</div>
            </div>
            <div class="info-item">
              <label>总体积:</label>
              <div>{{ formatNumber(selectedItem.totalVolume) }} m³</div>
            </div>
            <div class="info-item">
              <label>平均体积:</label>
              <div>{{ selectedItem.avgVolume }} m³</div>
            </div>
            <div class="info-item">
              <label>精度:</label>
              <div>{{ selectedItem.accuracy }}%</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">关闭</button>
          <button type="button" class="btn btn-primary" @click="exportDetail">
            <i class="fas fa-download"></i>导出详情
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 筛选条件
const filters = reactive({
  site: 'all',
  material: 'all',
  dateFrom: '',
  dateTo: ''
})

// 分页逻辑
const currentPage = ref(1)
const pageSize = ref(10)
const jumpToPage = ref('')

// 模态框状态
const showDetailModal = ref(false)
const selectedItem = ref<any>(null)

// 图表引用
const volumeTrendChart = ref<HTMLElement | null>(null)
const siteDistributionChart = ref<HTMLElement | null>(null)
const materialDistributionChart = ref<HTMLElement | null>(null)
const accuracyChart = ref<HTMLElement | null>(null)

// 图表实例
let volumeTrendChartInstance: echarts.ECharts | null = null
let siteDistributionChartInstance: echarts.ECharts | null = null
let materialDistributionChartInstance: echarts.ECharts | null = null
let accuracyChartInstance: echarts.ECharts | null = null

// 模拟数据
const analysisData = ref([
  {
    id: 'R001',
    site: '龙口煤场',
    material: '煤炭',
    piles: 24,
    totalVolume: 12568,
    avgVolume: 523.7,
    date: '2025-08-15',
    accuracy: 98.2,
    change: 2.3
  },
  {
    id: 'R002',
    site: '秦皇岛煤场',
    material: '煤炭',
    piles: 32,
    totalVolume: 18756,
    avgVolume: 586.1,
    date: '2025-08-16',
    accuracy: 97.8,
    change: -5.8
  },
  {
    id: 'R003',
    site: '天津港',
    material: '矿石',
    piles: 18,
    totalVolume: 9872,
    avgVolume: 548.4,
    date: '2025-08-17',
    accuracy: 96.5,
    change: 12.5
  },
  {
    id: 'R004',
    site: '黄骅港',
    material: '煤炭',
    piles: 26,
    totalVolume: 14325,
    avgVolume: 551.0,
    date: '2025-08-17',
    accuracy: 98.0,
    change: -23.2
  },
  {
    id: 'R005',
    site: '日照港',
    material: '粮食',
    piles: 12,
    totalVolume: 5689,
    avgVolume: 474.1,
    date: '2025-08-18',
    accuracy: 97.5,
    change: -0.2
  },
  {
    id: 'R006',
    site: '龙口煤场',
    material: '煤炭',
    piles: 28,
    totalVolume: 15234,
    avgVolume: 544.1,
    date: '2025-08-19',
    accuracy: 98.5,
    change: 8.7
  },
  {
    id: 'R007',
    site: '天津港',
    material: '矿石',
    piles: 22,
    totalVolume: 11456,
    avgVolume: 520.7,
    date: '2025-08-20',
    accuracy: 97.2,
    change: -12.3
  },
  {
    id: 'R008',
    site: '秦皇岛煤场',
    material: '煤炭',
    piles: 35,
    totalVolume: 20123,
    avgVolume: 575.2,
    date: '2025-08-21',
    accuracy: 98.8,
    change: 15.6
  }
])

// 筛选后的数据
const filteredData = computed(() => {
  return analysisData.value.filter(item => {
    let match = true
    if (filters.site !== 'all' && item.site !== filters.site) match = false
    if (filters.material !== 'all' && item.material !== filters.material) match = false
    if (filters.dateFrom && item.date < filters.dateFrom) match = false
    if (filters.dateTo && item.date > filters.dateTo) match = false
    return match
  })
})

// 分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / pageSize.value) || 1
})

// 显示的页码
const displayedPages = computed(() => {
  const result = []
  const maxDisplayed = 5
  
  if (totalPages.value <= maxDisplayed) {
    for (let i = 1; i <= totalPages.value; i++) {
      result.push(i)
    }
  } else {
    result.push(1)
    
    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)
    
    if (startPage === 2) {
      endPage = Math.min(totalPages.value - 1, startPage + 2)
    }
    if (endPage === totalPages.value - 1) {
      startPage = Math.max(2, endPage - 2)
    }
    
    if (startPage > 2) {
      result.push('...')
    }
    
    for (let i = startPage; i <= endPage; i++) {
      result.push(i)
    }
    
    if (endPage < totalPages.value - 1) {
      result.push('...')
    }
    
    result.push(totalPages.value)
  }
  
  return result
})

// 应用筛选
const applyFilters = () => {
  currentPage.value = 1
}

// 重置筛选
const resetFilters = () => {
  filters.site = 'all'
  filters.material = 'all'
  filters.dateFrom = ''
  filters.dateTo = ''
  currentPage.value = 1
}

// 分页方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const handlePageSizeChange = () => {
  currentPage.value = 1
  jumpToPage.value = ''
}

const handleJumpToPage = () => {
  const page = parseInt(jumpToPage.value)
  if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
  jumpToPage.value = ''
}

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// 获取变化指示器的CSS类
const getChangeClass = (change: number) => {
  if (change > 0) return 'change-indicator positive'
  if (change < -20) return 'change-indicator negative critical'
  if (change < 0) return 'change-indicator negative'
  return 'change-indicator stable'
}

// 获取变化指示器的图标
const getChangeIcon = (change: number) => {
  if (change > 0) return 'fas fa-arrow-up'
  if (change < 0) return 'fas fa-arrow-down'
  return 'fas fa-minus'
}

// 获取预警状态
const getAlertClass = (change: number) => {
  if (change <= -20) return 'alert-badge alert-warning'
  if (change < -10) return 'alert-badge alert-caution'
  return 'alert-badge alert-normal'
}

const getAlertIcon = (change: number) => {
  if (change <= -20) return 'fas fa-exclamation-triangle'
  if (change < -10) return 'fas fa-exclamation-circle'
  return 'fas fa-check-circle'
}

const getAlertText = (change: number) => {
  if (change <= -20) return '异常减少'
  if (change < -10) return '显著减少'
  return '正常'
}

// 显示详情
const showDetail = (item: any) => {
  selectedItem.value = item
  showDetailModal.value = true
}

// 关闭模态框
const closeModal = () => {
  showDetailModal.value = false
}

// 导出数据
const exportData = (item: any) => {
  alert(`导出结果 ${item.id} 的数据`)
}

// 导出详情
const exportDetail = () => {
  if (selectedItem.value) {
    alert(`导出结果 ${selectedItem.value.id} 的详情`)
  }
}

// 获取主题颜色
const getThemeColors = () => {
  const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark'
  
  if (isDarkTheme) {
    return {
      textColor: '#f7fafc',
      backgroundColor: '#1a202c',
      borderColor: '#4a5568',
      tooltipBg: '#2d3748',
      splitLineColor: '#4a5568',
      gridColor: '#4a5568'
    }
  } else {
    return {
      textColor: '#2d3748',
      backgroundColor: '#ffffff', 
      borderColor: '#e2e8f0',
      tooltipBg: '#f9fafb',
      splitLineColor: '#e2e8f0',
      gridColor: '#e2e8f0'
    }
  }
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    const colors = getThemeColors()
    // 货量趋势分析图表
    if (volumeTrendChart.value) {
      if (volumeTrendChartInstance) {
        volumeTrendChartInstance.dispose()
      }
      volumeTrendChartInstance = echarts.init(volumeTrendChart.value)
      volumeTrendChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: colors.tooltipBg,
          borderColor: colors.borderColor,
          textStyle: {
            color: colors.textColor
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['08-14', '08-15', '08-16', '08-17', '08-18', '08-19', '08-20', '08-21'],
          axisLabel: {
            color: colors.textColor
          },
          axisLine: {
            lineStyle: {
              color: colors.borderColor
            }
          },
          axisTick: {
            lineStyle: {
              color: colors.borderColor
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '总货量 (m³)',
          nameTextStyle: {
            color: colors.textColor
          },
          axisLabel: {
            color: colors.textColor
          },
          axisLine: {
            lineStyle: {
              color: colors.borderColor
            }
          },
          axisTick: {
            lineStyle: {
              color: colors.borderColor
            }
          },
          splitLine: {
            lineStyle: {
              color: colors.splitLineColor
            }
          }
        },
        series: [
          {
            name: '总货量',
            type: 'line',
            data: [10000, 12568, 18756, 14325, 5689, 15234, 11456, 20123],
            smooth: true,
            lineStyle: {
              color: '#667eea',
              width: 2
            },
            itemStyle: {
              color: '#667eea',
              borderColor: '#667eea',
              borderWidth: 2
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(102, 126, 234, 0.3)'
                }, {
                  offset: 1, color: 'rgba(102, 126, 234, 0.05)'
                }]
              }
            }
          }
        ]
      })
    }

    // 场地体积分布图表
    if (siteDistributionChart.value) {
      if (siteDistributionChartInstance) {
        siteDistributionChartInstance.dispose()
      }
      siteDistributionChartInstance = echarts.init(siteDistributionChart.value)
      siteDistributionChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: colors.tooltipBg,
          borderColor: colors.borderColor,
          textStyle: {
            color: colors.textColor
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['龙口煤场', '秦皇岛煤场', '天津港', '黄骅港', '日照港'],
          axisLabel: {
            color: colors.textColor
          },
          axisLine: {
            lineStyle: {
              color: colors.borderColor
            }
          },
          axisTick: {
            lineStyle: {
              color: colors.borderColor
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '体积 (m³)',
          nameTextStyle: {
            color: colors.textColor
          },
          axisLabel: {
            color: colors.textColor
          },
          axisLine: {
            lineStyle: {
              color: colors.borderColor
            }
          },
          axisTick: {
            lineStyle: {
              color: colors.borderColor
            }
          },
          splitLine: {
            lineStyle: {
              color: colors.splitLineColor
            }
          }
        },
        series: [
          {
            name: '体积分布',
            type: 'bar',
            data: [27802, 18756, 21328, 14325, 5689],
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: '#667eea'
                }, {
                  offset: 1, color: '#764ba2'
                }]
              },
              borderColor: colors.borderColor,
              borderWidth: 1
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(102, 126, 234, 0.5)'
              }
            }
          }
        ]
      })
    }

    // 物料类型占比图表
    if (materialDistributionChart.value) {
      if (materialDistributionChartInstance) {
        materialDistributionChartInstance.dispose()
      }
      materialDistributionChartInstance = echarts.init(materialDistributionChart.value)
      materialDistributionChartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          backgroundColor: colors.tooltipBg,
          borderColor: colors.borderColor,
          textStyle: {
            color: colors.textColor
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: colors.textColor
          }
        },
        series: [
          {
            name: '物料类型',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 65883, name: '煤炭' },
              { value: 21328, name: '矿石' },
              { value: 5689, name: '粮食' },
              { value: 2000, name: '其他' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            itemStyle: {
              color: function(params: any) {
                const pieColors = ['#667eea', '#764ba2', '#f093fb', '#f5576c']
                return pieColors[params.dataIndex % pieColors.length]
              },
              borderColor: colors.backgroundColor,
              borderWidth: 2
            },
            label: {
              color: colors.textColor
            },
            labelLine: {
              lineStyle: {
                color: colors.textColor
              }
            }
          }
        ]
      })
    }

    // 周转率分析图表
    if (accuracyChart.value) {
      if (accuracyChartInstance) {
        accuracyChartInstance.dispose()
      }
      accuracyChartInstance = echarts.init(accuracyChart.value)
      accuracyChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: colors.tooltipBg,
          borderColor: colors.borderColor,
          textStyle: {
            color: colors.textColor
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['龙口煤场', '秦皇岛煤场', '天津港', '黄骅港', '日照港'],
          axisLabel: {
            color: colors.textColor
          },
          axisLine: {
            lineStyle: {
              color: colors.borderColor
            }
          },
          axisTick: {
            lineStyle: {
              color: colors.borderColor
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '精度 (%)',
          min: 95,
          max: 100,
          nameTextStyle: {
            color: colors.textColor
          },
          axisLabel: {
            color: colors.textColor
          },
          axisLine: {
            lineStyle: {
              color: colors.borderColor
            }
          },
          axisTick: {
            lineStyle: {
              color: colors.borderColor
            }
          },
          splitLine: {
            lineStyle: {
              color: colors.splitLineColor
            }
          }
        },
        series: [
          {
            name: '测量精度',
            type: 'bar',
            data: [98.35, 98.3, 96.85, 98.0, 97.5],
            itemStyle: {
              color: function(params: any) {
                const value = params.value
                if (value >= 98) return '#22c55e'
                if (value >= 97) return '#f59e0b'
                return '#ef4444'
              },
              borderColor: colors.borderColor,
              borderWidth: 1
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(34, 197, 94, 0.5)'
              }
            }
          }
        ]
      })
    }
  })
}

// 窗口大小变化时重新渲染图表
const handleResize = () => {
  volumeTrendChartInstance?.resize()
  siteDistributionChartInstance?.resize()
  materialDistributionChartInstance?.resize()
  accuracyChartInstance?.resize()
}

// 主题变化处理
const handleThemeChange = () => {
  // 重新初始化所有图表以适应新主题
  initCharts()
}

// 监听主题变化
const setupThemeObserver = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        handleThemeChange()
      }
    })
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
  
  return observer
}

let themeObserver: MutationObserver | null = null

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
  themeObserver = setupThemeObserver()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  themeObserver?.disconnect()
  volumeTrendChartInstance?.dispose()
  siteDistributionChartInstance?.dispose()
  materialDistributionChartInstance?.dispose()
  accuracyChartInstance?.dispose()
})
</script>

<style scoped>
.result-analysis {
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

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.chart-container {
  height: 300px;
  background: var(--bg-color-tertiary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.table-card {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-container {
  overflow-x: auto;
  margin-bottom: 1rem;
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

/* 分页控件样式 */
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

.pagination-size select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
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

/* 模态框样式 */
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

.modal.show .modal-content {
  transform: scale(1);
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
  border-bottom: 1px solid var(--border-color);
}

.detail-section:last-of-type {
  border-bottom: none;
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

/* 动画效果 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .result-analysis {
    padding: 1rem;
  }
  
  .filter-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-group {
    min-width: auto;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .pagination-buttons {
    justify-content: center;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .detail-info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .analysis-table {
    font-size: 0.75rem;
  }
  
  .analysis-table th,
  .analysis-table td {
    padding: 0.5rem;
  }
  
  .action-btn {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }
}
</style>
