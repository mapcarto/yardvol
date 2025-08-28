<template>
  <div class="dashboard">
    <!-- 统计卡片网格 - 严格按照原型功能 -->
    <div class="stats-grid">
      <div class="stat-card fade-in-up">
        <div class="stat-header">
          <div class="stat-info">
            <div class="stat-title">总煤堆数量</div>
            <div class="stat-value">126</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i> +12 较上周
            </div>
          </div>
          <div class="stat-icon">
            <i class="fas fa-mountain"></i>
          </div>
        </div>
      </div>

      <div class="stat-card fade-in-up" style="animation-delay: 0.1s;">
        <div class="stat-header">
          <div class="stat-info">
            <div class="stat-title">总体积</div>
            <div class="stat-value">42,568 <span class="stat-unit">m³</span></div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i> +3,245 m³ 较上周
            </div>
          </div>
          <div class="stat-icon">
            <i class="fas fa-cubes"></i>
          </div>
        </div>
      </div>

      <div class="stat-card fade-in-up" style="animation-delay: 0.2s;">
        <div class="stat-header">
          <div class="stat-info">
            <div class="stat-title">当日体积变化</div>
            <div class="stat-value">+1,235 <span class="stat-unit">m³</span></div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i> ↑ 5.2%
            </div>
          </div>
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务状态网格 - 按照原型的简单状态显示 -->
    <div class="task-status-grid">
      <div class="task-status-card fade-in-up" style="animation-delay: 0.3s;">
        <div class="progress-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" stroke-width="8" />
            <circle 
              cx="60" 
              cy="60" 
              r="52" 
              fill="none" 
              stroke="url(#gradient1)" 
              stroke-width="8" 
              stroke-linecap="round"
              stroke-dasharray="326.73"
              stroke-dashoffset="36.4"
              transform="rotate(-90 60 60)"
              class="progress-circle"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#4facfe"/>
                <stop offset="100%" style="stop-color:#00f2fe"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="progress-text">
            <div class="progress-value">89%</div>
          </div>
        </div>
        <div class="task-status-title">已完成任务</div>
        <div class="task-count">89/100</div>
      </div>

      <div class="task-status-card fade-in-up" style="animation-delay: 0.4s;">
        <div class="progress-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" stroke-width="8" />
            <circle 
              cx="60" 
              cy="60" 
              r="52" 
              fill="none" 
              stroke="url(#gradient2)" 
              stroke-width="8" 
              stroke-linecap="round"
              stroke-dasharray="326.73"
              stroke-dashoffset="261.38"
              transform="rotate(-90 60 60)"
              class="progress-circle"
            />
            <defs>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#f093fb"/>
                <stop offset="100%" style="stop-color:#f5576c"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="progress-text">
            <div class="progress-value">20%</div>
          </div>
        </div>
        <div class="task-status-title">待执行任务</div>
        <div class="task-count">20/100</div>
      </div>

      <div class="task-status-card fade-in-up" style="animation-delay: 0.5s;">
        <div class="progress-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" stroke-width="8" />
            <circle 
              cx="60" 
              cy="60" 
              r="52" 
              fill="none" 
              stroke="url(#gradient3)" 
              stroke-width="8" 
              stroke-linecap="round"
              stroke-dasharray="326.73"
              stroke-dashoffset="306.93"
              transform="rotate(-90 60 60)"
              class="progress-circle"
            />
            <defs>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#ff9a9e"/>
                <stop offset="100%" style="stop-color:#fecfef"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="progress-text">
            <div class="progress-value">3%</div>
          </div>
        </div>
        <div class="task-status-title">异常任务</div>
        <div class="task-count">3/100</div>
      </div>
    </div>

    <!-- 货量趋势图表 -->
    <div class="chart-card fade-in-up" style="animation-delay: 0.6s;">
      <div class="chart-header">
        <div class="chart-title">货量趋势 (m³)</div>
        <div class="chart-controls">
          <button class="btn btn-secondary">7天</button>
          <button class="btn btn-secondary">30天</button>
          <button class="btn btn-primary active">90天</button>
        </div>
      </div>
      <div class="chart-content">
        <div ref="volumeChartRef" class="chart"></div>
      </div>
    </div>

    <!-- 最近任务表格 - 按照原型的简单状态 -->
    <div class="table-card fade-in-up" style="animation-delay: 0.7s;">
      <div class="table-header">
        <h2 class="table-title">最近任务</h2>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>任务ID</th>
              <th>名称</th>
              <th>创建时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in recentTasks" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.name }}</td>
              <td>{{ task.createTime }}</td>
              <td>
                <span class="status-badge" :class="'status-' + task.status">
                  {{ getStatusLabel(task.status) }}
                </span>
              </td>
              <td>
                <button class="btn btn-secondary">
                  {{ task.status === 'failed' ? '重试' : '查看详情' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 浮动操作按钮 - 原型功能 -->
    <div class="fab-container">
      <button class="fab fab-primary" title="启动采集" @click="handleStartCollection">
        <svg class="drone-icon" viewBox="0 0 24 24" fill="currentColor">
          <!-- 无人机主体 -->
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          <!-- 四个旋翼 -->
          <circle cx="6" cy="6" r="2.5" fill="currentColor"/>
          <circle cx="18" cy="6" r="2.5" fill="currentColor"/>
          <circle cx="6" cy="18" r="2.5" fill="currentColor"/>
          <circle cx="18" cy="18" r="2.5" fill="currentColor"/>
          <!-- 连接线 -->
          <path d="M8.5 8.5L10 10M15.5 8.5L14 10M8.5 15.5L10 14M15.5 15.5L14 14" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const volumeChartRef = ref<HTMLDivElement>()

// 最近任务数据 - 简化状态，只有完成/进行中/失败
const recentTasks = ref([
  {
    id: 'T001',
    name: '龙口煤场扫描',
    createTime: '2025-08-15 09:30',
    status: 'completed'
  },
  {
    id: 'T002',
    name: '秦皇岛煤场分析',
    createTime: '2025-08-16 10:15',
    status: 'completed'
  },
  {
    id: 'T003',
    name: '天津港三维重建',
    createTime: '2025-08-17 08:45',
    status: 'pending'
  },
  {
    id: 'T004',
    name: '黄骅港煤堆测量',
    createTime: '2025-08-17 13:20',
    status: 'pending'
  },
  {
    id: 'T005',
    name: '日照港数据处理',
    createTime: '2025-08-18 09:00',
    status: 'failed'
  }
])

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    completed: '已完成',
    pending: '进行中',
    failed: '失败'
  }
  return labels[status] || status
}

// 浮动按钮事件处理
const handleStartCollection = () => {
  console.log('启动采集')
  // 跳转到数据采集页面或启动采集流程
}

// 初始化图表 - 完全按照原型样式
const initVolumeChart = () => {
  if (!volumeChartRef.value) return

  const chart = echarts.init(volumeChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'transparent',
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      display: true,
      position: 'top'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisLabel: {
        color: '#718096'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisLabel: {
        color: '#718096',
        formatter: function(value: number) {
          return value.toLocaleString() + ' m³'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      }
    },
    series: [{
      name: '货量趋势',
      type: 'line',
      data: [32000, 34000, 36000, 38000, 40000, 41000, 42000, 42568, 43000, 43500, 44000, 45000],
      smooth: true,
      lineStyle: {
        color: '#667eea',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102, 126, 234, 0.1)' },
          { offset: 1, color: 'rgba(102, 126, 234, 0.01)' }
        ])
      },
      itemStyle: {
        color: '#667eea',
        borderColor: '#ffffff',
        borderWidth: 2
      },
      emphasis: {
        itemStyle: {
          radius: 8
        }
      }
    }]
  }

  chart.setOption(option)

  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

onMounted(() => {
  nextTick(() => {
    initVolumeChart()
  })
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 2rem;
  background: transparent;
  min-height: calc(100vh - 64px);
}

// 添加淡入动画
.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
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

// 统计卡片样式 - 完全匹配原型
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-info {
  flex: 1;
  
  .stat-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }
  
  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    
    .stat-unit {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
  }
  
  .stat-change {
    font-size: 0.875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    &.positive {
      color: #10b981;
    }
    
    &.negative {
      color: #ef4444;
    }
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: var(--shadow-md);
}

// 任务状态网格 - 简化为原型的样式
.task-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.task-status-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  text-align: center;
  border: 1px solid var(--border-color);
}

.progress-ring {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  position: relative;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  .progress-circle {
    transition: stroke-dashoffset 1s ease;
  }
  
  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    .progress-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }
  }
}

.task-status-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.task-count {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

// 图表卡片
.chart-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.chart-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.chart-content {
  flex: 1;
  
  .chart {
    width: 100%;
    height: 250px;
  }
}

// 按钮样式
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: var(--shadow-md);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &.active {
    background: var(--primary-gradient);
  }
}

.btn-secondary {
  background: var(--border-color);
  color: var(--text-secondary);
  
  &:hover {
    background: var(--text-secondary);
    color: white;
  }
}

// 表格样式
.table-card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.table-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.table-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 1rem 2rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    background: var(--bg-color-secondary);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  tbody tr {
    transition: background-color 0.2s ease;
    
    &:hover {
      background: var(--bg-color-secondary);
    }
  }
}

// 状态标签
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.status-completed {
    background: #dcfce7;
    color: #166534;
  }
  
  &.status-pending {
    background: #fef3c7;
    color: #92400e;
  }
  
  &.status-failed {
    background: #fee2e2;
    color: #991b1b;
  }
}

// 浮动操作按钮
.fab-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1000;
}

.fab {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: var(--shadow-xl);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .drone-icon {
    width: 1.8rem;
    height: 1.8rem;
    filter: brightness(0) invert(1);
  }
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
  
  &.fab-primary {
    background: var(--primary-gradient);
  }
  
  &.fab-secondary {
    background: var(--secondary-gradient);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .stats-grid,
  .task-status-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>