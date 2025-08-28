/* 修复创建任务模态框中的下拉框样式 */
[data-theme="light"] .data-source-section .form-control {
  background-color: #ffffff !important;
  color: #1f2937 !important;
}

[data-theme="light"] .data-source-section .form-control option {
  background-color: #ffffff !important;
  color: #1f2937 !important;
}
<template>
  <div class="task-management-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          class="search-input" 
          placeholder="搜索任务..."
          v-model="searchKeyword"
          @input="handleSearch"
        >
      </div>
      <div class="toolbar-actions">
        <button class="btn btn-secondary" @click="toggleAdvancedFilter">
          <i class="fas fa-filter"></i>
          高级筛选
        </button>
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="fas fa-plus-circle"></i>
          创建任务
        </button>
      </div>
    </div>

    <!-- 高级筛选卡片 -->
    <div class="advanced-filter-card" :class="{ show: showAdvancedFilter }">
      <div class="form-group">
        <label for="filterType">任务类型</label>
        <el-select v-model="filterForm.type" placeholder="全部类型" class="form-control">
          <el-option value="all" label="全部类型" />
          <el-option value="QLC" label="全流程任务（QLC）" />
          <el-option value="SWF" label="三维重建+分堆（SWF）" />
          <el-option value="QTL" label="清表+体积量算（QTL）" />
        </el-select>
      </div>
      <div class="form-group">
        <label for="filterYard">堆场名称</label>
        <el-select v-model="filterForm.yard" placeholder="全部堆场" class="form-control">
          <el-option value="all" label="全部堆场" />
          <el-option value="longkou" label="龙口" />
          <el-option value="tianjin" label="天津" />
          <el-option value="rizhao" label="日照" />
          <el-option value="huanghua" label="黄骅" />
          <el-option value="qinhuangdao" label="秦皇岛" />
        </el-select>
      </div>
      <div class="form-group">
        <label for="filterDate">采集日期</label>
        <el-date-picker 
          v-model="filterForm.date" 
          type="date" 
          placeholder="选择日期" 
          class="form-control"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </div>
      <div class="form-group">
        <label for="filterSequence">第次</label>
        <el-select v-model="filterForm.sequence" placeholder="全部" class="form-control">
          <el-option value="all" label="全部" />
          <el-option value="1" label="第1次" />
          <el-option value="2" label="第2次" />
        </el-select>
      </div>
      <div class="filter-actions">
        <button class="btn btn-primary" @click="applyFilter">
          <i class="fas fa-check"></i>
          应用筛选
        </button>
        <button class="btn btn-secondary" @click="resetFilter">
          <i class="fas fa-redo"></i>
          重置
        </button>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div class="batch-actions-bar" :class="{ show: selectedTasks.length > 0 }">
      <span>已选择 <span class="selected-count">{{ selectedTasks.length }}</span> 个任务</span>
      <div class="batch-actions">
        <button class="btn btn-secondary" @click="batchRetry">
          <i class="fas fa-redo-alt"></i>
          重试
        </button>
        <button class="btn btn-secondary" @click="batchDelete">
          <i class="fas fa-trash"></i>
          删除
        </button>
      </div>
    </div>

    <!-- 进度图例 -->
    <div class="progress-legend">
      <div class="legend-title">任务进度图例</div>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-color color-3d"></div>
          <span>三维重建</span>
        </div>
        <div class="legend-item">
          <div class="legend-color color-pile"></div>
          <span>分堆</span>
        </div>
        <div class="legend-item">
          <div class="legend-color color-clear"></div>
          <span>清表</span>
        </div>
        <div class="legend-item">
          <div class="legend-color color-volume"></div>
          <span>体积计算</span>
        </div>
      </div>
    </div>

    <!-- 过滤标签 -->
    <div class="filter-tabs">
      <div 
        class="filter-tab" 
        :class="{ active: activeTab === 'all' }" 
        @click="setActiveTab('all')"
      >
        全部任务
      </div>
      <div 
        class="filter-tab" 
        :class="{ active: activeTab === 'pending' }" 
        @click="setActiveTab('pending')"
      >
        进行中
      </div>
      <div 
        class="filter-tab" 
        :class="{ active: activeTab === 'completed' }" 
        @click="setActiveTab('completed')"
      >
        已完成
      </div>
      <div 
        class="filter-tab" 
        :class="{ active: activeTab === 'failed' }" 
        @click="setActiveTab('failed')"
      >
        已失败
      </div>
    </div>

    <!-- 任务表格 -->
    <div class="table-card">
      <div class="table-container">
        <table class="task-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  @change="toggleSelectAll"
                  :checked="isAllSelected"
                >
              </th>
              <th>名称</th>
              <th>类型</th>
              <th>数据来源</th>
              <th>创建时间</th>
              <th>状态</th>
              <th>进度</th>
              <th>优先级</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="task in filteredTasks" 
              :key="task.id"
              :data-status="task.status"
            >
              <td>
                <input 
                  type="checkbox" 
                  :value="task.id"
                  v-model="selectedTasks"
                >
              </td>
              <td><strong>{{ task.name }}</strong></td>
              <td>{{ getTypeLabel(task.type) }}</td>
              <td>{{ task.dataSource }}</td>
              <td>{{ task.createTime }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(task.status)">
                  <i :class="getStatusIcon(task.status)"></i>
                  {{ getStatusLabel(task.status) }}
                </span>
              </td>
              <td>
                <div class="progress-container">
                  <div class="progress-steps">
                    <div 
                      v-for="(step, index) in getProgressSteps(task.type)"
                      :key="index"
                      class="step-segment"
                      :class="getStepClass(step, task, index)"
                    ></div>
                  </div>
                </div>
              </td>
              <td>{{ getPriorityLabel(task.priority) }}</td>
              <td>
                <div class="action-buttons">
                  <!-- 已完成的任务：显示3D按钮 -->
                  <button 
                    v-if="task.status === 'completed'"
                    class="action-btn action-btn-completed" 
                    @click="viewTask(task)"
                    style="background-color: #9333ea; color: white;"
                  >
                    <i class="fas fa-cube"></i>3D
                  </button>
                  
                  <!-- 已失败的任务：显示重试 -->
                  <button 
                    v-if="task.status === 'failed'"
                    class="action-btn action-btn-retry" 
                    @click="retryTask(task)"
                    style="background-color: #10b981; color: white;"
                  >
                    <i class="fas fa-redo-alt"></i>重试
                  </button>
                  
                  <!-- 进行中的任务：显示蓝色查看按钮 -->
                  <button 
                    v-if="task.status === 'pending'"
                    class="action-btn action-btn-view" 
                    @click="viewTask(task)"
                    style="background-color: #3b82f6; color: white;"
                  >
                    <i class="fas fa-eye"></i>查看
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination">
        <div class="pagination-info">
          共 <span class="pagination-total">{{ totalTasks }}</span> 条记录
        </div>
        <div class="pagination-controls">
          <div class="page-size-selector">
            <span>每页</span>
            <el-select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
              <el-option value="10" label="10" />
              <el-option value="20" label="20" />
              <el-option value="50" label="50" />
              <el-option value="100" label="100" />
            </el-select>
            <span>条</span>
          </div>
          <button class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="pagination-pages">
            <button 
              v-for="page in displayedPages" 
              :key="page" 
              class="page-btn" 
              :class="{ active: currentPage === page }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <button class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
          <div class="pagination-jump">
            <span>前往</span>
            <input 
              type="number" 
              class="jump-input" 
              v-model="jumpToPage" 
              min="1" 
              :max="totalPages"
              @keyup.enter="handleJumpToPage"
            >
            <span>页</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建任务模态框 - 改进版 -->
    <div class="modal" :class="{ show: showCreateModal }" @click="closeModal">
      <div class="modal-content create-task-modal" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-plus-circle"></i> 创建新任务</h2>
          <button class="modal-close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="create-task-steps">
          <!-- 步骤1: 选择任务类型 -->
          <div class="step-section">
            <div class="step-header">
              <span class="step-number">1</span>
              <h3>选择任务类型</h3>
            </div>
            <div class="task-type-cards">
              <div 
                class="task-type-card" 
                :class="{ active: createForm.type === 'QLC' }"
                @click="createForm.type = 'QLC'"
              >
                <div class="card-icon">
                  <i class="fas fa-cogs"></i>
                </div>
                <div class="card-content">
                  <h4>全流程任务</h4>
                  <p class="card-code">QLC</p>
                  <div class="card-steps">
                    <span class="step-badge step-3d">三维重建</span>
                    <span class="step-badge step-pile">分堆</span>
                    <span class="step-badge step-clear">清表</span>
                    <span class="step-badge step-volume">体积计算</span>
                  </div>
                  <p class="card-desc">完整的处理流程，从原始影像到最终结果</p>
                </div>
              </div>
              
              <div 
                class="task-type-card" 
                :class="{ active: createForm.type === 'SWF' }"
                @click="createForm.type = 'SWF'"
              >
                <div class="card-icon">
                  <i class="fas fa-layer-group"></i>
                </div>
                <div class="card-content">
                  <h4>三维重建+分堆</h4>
                  <p class="card-code">SWF</p>
                  <div class="card-steps">
                    <span class="step-badge step-3d">三维重建</span>
                    <span class="step-badge step-pile">分堆</span>
                  </div>
                  <p class="card-desc">仅进行三维重建和分堆处理</p>
                </div>
              </div>
              
              <div 
                class="task-type-card" 
                :class="{ active: createForm.type === 'QTL' }"
                @click="createForm.type = 'QTL'"
              >
                <div class="card-icon">
                  <i class="fas fa-calculator"></i>
                </div>
                <div class="card-content">
                  <h4>清表+体积量算</h4>
                  <p class="card-code">QTL</p>
                  <div class="card-steps">
                    <span class="step-badge step-clear">清表</span>
                    <span class="step-badge step-volume">体积计算</span>
                  </div>
                  <p class="card-desc">基于已有模型进行清表和体积计算</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤2: 选择数据源 -->
          <div class="step-section" v-if="createForm.type">
            <div class="step-header">
              <span class="step-number">2</span>
              <h3>选择数据源</h3>
            </div>
            <div class="data-source-section">
              <div class="form-group">
                <label>选择堆场</label>
                <el-select v-model="createForm.yard" placeholder="请选择堆场" class="form-control" clearable>
                  <el-option 
                    v-for="yard in yardOptions" 
                    :key="yard.value" 
                    :value="yard.value"
                    :label="yard.label"
                  />
                </el-select>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>采集日期</label>
                  <el-date-picker
                    v-model="createForm.date"
                    type="date"
                    placeholder="选择日期"
                    class="form-control"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    :disabled-date="(time: Date) => time.getTime() > Date.now()"
                    popper-class="custom-date-picker"
                  />
                </div>
                <div class="form-group">
                  <label>第次</label>
                  <el-select v-model="createForm.sequence" placeholder="请选择第次" class="form-control">
                    <el-option value="01" label="第1次" />
                    <el-option value="02" label="第2次" />
                    <el-option value="03" label="第3次" />
                  </el-select>
                </div>
              </div>
              
              <!-- 智能数据源推荐 -->
              <div class="data-recommendations" v-if="createForm.yard && createForm.date">
                <h4><i class="fas fa-lightbulb"></i> 数据源检查</h4>
                
                <!-- 数据状态提示 -->
                <div class="data-status-alert" v-if="!hasRequiredDataTypes">
                  <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="alert-content">
                      <div class="alert-title">缺少所需数据</div>
                      <div class="alert-message">
                        当前任务类型需要：
                        <span v-for="(type, index) in getRequiredDataTypes(createForm.type)" :key="type">
                          <strong>{{ getDataTypeLabel(type) }}</strong>
                          <span v-if="index < getRequiredDataTypes(createForm.type).length - 1">、</span>
                        </span>
                        <br>
                        缺少：
                        <span v-for="(type, index) in getMissingDataTypes" :key="type" class="missing-type">
                          {{ getDataTypeLabel(type) }}
                          <span v-if="index < getMissingDataTypes.length - 1">、</span>
                        </span>
                        <br>
                        <small>请先在数据管理中上传相应数据后再创建任务</small>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 数据源列表 -->
                <div v-if="hasRequiredDataTypes" class="recommended-data-list">
                  <div class="data-status-success">
                    <i class="fas fa-check-circle"></i>
                    检测到可用数据，已智能选择兼容数据源：
                  </div>
                  <div 
                    v-for="data in getRecommendedDataSources()" 
                    :key="data.value"
                    class="data-item"
                    :class="{ 
                      active: createForm.dataSource === data.value,
                      compatible: isDataCompatible(data.type)
                    }"
                    @click="createForm.dataSource = data.value"
                  >
                    <div class="data-icon">
                      <i :class="getDataIcon(data.type)"></i>
                    </div>
                    <div class="data-info">
                      <span class="data-name">{{ data.label }}</span>
                      <span class="data-type">{{ getDataTypeLabel(data.type) }}</span>
                    </div>
                    <div class="compatibility-badge" v-if="isDataCompatible(data.type)">
                      <i class="fas fa-check"></i>
                    </div>
                    <div class="auto-selected-badge" v-if="createForm.dataSource === data.value && isDataCompatible(data.type)">
                      <i class="fas fa-star"></i>
                      已选中
                    </div>
                  </div>
                  <div class="data-selection-hint">
                    <i class="fas fa-info-circle"></i>
                    更改堆场、日期、第次时会重新验证数据源
                  </div>
                </div>
                
                <!-- 无数据时的提示 -->
                <div v-if="hasRequiredDataTypes && getRecommendedDataSources().length === 0" class="no-data-message">
                  <i class="fas fa-info-circle"></i>
                  当前选择的堆场和日期没有可用的数据源
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤3: 任务配置 -->
          <div class="step-section" v-if="createForm.type && createForm.dataSource">
            <div class="step-header">
              <span class="step-number">3</span>
              <h3>任务配置</h3>
            </div>
            <div class="task-config-section">
              <div class="form-group">
                <label>优先级</label>
                <div class="priority-selector">
                  <div 
                    v-for="priority in priorityOptions" 
                    :key="priority.value"
                    class="priority-option"
                    :class="{ 
                      active: createForm.priority === priority.value,
                      [`priority-${priority.value}`]: true
                    }"
                    @click="createForm.priority = priority.value"
                  >
                    <i :class="priority.icon"></i>
                    <span>{{ priority.label }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 任务预览 -->
              <div class="task-preview">
                <h4><i class="fas fa-eye"></i> 任务预览</h4>
                <div class="preview-card">
                  <div class="preview-header">
                    <div class="preview-name">{{ getPreviewTaskName() }}</div>
                    <div class="preview-type">{{ getTypeLabel(createForm.type) }}</div>
                  </div>
                  <div class="preview-details">
                    <div class="detail-item">
                      <span class="detail-label">数据源:</span>
                      <span class="detail-value">{{ createForm.dataSource }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">优先级:</span>
                      <span class="detail-value">{{ getPriorityLabel(createForm.priority) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">处理步骤:</span>
                      <div class="preview-steps">
                        <span 
                          v-for="step in getProgressSteps(createForm.type)" 
                          :key="step"
                          class="preview-step"
                          :class="`step-${step}`"
                        >
                          {{ getStepLabel(step) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            <i class="fas fa-times"></i> 取消
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            :disabled="!isFormValid"
            @click="createTask"
          >
            <i class="fas fa-plus"></i> 创建任务
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

// 初始化路由
const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const showAdvancedFilter = ref(false)
const showCreateModal = ref(false)
const activeTab = ref('all')
const selectedTasks = ref<number[]>([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const jumpToPage = ref<number | string>('')


// 筛选表单
const filterForm = reactive({
  type: 'all',
  yard: 'all',
  date: '',
  sequence: 'all'
})

// 创建任务表单
const createForm = reactive({
  yard: '',
  date: '',
  sequence: '01',
  type: '',
  dataSource: '',
  priority: 'medium'
})

// 堆场选项
const yardOptions = ref([
  { value: '龙口煤场', label: '龙口煤场' },
  { value: '天津港', label: '天津港' },
  { value: '日照港', label: '日照港' },
  { value: '黄骅港', label: '黄骅港' },
  { value: '青岛港', label: '青岛港' },
  { value: '秦皇岛煤场', label: '秦皇岛煤场' }
])

// 优先级选项
const priorityOptions = ref([
  { value: 'low', label: '低', icon: 'fas fa-arrow-down' },
  { value: 'medium', label: '中', icon: 'fas fa-minus' },
  { value: 'high', label: '高', icon: 'fas fa-arrow-up' },
  { value: 'urgent', label: '紧急', icon: 'fas fa-exclamation' }
])

// 任务列表数据 - 使用新的命名规范 QLC/SWF/QTL
const taskList = ref([
  {
    id: 1,
    name: 'QLC-龙口煤场-2025-08-15-01-T001',
    type: 'QLC',
    dataSource: 'YX-龙口煤场-2025-08-15-01',
    createTime: '2025-08-15 09:30',
    status: 'completed',
    priority: 'medium',
    progress: { current: 4, total: 4, steps: ['3d', 'pile', 'clear', 'volume'] }
  },
  {
    id: 2,
    name: 'QTL-天津港-2025-08-16-01-T001',
    type: 'QTL',
    dataSource: 'MX-天津港-2025-08-16-01',
    createTime: '2025-08-16 10:15',
    status: 'completed',
    priority: 'high',
    progress: { current: 2, total: 2, steps: ['clear', 'volume'] }
  },
  {
    id: 3,
    name: 'QLC-日照港-2025-08-17-01-T001',
    type: 'QLC',
    dataSource: 'YX-日照港-2025-08-17-01',
    createTime: '2025-08-17 08:45',
    status: 'pending',
    priority: 'urgent',
    progress: { current: 2, total: 4, steps: ['3d', 'pile', 'clear', 'volume'] }
  },
  {
    id: 4,
    name: 'QTL-黄骅港-2025-08-17-02-T001',
    type: 'QTL',
    dataSource: 'MX-黄骅港-2025-08-17-02',
    createTime: '2025-08-17 14:20',
    status: 'pending',
    priority: 'medium',
    progress: { current: 1, total: 2, steps: ['clear', 'volume'] }
  },
  {
    id: 5,
    name: 'QTL-青岛港-2025-08-17-01-T002',
    type: 'QTL',
    dataSource: 'MX-青岛港-2025-08-17-01',
    createTime: '2025-08-17 16:45',
    status: 'failed',
    priority: 'high',
    progress: { current: 0, total: 2, steps: ['clear', 'volume'] }
  },
  {
    id: 6,
    name: 'SWF-秦皇岛煤场-2025-08-18-01-T001',
    type: 'SWF',
    dataSource: 'YX-秦皇岛煤场-2025-08-18-01',
    createTime: '2025-08-18 09:30',
    status: 'pending',
    priority: 'low',
    progress: { current: 1, total: 2, steps: ['3d', 'pile'] }
  },
  {
    id: 7,
    name: 'QLC-龙口煤场-2025-08-18-02-T001',
    type: 'QLC',
    dataSource: 'YX-龙口煤场-2025-08-18-02',
    createTime: '2025-08-18 11:15',
    status: 'completed',
    priority: 'medium',
    progress: { current: 4, total: 4, steps: ['3d', 'pile', 'clear', 'volume'] }
  }
])

// 计算属性
const filteredData = computed(() => {
  let filtered = taskList.value

  // 按状态筛选
  if (activeTab.value !== 'all') {
    filtered = filtered.filter(task => task.status === activeTab.value)
  }

  // 按搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(task => 
      task.name.toLowerCase().includes(keyword) ||
      task.dataSource.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 分页数据
const totalTasks = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalTasks.value / pageSize.value))

const displayedPages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  
  if (totalPages.value <= maxVisiblePages) {
    // 如果总页数小于等于最大可见页数，显示所有页码
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // 否则，显示当前页附近的页码
    let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)
    
    // 调整起始页，确保显示足够的页码
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
  }
  
  return pages
})

const filteredTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const isAllSelected = computed(() => {
  return filteredTasks.value.length > 0 && selectedTasks.value.length === filteredTasks.value.length
})

// 方法
const getCurrentDate = () => {
  const today = new Date()
  return today.getFullYear() + '-' + 
         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
         String(today.getDate()).padStart(2, '0')
}

const getPreviewTaskName = () => {
  if (!createForm.yard || !createForm.sequence || !createForm.type) {
    return '请选择任务类型、堆场和日期'
  }
  
  // 获取任务类型前缀
  const prefix = createForm.type
  
  // 使用选中的日期或当前日期
  const date = createForm.date || getCurrentDate()
  
  // 任务序号（这里简化为T001）
  const taskSequence = 'T001'
  
  return `${prefix}-${createForm.yard}-${date}-${createForm.sequence}-${taskSequence}`
}

// 获取推荐的数据源
const getRecommendedDataSources = () => {
  if (!createForm.yard || !createForm.date) {
    return []
  }
  
  const { type, yard, date } = createForm
  
  // 模拟已上传的数据源（实际应该从数据管理API获取）
  const existingDataSources = [
    // 影像数据
    { value: `YX-龙口煤场-2025-08-22-01`, label: `YX-龙口煤场-2025-08-22-01`, type: 'image' },
    { value: `YX-天津港-2025-08-21-01`, label: `YX-天津港-2025-08-21-01`, type: 'image' },
    { value: `YX-日照港-2025-08-20-01`, label: `YX-日照港-2025-08-20-01`, type: 'image' },
    // 模型数据
    { value: `MX-龙口煤场-2025-08-22-01`, label: `MX-龙口煤场-2025-08-22-01`, type: 'model' },
    { value: `MX-天津港-2025-08-21-01`, label: `MX-天津港-2025-08-21-01`, type: 'model' },
    // 点云数据
    { value: `DY-龙口煤场-2025-08-22-01`, label: `DY-龙口煤场-2025-08-22-01`, type: 'pointcloud' },
    { value: `DY-天津港-2025-08-21-01`, label: `DY-天津港-2025-08-21-01`, type: 'pointcloud' }
  ]
  
  // 根据任务类型筛选需要的数据类型
  const requiredDataTypes = getRequiredDataTypes(type)
  
  // 筛选出匹配堆场和日期的已存在数据
  const matchingData = existingDataSources.filter(data => {
    // 检查数据类型是否符合任务需求
    if (!requiredDataTypes.includes(data.type)) {
      return false
    }
    
    // 检查堆场名称是否匹配
    const dataYard = data.value.split('-')[1]
    if (dataYard !== yard) {
      return false
    }
    
    // 检查日期是否匹配（允许选择历史数据）
    const dataDate = data.value.split('-')[2]
    return dataDate <= date
  })
  
  return matchingData
}

// 获取任务类型需要的数据类型
const getRequiredDataTypes = (taskType: string) => {
  switch (taskType) {
    case 'QLC':  // 全流程任务：需要原始影像
    case 'SWF':  // 三维重建+分堆：需要原始影像
      return ['image']
    case 'QTL':  // 清表+体积量算：需要模型数据和点云数据
      return ['model', 'pointcloud']
    default:
      return []
  }
}

// 检查数据类型是否兼容
const isDataCompatible = (dataType: string) => {
  const { type } = createForm
  const requiredTypes = getRequiredDataTypes(type)
  return requiredTypes.includes(dataType)
}

// 获取数据类型图标
const getDataIcon = (dataType: string) => {
  const iconMap: Record<string, string> = {
    image: 'fas fa-image',
    model: 'fas fa-cube',
    pointcloud: 'fas fa-cloud'
  }
  return iconMap[dataType] || 'fas fa-file'
}

// 获取数据类型标签
const getDataTypeLabel = (dataType: string) => {
  const labelMap: Record<string, string> = {
    image: '原始影像',
    model: '模型数据',
    pointcloud: '点云数据'
  }
  return labelMap[dataType] || dataType
}

// 获取步骤标签
const getStepLabel = (step: string) => {
  const labelMap: Record<string, string> = {
    '3d': '三维重建',
    'pile': '分堆',
    'clear': '清表',
    'volume': '体积计算'
  }
  return labelMap[step] || step
}

// 表单验证
const isFormValid = computed(() => {
  // 基本字段验证
  const basicValid = createForm.type && createForm.yard && createForm.date
  
  // 检查是否有所需的数据类型
  const hasRequiredData = hasRequiredDataTypes.value
  
  if (!basicValid || !hasRequiredData) {
    return false
  }
  
  // 获取当前推荐的数据源
  const recommendedData = getRecommendedDataSources()
  const compatibleData = recommendedData.filter(data => isDataCompatible(data.type))
  
  // 如果没有兼容的数据源，表单无效
  if (compatibleData.length === 0) {
    return false
  }
  
  // 检查当前选择的数据源是否还在推荐列表中且兼容
  const currentDataValid = recommendedData.some(data => 
    data.value === createForm.dataSource && isDataCompatible(data.type)
  )
  
  // 如果当前数据源无效，自动选择第一个兼容的
  if (!currentDataValid) {
    createForm.dataSource = compatibleData[0].value
  }
  
  return createForm.dataSource && currentDataValid
})

// 检查是否有所需的数据类型
const hasRequiredDataTypes = computed(() => {
  if (!createForm.type || !createForm.yard || !createForm.date) {
    return false
  }
  
  const requiredTypes = getRequiredDataTypes(createForm.type)
  const availableData = getRecommendedDataSources()
  
  // 检查每个需要的数据类型是否都有对应的数据
  return requiredTypes.every(requiredType => 
    availableData.some(data => data.type === requiredType)
  )
})

// 获取缺失的数据类型
const getMissingDataTypes = computed(() => {
  if (!createForm.type || !createForm.yard || !createForm.date) {
    return []
  }
  
  const requiredTypes = getRequiredDataTypes(createForm.type)
  const availableData = getRecommendedDataSources()
  const availableTypes = [...new Set(availableData.map(data => data.type))]
  
  return requiredTypes.filter(requiredType => !availableTypes.includes(requiredType))
})

const getProgressSteps = (type: string) => {
  const stepMap: Record<string, string[]> = {
    QLC: ['3d', 'pile', 'clear', 'volume'],
    SWF: ['3d', 'pile'],
    QTL: ['clear', 'volume']
  }
  return stepMap[type] || []
}

const getStepClass = (step: string, task: any, index: number) => {
  const classes = [`step-${step}`]
  
  if (index < task.progress.current) {
    classes.push('completed')
  } else if (index === task.progress.current && task.status === 'pending') {
    classes.push('active')
  } else {
    classes.push('pending')
  }
  
  return classes.join(' ')
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    QLC: '全流程任务',
    SWF: '三维重建+分堆',
    QTL: '清表+体积量算'
  }
  return typeMap[type] || type
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '进行中',
    completed: '已完成',
    failed: '已失败',
    canceled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  return `status-${status}`
}

const getStatusIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    pending: 'fas fa-spinner fa-spin',
    completed: 'fas fa-check-circle',
    failed: 'fas fa-exclamation-triangle',
    canceled: 'fas fa-ban'
  }
  return iconMap[status] || 'fas fa-circle'
}

const getPriorityLabel = (priority: string) => {
  const priorityMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return priorityMap[priority] || priority
}

// 事件处理
const toggleAdvancedFilter = () => {
  showAdvancedFilter.value = !showAdvancedFilter.value
}

const setActiveTab = (tab: string) => {
  activeTab.value = tab
  currentPage.value = 1 // 切换标签时重置页码
}

// 分页方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    jumpToPage.value = ''
  }
}

const handlePageSizeChange = () => {
  currentPage.value = 1 // 改变每页条数时重置到第一页
}

const handleJumpToPage = () => {
  const page = Number(jumpToPage.value)
  if (page && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    jumpToPage.value = ''
  } else {
    ElMessage.warning('请输入有效的页码')
  }
}

const toggleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedTasks.value = filteredTasks.value.map(task => task.id)
  } else {
    selectedTasks.value = []
  }
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const applyFilter = () => {
  ElMessage.success('筛选条件已应用')
}

const resetFilter = () => {
  Object.assign(filterForm, {
    type: 'all',
    yard: 'all',
    date: '',
    sequence: 'all'
  })
  ElMessage.success('筛选条件已重置')
}

const createTask = () => {
  // 简化验证，因为按钮的disabled状态已经处理了验证
  if (!isFormValid.value) {
    ElMessage.error('请检查表单信息是否完整！')
    return
  }
  
  const taskName = getPreviewTaskName()
  ElMessage.success(`创建任务成功！任务名称: ${taskName}`)
  closeModal()
}

// 打开创建任务模态框
const openCreateModal = () => {
  showCreateModal.value = true
  // 设置默认日期为今天
  createForm.date = getCurrentDate()
}

const closeModal = () => {
  showCreateModal.value = false
  Object.assign(createForm, {
    yard: '',
    date: '',
    sequence: '01',
    type: '',
    dataSource: '',
    priority: 'medium'
  })
}

const viewTask = (task: any) => {
  // 根据任务状态执行不同操作
  if (task.status === 'completed') {
    // 已完成任务：点击3D按钮跳转到三维展示页面
    router.push({
      path: '/3d-visualization',
      query: {
        dataId: task.id,
        dataName: task.name,
        dataType: task.type,
        site: task.yard,
        date: task.date,
        sequence: task.sequence || '01'
      }
    })
  } else {
    // 其他状态：显示任务详情
    ElMessageBox.alert(
      `<div class="task-detail-popup">
        <div class="task-detail-item"><strong>任务名称:</strong> ${task.name}</div>
        <div class="task-detail-item"><strong>任务类型:</strong> ${getTypeLabel(task.type)}</div>
        <div class="task-detail-item"><strong>堆场:</strong> ${task.yard}</div>
        <div class="task-detail-item"><strong>创建时间:</strong> ${task.createTime}</div>
        <div class="task-detail-item"><strong>当前状态:</strong> ${getStatusLabel(task.status)}</div>
        <div class="task-detail-item"><strong>进度:</strong> ${task.progress ? Math.round(task.progress.current / task.progress.total * 100) : 0}%</div>
      </div>`,
      '任务状态详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭'
      }
    )
  }
}

const retryTask = (task: any) => {
  ElMessage.success(`任务 ${task.name} 已重新启动`)
}



const batchRetry = () => {
  ElMessage.success(`批量重试 ${selectedTasks.value.length} 个任务`)
  selectedTasks.value = []
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedTasks.value.length} 个任务吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('批量删除成功')
    selectedTasks.value = []
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

onMounted(() => {
  // 初始化
})

// 监听关键字段变更，清除数据源选择以触发重新验证
watch(
  () => [createForm.yard, createForm.date, createForm.sequence],
  (newValues, oldValues) => {
    // 只有在值真正变化时才清除数据源
    if (oldValues && oldValues.some((oldVal, index) => oldVal !== newValues[index])) {
      // 清除之前选择的数据源，让系统重新验证和自动选择
      createForm.dataSource = ''
    }
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.task-management-container {
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
}

/* 工具栏 */
.toolbar {
  background: var(--card-bg);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--border-color);
}

.search-container {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--bg-color-secondary);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--card-bg);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.toolbar-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: var(--bg-color-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--text-secondary);
  color: white;
}

/* 高级筛选 */
.advanced-filter-card {
  background: var(--card-bg);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  display: none;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.advanced-filter-card.show {
  display: flex;
}

.form-group {
  flex: 1;
  min-width: 180px;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 0.9rem;
  background: var(--bg-color-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--card-bg);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-actions {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
}

/* 批量操作栏 */
.batch-actions-bar {
  background: var(--card-bg);
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid var(--border-color);
  display: none;
}

.batch-actions-bar.show {
  display: flex;
}

.selected-count {
  font-weight: 600;
  color: var(--primary-color);
}

.batch-actions {
  display: flex;
  gap: 0.5rem;
}

/* 进度图例 */
.progress-legend {
  background: var(--card-bg);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.legend-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.legend-items {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.legend-color {
  width: 16px;
  height: 6px;
  border-radius: 3px;
}

.legend-color.color-3d {
  background: #22c55e;
}

.legend-color.color-pile {
  background: #a855f7;
}

.legend-color.color-clear {
  background: #ef4444;
}

.legend-color.color-volume {
  background: #3b82f6;
}

/* 过滤标签 */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.5rem 1rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 25px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-secondary);
}

.filter-tab.active {
  background: var(--primary-gradient);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-md);
}

.filter-tab:hover:not(.active) {
  background: var(--bg-color-secondary);
  transform: translateY(-1px);
}

/* 任务表格 */
.table-card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.table-container {
  overflow-x: auto;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.task-table th,
.task-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.task-table th {
  background: var(--bg-color-secondary);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-table tbody tr:hover {
  background: var(--bg-color-secondary);
}

.task-table tbody tr[data-status="completed"] {
  background: rgba(34, 197, 94, 0.05);
}

.task-table tbody tr[data-status="failed"] {
  background: rgba(239, 68, 68, 0.05);
}

.task-table tbody tr[data-status="pending"] {
  background: rgba(59, 130, 246, 0.05);
}

/* 状态标签 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.status-pending {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.status-completed {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-badge.status-failed {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge.status-canceled {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

/* 进度条 */
.progress-container {
  width: 120px;
}

.progress-steps {
  display: flex;
  gap: 2px;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--bg-color-secondary);
}

.step-segment {
  flex: 1;
  transition: all 0.3s ease;
}

/* 进度条颜色 - 严格按照图例 */
.step-segment.step-3d.completed {
  background: #22c55e; /* 三维重建 - 绿色 */
}

.step-segment.step-pile.completed {
  background: #a855f7; /* 分堆 - 紫色 */
}

.step-segment.step-clear.completed {
  background: #ef4444; /* 清表 - 红色 */
}

.step-segment.step-volume.completed {
  background: #3b82f6; /* 体积计算 - 蓝色 */
}

/* 当前进行中的步骤 - 使用对应颜色但带动画 */
.step-segment.step-3d.active {
  background: #22c55e;
  animation: pulse 2s infinite;
}

.step-segment.step-pile.active {
  background: #a855f7;
  animation: pulse 2s infinite;
}

.step-segment.step-clear.active {
  background: #ef4444;
  animation: pulse 2s infinite;
}

.step-segment.step-volume.active {
  background: #3b82f6;
  animation: pulse 2s infinite;
}

.step-segment.pending {
  background: var(--border-color);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn-view {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-btn-view:hover {
  background: #3b82f6;
  color: white;
}

.action-btn-retry {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.action-btn-retry:hover {
  background: #22c55e;
  color: white;
}

.action-btn-cancel {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-btn-cancel:hover {
  background: #ef4444;
  color: white;
}

/* 无操作文本样式 */
.no-action-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-style: italic;
}

/* 模态框 */
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
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
}

.modal-header {
  padding: 2rem 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background: var(--bg-color-secondary);
  color: var(--text-primary);
}

.modal form {
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem 2.5rem 2.5rem;
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
}

/* 表单样式 */
.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  margin-top: 1.5rem; /* 增加与上面组件的间距 */
}

.form-row .form-group {
  flex: 1;
}

.task-name-builder {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.name-prefix {
  padding: 0.75rem;
  background: var(--bg-color-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

.name-date {
  padding: 0.75rem;
  background: var(--bg-color-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
  min-width: 120px;
  text-align: center;
}

.task-name-builder select {
  flex: 1;
  max-width: 180px;
  height: 48px;
}

.sequence-select {
  max-width: 80px;
  height: 48px;
}

.generated-task-name {
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.75rem;
  background: var(--bg-color-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.preview-name {
  font-weight: 600;
  color: var(--primary-color);
}

/* 创建任务模态框改进样式 */
.create-task-modal {
  max-width: 1100px;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  margin: 2rem auto;
}

.create-task-steps {
  padding: 2rem 2.5rem;
}

.step-section {
  margin-bottom: 2.5rem;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.step-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.125rem;
}

/* 任务类型卡片 */
.task-type-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.task-type-card {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-color-secondary);
}

.task-type-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.task-type-card.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(72, 187, 120, 0.05));
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.card-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.card-code {
  display: inline-block;
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.card-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.step-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.step-badge.step-3d {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
}

.step-badge.step-pile {
  background: rgba(168, 85, 247, 0.1);
  color: #7c3aed;
}

.step-badge.step-clear {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.step-badge.step-volume {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.card-desc {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

/* 优先级选择器 */
.priority-selector {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.priority-option {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.priority-option:hover {
  border-color: var(--primary-color);
}

.priority-option.active {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
}

.priority-option.priority-low.active {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  border-color: #059669;
}

.priority-option.priority-medium.active {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border-color: #2563eb;
}

.priority-option.priority-high.active {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border-color: #d97706;
}

.priority-option.priority-urgent.active {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-color: #dc2626;
}

/* 数据推荐 */
.data-recommendations {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-color-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.data-recommendations h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.data-recommendations h4 i {
  color: var(--warning-color);
}

.recommended-data-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-color);
}

.data-item:hover {
  border-color: var(--primary-color);
}

.data-item.active {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.05);
}

.data-item.compatible {
  border-color: var(--success-color);
}

.data-item.compatible:hover {
  border-color: var(--success-color);
}

.data-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.data-info {
  flex: 1;
}

.data-name {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.data-type {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.compatibility-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--success-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.auto-selected-badge {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.data-selection-hint {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  color: var(--primary-color);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  justify-content: center;
}

/* 数据状态提示 */
.data-status-alert {
  margin-bottom: 1rem;
}

.alert {
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #92400e;
}

.alert i {
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.alert-message {
  font-size: 0.875rem;
  line-height: 1.5;
}

.missing-type {
  color: #dc2626;
  font-weight: 600;
}

.data-status-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.data-status-success i {
  font-size: 1.125rem;
}

.no-data-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-color-secondary);
  color: var(--text-secondary);
  border-radius: 8px;
  text-align: center;
  font-style: italic;
}

.no-data-message i {
  color: var(--primary-color);
}

/* 任务预览 */
.task-preview {
  margin-top: 1.5rem;
}

.task-preview h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-card {
  padding: 2rem;
  background: var(--bg-color-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.preview-name {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1.125rem;
}

.preview-type {
  background: var(--primary-gradient);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 80px;
}

.detail-value {
  color: var(--text-primary);
}

.preview-steps {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preview-step {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.preview-step.step-3d {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
}

.preview-step.step-pile {
  background: rgba(168, 85, 247, 0.1);
  color: #7c3aed;
}

.preview-step.step-clear {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.preview-step.step-volume {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.pagination-total {
  font-weight: 600;
  color: var(--primary-color);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.page-size-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color-secondary);
  color: var(--text-primary);
}

.pagination-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(.active) {
  background: var(--border-color);
}

.page-btn.active {
  background: var(--primary-gradient);
  color: white;
  border-color: transparent;
}

.pagination-jump {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.jump-input {
  width: 40px;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color-secondary);
  color: var(--text-primary);
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-management-container {
    padding: 1rem;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .toolbar-actions {
    width: 100%;
    justify-content: center;
  }
  
  .advanced-filter-card {
    flex-direction: column;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .filter-tabs {
    justify-content: center;
  }
  
  .table-container {
    overflow-x: scroll;
  }
  
  .task-table {
    min-width: 800px;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .batch-actions-bar {
    flex-direction: column;
    text-align: center;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    width: 100%;
  }
}

/* 深色主题优化 */
[data-theme="dark"] {
  .search-input:focus {
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
  
  .form-control:focus {
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
  
  .task-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

/* 深色主题下日期选择器禁用日期样式修复 */
[data-theme="dark"] .custom-date-picker.el-popper {
  /* 整体弹出框样式 */
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
}

[data-theme="dark"] .custom-date-picker .el-date-table td.disabled div {
  background-color: #374151 !important;
  color: #9ca3af !important;
  opacity: 0.6;
  cursor: not-allowed;
}

[data-theme="dark"] .custom-date-picker .el-date-table td.available div {
  /* 可用日期的文字颜色 */
  color: var(--text-primary);
}

[data-theme="dark"] .custom-date-picker .el-date-table td.available:hover div {
  /* 鼠标悬浮时的样式 */
  background-color: var(--primary-color) !important;
  color: white !important;
}

[data-theme="dark"] .custom-date-picker .el-date-table th {
  /* 星期标题的样式 */
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

[data-theme="dark"] .custom-date-picker .el-date-picker__header-label {
  /* 年月标题的样式 */
  color: var(--text-primary);
}

[data-theme="dark"] .custom-date-picker .el-picker-panel__icon-btn {
  /* 左右箭头按钮的样式 */
  color: var(--text-secondary);
}

[data-theme="dark"] .custom-date-picker .el-picker-panel__body-wrapper {
  /* 日期面板边框 */
  border: 1px solid var(--border-color);
}

/* 暗色模式下按钮样式 */
[data-theme="dark"] button.action-btn.action-btn-completed {
  background-color: rgba(147, 51, 234, 0.1) !important;
  color: #9333ea !important;
  border: 1px solid #9333ea !important;
}

[data-theme="dark"] button.action-btn.action-btn-retry {
  background-color: rgba(16, 185, 129, 0.1) !important;
  color: #10b981 !important;
  border: 1px solid #10b981 !important;
}

[data-theme="dark"] button.action-btn.action-btn-view {
  background-color: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
  border: 1px solid #3b82f6 !important;
}

/* 浅色主题优化 */
[data-theme="light"] {
  .form-control {
    background: #ffffff;
    color: #1f2937;
    border-color: #d1d5db;
  }
  
  .form-control:focus {
    background: #ffffff;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .page-size-select {
    background: #ffffff;
    color: #1f2937;
    border-color: #d1d5db;
  }
  
  .search-input {
    background: #ffffff;
    color: #1f2937;
  }
  
  .search-input:focus {
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}
</style>
