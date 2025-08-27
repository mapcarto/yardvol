<template>
  <div class="report-management-container">
    <!-- 工具栏 -->
    <div class="toolbar fade-in-up">
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          class="search-input"
          placeholder="搜索报告..."
          v-model="searchKeyword"
          @input="handleSearch"
        >
      </div>
      <div>
        <button class="btn btn-primary" @click="openGenerateModal">
          <i class="fas fa-plus-circle"></i>
          生成报告
        </button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filter-card fade-in-up" style="animation-delay: 0.1s;">
      <div class="form-group">
        <label for="reportTypeFilter">报告类型</label>
        <el-select id="reportTypeFilter" v-model="filterForm.type" placeholder="全部类型" class="form-control">
          <el-option value="all" label="全部类型" />
          <el-option value="daily" label="日报" />
          <el-option value="weekly" label="周报" />
          <el-option value="monthly" label="月报" />
        </el-select>
      </div>
      <div class="form-group">
        <label for="siteFilter">场地</label>
        <el-select id="siteFilter" v-model="filterForm.yard" placeholder="全部场地" class="form-control">
          <el-option value="all" label="全部场地" />
          <el-option value="龙口煤场" label="龙口煤场" />
          <el-option value="秦皇岛煤场" label="秦皇岛煤场" />
          <el-option value="天津港" label="天津港" />
          <el-option value="黄骅港" label="黄骅港" />
          <el-option value="日照港" label="日照港" />
        </el-select>
      </div>
      <div class="form-group">
        <label for="dateFrom">开始日期</label>
        <el-date-picker 
          v-model="filterForm.startDate" 
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
          v-model="filterForm.endDate" 
          type="date" 
          placeholder="选择结束日期" 
          class="form-control"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </div>
      <div class="filter-buttons">
        <button class="btn btn-primary" @click="applyFilter">
          <i class="fas fa-filter"></i>
          应用筛选
        </button>
        <button class="btn btn-secondary" @click="resetFilter">
          <i class="fas fa-redo"></i>
          重置
        </button>
      </div>
    </div>

    <!-- 报告表格 -->
    <div class="table-card fade-in-up" style="animation-delay: 0.2s;">
      <div class="table-container">
        <table class="report-table">
          <thead>
            <tr>
              <th>报告ID</th>
              <th>名称</th>
              <th>类型</th>
              <th>场地</th>
              <th>生成时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in filteredReports" :key="report.id" :data-type="report.type" :data-site="report.yard.toLowerCase().replace('煤场', '').replace('港', '')">
              <td><strong>{{ report.id }}</strong></td>
              <td>{{ report.name }}</td>
              <td>
                <div class="report-type-cell">
                  <span class="report-icon-badge" :class="report.type">
                    <i :class="getTypeIcon(report.type)"></i>
                  </span>
                  {{ getTypeLabel(report.type) }}
                </div>
              </td>
              <td>{{ report.yard }}</td>
              <td>{{ report.createdAt }}</td>
              <td>
                <span class="status-badge" :class="`status-${report.status}`">
                  <i :class="getStatusIcon(report.status)"></i>
                  {{ getStatusLabel(report.status) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button v-if="report.status === 'completed'" class="action-btn action-btn-view" @click="viewReport(report)">
                    <i class="fas fa-eye"></i>查看
                  </button>
                  <button v-if="report.status === 'completed'" class="action-btn action-btn-download" @click="downloadReport(report)">
                    <i class="fas fa-download"></i>下载
                  </button>
                  <button v-if="report.type === 'daily' && report.status === 'completed'" class="action-btn action-btn-3d" @click="view3D(report)">
                    <i class="fas fa-cube"></i>3D
                  </button>
                  <button
                    v-if="report.status === 'generating' && report.type !== 'daily'"
                    class="action-btn action-btn-cancel"
                    @click="cancelReport(report)"
                  >
                    <i class="fas fa-times-circle"></i>取消
                  </button>
                  <button
                    v-if="report.status === 'completed' && report.type === 'monthly'"
                    class="action-btn action-btn-delete"
                    @click="deleteReport(report)"
                  >
                    <i class="fas fa-trash"></i>删除
                  </button>
                  <button
                    v-if="report.status === 'canceled'"
                    class="action-btn action-btn-regenerate"
                    @click="regenerateReport(report)"
                  >
                    <i class="fas fa-sync-alt"></i>重做
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredReports.length === 0">
              <td colspan="7" class="empty-cell">没有符合条件的报告</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination">
        <div class="pagination-info">
          共 <span class="pagination-total">{{ totalReports }}</span> 条记录
        </div>
        <div class="pagination-controls">
          <div class="page-size-selector">
            <span>每页</span>
            <select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
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
              @click="typeof page === 'number' ? goToPage(page) : null"
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

    <!-- 生成报告模态框 -->
    <div class="modal" :class="{ show: showGenerateModal }" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>生成新报告</h2>
          <button class="modal-close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="generateReport">
          <div class="form-group">
            <label for="reportName">报告名称</label>
            <input type="text" id="reportName" class="form-control" placeholder="请输入报告名称" v-model="reportForm.name" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="reportType">报告类型</label>
              <el-select id="reportType" v-model="reportForm.type" placeholder="请选择报告类型" class="form-control" required>
                <el-option value="daily" label="日报" />
                <el-option value="weekly" label="周报" />
                <el-option value="monthly" label="月报" />
              </el-select>
            </div>
            <div class="form-group">
              <label for="reportSite">场地</label>
              <el-select id="reportSite" v-model="reportForm.yard" placeholder="请选择场地" class="form-control" required>
                <el-option value="" label="请选择场地" />
                <el-option value="全部场地" label="全部场地" />
                <el-option value="龙口煤场" label="龙口煤场" />
                <el-option value="秦皇岛煤场" label="秦皇岛煤场" />
                <el-option value="天津港" label="天津港" />
                <el-option value="黄骅港" label="黄骅港" />
                <el-option value="日照港" label="日照港" />
              </el-select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="reportStartDate">开始日期</label>
              <el-date-picker 
                v-model="reportForm.startDate" 
                type="date" 
                placeholder="选择开始日期" 
                class="form-control"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                required
              />
            </div>
            <div class="form-group">
              <label for="reportEndDate">结束日期</label>
              <el-date-picker 
                v-model="reportForm.endDate" 
                type="date" 
                placeholder="选择结束日期" 
                class="form-control"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="reportFormat">报告格式</label>
            <el-select id="reportFormat" v-model="reportForm.format" placeholder="请选择报告格式" class="form-control">
              <el-option value="pdf" label="PDF" />
              <el-option value="excel" label="Excel" />
              <el-option value="word" label="Word" />
              <el-option value="html" label="HTML" />
            </el-select>
          </div>
          <div class="form-group">
            <label for="reportDescription">报告描述</label>
            <textarea id="reportDescription" class="form-control" rows="3" placeholder="输入报告描述" v-model="reportForm.description"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary">生成</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

type ReportType = 'daily' | 'weekly' | 'monthly'
type ReportStatus = 'generating' | 'completed' | 'failed' | 'canceled'

interface Report {
  id: string
  name: string
  type: ReportType
  yard: string
  createdAt: string
  status: ReportStatus
}

const searchKeyword = ref('')
const showGenerateModal = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const jumpToPage = ref(1)

// 筛选表单
const filterForm = reactive({
  type: 'all',
  yard: 'all',
  startDate: '',
  endDate: ''
})

// 示例数据
const reports = ref<Report[]>([
  { id: 'R001', name: '龙口煤场日报 (2025-08-15)', type: 'daily', yard: '龙口煤场', createdAt: '2025-08-15 17:30', status: 'completed' },
  { id: 'R002', name: '秦皇岛煤场日报 (2025-08-16)', type: 'daily', yard: '秦皇岛煤场', createdAt: '2025-08-16 17:30', status: 'completed' },
  { id: 'R003', name: '天津港周报 (2025-08-10至2025-08-16)', type: 'weekly', yard: '天津港', createdAt: '2025-08-17 10:00', status: 'generating' },
  { id: 'R004', name: '黄骅港日报 (2025-08-17)', type: 'daily', yard: '黄骅港', createdAt: '2025-08-17 17:30', status: 'completed' },
  { id: 'R005', name: '日照港日报 (2025-08-18)', type: 'daily', yard: '日照港', createdAt: '2025-08-18 17:30', status: 'generating' },
  { id: 'R006', name: '北方港口月度报告 (2025-07)', type: 'monthly', yard: '全部场地', createdAt: '2025-08-01 10:00', status: 'completed' }
])

// 过滤后的数据
const filteredData = computed(() => {
  let list = reports.value.slice()

  if (filterForm.type !== 'all') {
    list = list.filter(r => r.type === filterForm.type)
  }
  if (filterForm.yard !== 'all') {
    list = list.filter(r => r.yard === filterForm.yard)
  }
  if (filterForm.startDate) {
    list = list.filter(r => r.createdAt >= `${filterForm.startDate} 00:00`)
  }
  if (filterForm.endDate) {
    list = list.filter(r => r.createdAt <= `${filterForm.endDate} 23:59`)
  }

  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(r =>
      r.name.toLowerCase().includes(kw) ||
      r.id.toLowerCase().includes(kw) ||
      r.yard.toLowerCase().includes(kw)
    )
  }
  return list
})

// 分页相关计算属性
const totalReports = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalReports.value / pageSize.value))

const filteredReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const displayedPages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// 映射
const getTypeLabel = (type: ReportType) => {
  const map: Record<ReportType, string> = { 
    daily: '日报', 
    weekly: '周报', 
    monthly: '月报'
  }
  return map[type]
}

const getTypeIcon = (type: ReportType) => {
  const map: Record<ReportType, string> = {
    daily: 'fas fa-calendar-day',
    weekly: 'fas fa-calendar-week',
    monthly: 'fas fa-calendar-alt'
  }
  return map[type]
}

const getStatusLabel = (status: ReportStatus) => {
  const map: Record<ReportStatus, string> = {
    generating: '生成中',
    completed: '已完成',
    failed: '已失败',
    canceled: '已取消'
  }
  return map[status]
}

const getStatusIcon = (status: ReportStatus) => {
  const map: Record<ReportStatus, string> = {
    generating: 'fas fa-spinner fa-spin',
    completed: 'fas fa-check-circle',
    failed: 'fas fa-exclamation-triangle',
    canceled: 'fas fa-ban'
  }
  return map[status]
}

// 工具栏与筛选
const handleSearch = () => {
  currentPage.value = 1 // 搜索时重置到第一页
}

const applyFilter = () => { 
  currentPage.value = 1 // 筛选时重置到第一页
  ElMessage.success('筛选条件已应用')
}

const resetFilter = () => {
  Object.assign(filterForm, { type: 'all', yard: 'all', startDate: '', endDate: '' })
  currentPage.value = 1
  ElMessage.success('筛选条件已重置')
}

// 分页方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const handleJumpToPage = () => {
  const page = Number(jumpToPage.value)
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
  jumpToPage.value = currentPage.value
}

// 模态框与表单
const reportForm = reactive({
  name: '',
  type: 'daily' as ReportType,
  yard: '',
  startDate: '',
  endDate: '',
  format: 'pdf',
  description: ''
})

const openGenerateModal = () => { 
  showGenerateModal.value = true 
}

const closeModal = () => {
  showGenerateModal.value = false
  Object.assign(reportForm, {
    name: '',
    type: 'daily',
    yard: '',
    startDate: '',
    endDate: '',
    format: 'pdf',
    description: ''
  })
}

const validateForm = () => {
  if (!reportForm.name.trim()) return '请输入报告名称'
  if (!reportForm.yard) return '请选择场地'
  if (!reportForm.startDate) return '请选择开始日期'
  if (reportForm.type !== 'daily' && !reportForm.endDate) return '周报/月报需选择结束日期'
  return ''
}

const generateReport = () => {
  const err = validateForm()
  if (err) {
    ElMessage.error(err)
    return
  }
  ElMessage.success('报告生成任务已提交')
  showGenerateModal.value = false
  // 模拟插入一条生成中任务
  reports.value.unshift({
    id: `R${(reports.value.length + 1).toString().padStart(3, '0')}`,
    name: reportForm.name,
    type: reportForm.type,
    yard: reportForm.yard,
    createdAt: `${reportForm.startDate} 09:00`,
    status: 'generating'
  })
  closeModal()
}

// 操作
const viewReport = (report: Report) => { 
  ElMessage.info(`查看报告：${report.name}`) 
}

const downloadReport = (report: Report) => { 
  ElMessage.success(`下载报告：${report.name}`) 
}

const view3D = (report: Report) => { 
  // 跳转到3D可视化页面，传递报告ID参数
  router.push({
    path: '/3d-visualization',
    query: { reportId: report.id }
  })
}

const regenerateReport = (report: Report) => {
  ElMessageBox.confirm(`确定要重做报告 "${report.name}"？`, '重做确认', { type: 'info' })
    .then(() => {
      report.status = 'generating'
      ElMessage.success('报告已提交重新生成')
    })
    .catch(() => {})
}

const cancelReport = (report: Report) => {
  ElMessageBox.confirm(`确定取消报告 "${report.name}" 的生成？`, '取消确认', { type: 'warning' })
    .then(() => { 
      report.status = 'canceled'
      ElMessage.success('已取消') 
    })
    .catch(() => {})
}

const deleteReport = (report: Report) => {
  ElMessageBox.confirm(`确定删除报告 "${report.name}"？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = reports.value.findIndex(r => r.id === report.id)
      if (idx > -1) reports.value.splice(idx, 1)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.report-management-container {
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
}

.form-group {
  margin-top: 1rem;
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
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
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
  background: var(--border-color);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--text-secondary);
  color: white;
}

/* 筛选器 */
.filter-card {
  background: var(--card-bg);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
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
  background: #f8fafc;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-shrink: 0;
}

.filter-buttons .btn {
  min-width: 120px;
  height: 44px;
  padding: 0.75rem 1.5rem;
  justify-content: center;
}

/* 表格 */
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

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table th,
.report-table td {
  padding: 1.25rem 2rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.report-table th {
  background: #f8fafc;
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.report-table tbody tr {
  transition: all 0.2s ease;
}

.report-table tbody tr:hover {
  background: #f8fafc;
  transform: scale(1.005);
}

.report-table td:first-child {
  padding-left: 2rem;
}

.report-table th:first-child {
  padding-left: 2rem;
}

/* 报告类型图标 */
.report-type-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.report-icon-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
  background: var(--primary-color);
}

.report-icon-badge.daily { background: #4facfe; }
.report-icon-badge.weekly { background: #f093fb; }
.report-icon-badge.monthly { background: #ffecd2; }
.report-icon-badge.custom { background: var(--primary-color); }

/* 状态标签 */
.status-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
  animation: processing 2s infinite;
}

.status-generating {
  background: #fef3c7;
  color: #92400e;
  animation: processing 2s infinite;
}

@keyframes processing {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn-view {
  background: #e0f2fe;
  color: #0369a1;
}

.action-btn-download {
  background: #dcfce7;
  color: #166534;
}

.action-btn-delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn-3d {
  background: #e6e0ff;
  color: #673ab7;
}

.action-btn-cancel {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn-regenerate {
  background: #fffbeb;
  color: #b45309;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.empty-cell {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem 1rem;
}

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-color-secondary);
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.pagination-total {
  color: var(--primary-color);
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
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
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.page-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-jump {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.jump-input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  text-align: center;
}

.jump-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  justify-content: center;
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
  display: flex;
}

.modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 600px;
  transform: translateY(-20px);
  transition: transform 0.3s ease;
}

.modal.show .modal-content {
  transform: translateY(0);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.modal-header h2 {
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
  transition: color 0.3s ease;
}

.modal-close-btn:hover {
  color: var(--danger-color);
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-row .form-group {
  flex: 1;
}

/* 深色模式适配 */
:root[data-theme="dark"] {
  .search-input,
  .form-control {
    background: var(--card-bg);
    color: var(--text-primary);
    border-color: var(--border-color);
  }
  
  .search-input:focus,
  .form-control:focus {
    background: rgba(55, 65, 81, 0.8);
    border-color: var(--primary-color);
  }
  
  .filter-card {
    background: var(--card-bg);
    border-color: var(--border-color);
  }
  
  .btn-secondary {
    background: rgba(75, 85, 99, 0.5);
    color: var(--text-primary);
  }
  
  .btn-secondary:hover {
    background: rgba(75, 85, 99, 0.8);
    color: white;
  }
  
  /* 操作按钮深色模式样式 */
  .action-btn-view {
    background: rgba(3, 105, 161, 0.3);
    color: #7dd3fc;
  }
  
  .action-btn-download {
    background: rgba(22, 101, 52, 0.3);
    color: #86efac;
  }
  
  .action-btn-delete {
    background: rgba(220, 38, 38, 0.3);
    color: #fca5a5;
  }
  
  .action-btn-3d {
    background: rgba(103, 58, 183, 0.3);
    color: #c4b5fd;
  }
  
  .action-btn-cancel {
    background: rgba(220, 38, 38, 0.3);
    color: #fca5a5;
  }

  .action-btn-regenerate {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
  }
  
  .action-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.2);
  }
  
  .report-table th {
    background: var(--bg-color-secondary);
  }
  
  .report-table tbody tr:hover {
    background: rgba(55, 65, 81, 0.5);
  }
  
  .pagination {
    background: var(--bg-color-secondary);
    border-color: var(--border-color);
  }
  
  .page-size-select,
  .pagination-btn,
  .page-btn,
  .jump-input {
    background: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
  }
  
  .page-btn:hover,
  .pagination-btn:hover:not(:disabled) {
    background: var(--primary-color);
    border-color: var(--primary-color);
  }
  
  .page-btn.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
  }
  
  .status-completed {
    background: rgba(22, 101, 52, 0.2);
  }
  
  .status-generating {
    background: rgba(146, 64, 14, 0.2);
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* 加载动画 */
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

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .toolbar,
  .filter-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .report-management-container {
    padding: 1rem;
  }

  .toolbar,
  .filter-card {
    padding: 1rem;
  }

  .report-table th,
  .report-table td {
    padding: 1rem;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
