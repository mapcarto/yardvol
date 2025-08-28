<template>
  <div class="system-settings">
    <div class="page-header">
      <h1>系统设置</h1>
      <p>用户管理、系统配置和权限设置</p>
    </div>

    <!-- 标签页导航 -->
    <div class="settings-tabs fade-in-up">
      <div 
        class="settings-tab" 
        :class="{ active: activeTab === 'user-management' }"
        @click="setActiveTab('user-management')"
      >
        用户管理
      </div>
      <div 
        class="settings-tab" 
        :class="{ active: activeTab === 'system-configuration' }"
        @click="setActiveTab('system-configuration')"
      >
        系统配置
      </div>
      <div 
        class="settings-tab" 
        :class="{ active: activeTab === 'log-management' }"
        @click="setActiveTab('log-management')"
      >
        日志管理
      </div>
      <div 
        class="settings-tab" 
        :class="{ active: activeTab === 'help-about' }"
        @click="setActiveTab('help-about')"
      >
        帮助与关于
      </div>
    </div>

    <!-- 用户管理面板 -->
    <div class="settings-panel fade-in-up" v-show="activeTab === 'user-management'">
      <h2>用户管理</h2>
      <button class="btn btn-primary" @click="openAddUserModal">
        <i class="fas fa-user-plus"></i>
        添加用户
      </button>
      <table class="user-table">
        <thead>
          <tr>
            <th>用户ID</th>
            <th>用户名</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td><strong>{{ user.id }}</strong></td>
            <td>{{ user.username }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span :class="user.status === 'active' ? 'status-active' : 'status-inactive'">
                {{ user.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ user.createdAt }}</td>
            <td>
              <div class="action-buttons">
                <button class="action-btn action-btn-view" @click="editUser(user)">
                  <i class="fas fa-edit"></i>编辑
                </button>
                <button class="action-btn action-btn-download" @click="resetPassword(user)">
                  <i class="fas fa-key"></i>重置密码
                </button>
                <button 
                  v-if="user.status === 'active'"
                  class="action-btn action-btn-delete" 
                  @click="toggleUserStatus(user)"
                >
                  <i class="fas fa-user-slash"></i>禁用
                </button>
                <button 
                  v-else
                  class="action-btn action-btn-primary" 
                  @click="toggleUserStatus(user)"
                >
                  <i class="fas fa-user-check"></i>启用
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- 分页控件 -->
      <div class="pagination-container">
        <div class="pagination-info">
          共 <span class="highlight">{{ users.length }}</span> 条记录
        </div>
        <div class="pagination-size">
          每页
          <select v-model="pageSize" @change="handlePageSizeChange">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
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
              @click="goToPage(Number(page))"
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

    <!-- 系统配置面板 -->
    <div class="settings-panel fade-in-up" v-show="activeTab === 'system-configuration'">
      <h2>系统配置</h2>
      <div class="form-group">
        <label for="apiEndpoint">API 端点</label>
        <input type="text" id="apiEndpoint" class="form-control" v-model="systemConfig.apiEndpoint">
      </div>
      <div class="form-group">
        <label for="dataStoragePath">数据存储路径</label>
        <input type="text" id="dataStoragePath" class="form-control" v-model="systemConfig.dataStoragePath">
      </div>
      <div class="form-group">
        <label for="defaultCoordinateSystem">默认坐标系</label>
        <input type="text" id="defaultCoordinateSystem" class="form-control" v-model="systemConfig.defaultCoordinateSystem">
      </div>
      <div class="form-group">
        <label>自动更新</label>
        <label class="toggle-switch">
          <input type="checkbox" v-model="systemConfig.autoUpdate">
          <span class="slider"></span>
        </label>
      </div>
      <div class="form-group">
        <label>实时数据同步</label>
        <label class="toggle-switch">
          <input type="checkbox" v-model="systemConfig.realtimeSync">
          <span class="slider"></span>
        </label>
      </div>
      <button class="btn btn-primary" @click="saveSystemConfig">
        <i class="fas fa-save"></i>
        保存配置
      </button>
    </div>

    <!-- 日志管理面板 -->
    <div class="settings-panel fade-in-up" v-show="activeTab === 'log-management'">
      <h2>日志管理</h2>
      <div class="log-levels">
        <button 
          v-for="level in logLevels" 
          :key="level.value"
          class="log-level-btn" 
          :class="{ active: activeLogLevel === level.value }"
          @click="setLogLevel(level.value)"
        >
          {{ level.label }}
        </button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="logDateFrom">开始日期</label>
          <el-date-picker 
            v-model="logFilter.dateFrom" 
            type="date" 
            placeholder="选择开始日期" 
            class="form-control"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>
        <div class="form-group">
          <label for="logDateTo">结束日期</label>
          <el-date-picker 
            v-model="logFilter.dateTo" 
            type="date" 
            placeholder="选择结束日期" 
            class="form-control"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>
      </div>
      <div class="log-entries-container">
        <div 
          v-for="(log, index) in filteredLogs" 
          :key="index"
          class="log-entry"
          :class="'log-' + log.level"
        >
          <div class="log-time">{{ log.time }} [{{ log.levelText }}]</div>
          <div class="log-message">{{ log.message }}</div>
        </div>
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button class="btn btn-primary" @click="exportLogs">
          <i class="fas fa-file-export"></i>
          导出日志
        </button>
        <button class="btn btn-secondary" @click="clearLogs">
          <i class="fas fa-trash-alt"></i>
          清除日志
        </button>
      </div>
    </div>

    <!-- 帮助与关于面板 -->
    <div class="settings-panel fade-in-up" v-show="activeTab === 'help-about'">
      <h2>帮助与关于</h2>
      <p>天巡散货体积监测是一套用于户外散货堆场体积测量与监管的综合解决方案。系统通过无人机采集数据，结合三维重建技术，实现散货体积的精准计算与分析。</p>
      <ul class="help-links">
        <li>
          <a href="#"><i class="fas fa-book"></i> 下载 PDF 版用户手册</a>
        </li>
        <li>
          <a href="#"><i class="fas fa-video"></i> 查看系统操作视频教程</a>
        </li>
        <li>
          <a href="#"><i class="fas fa-question-circle"></i> 浏览常见问题解答</a>
        </li>
      </ul>
        <div class="version-info">
          <p><strong>版本信息:</strong> v1.2.0</p>
          <p><strong>发布日期:</strong> 2025-08-18</p>
          <p><strong>版权所有:</strong> &copy; 2025 中科天巡. 保留所有权利.</p>
        </div>
    </div>

    <!-- 添加用户模态框 -->
    <div class="modal" :class="{ show: showAddUserModal }" @click="closeAddUserModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingUser.id ? '编辑用户' : '添加新用户' }}</h2>
          <button class="modal-close-btn" @click="closeAddUserModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="submitUserForm">
          <div class="form-group">
            <label for="newUsername">用户名</label>
            <input type="text" id="newUsername" class="form-control" placeholder="请输入用户名" v-model="userForm.username">
          </div>
          <div class="form-group" v-if="!editingUser.id">
            <label for="newPassword">密码</label>
            <input type="password" id="newPassword" class="form-control" placeholder="请输入密码" v-model="userForm.password">
          </div>
          <div class="form-group" v-if="!editingUser.id">
            <label for="confirmPassword">确认密码</label>
            <input type="password" id="confirmPassword" class="form-control" placeholder="请再次输入密码" v-model="userForm.confirmPassword">
          </div>
          <div class="form-group">
            <label for="newUserRole">角色</label>
            <select id="newUserRole" class="form-control" v-model="userForm.role">
              <option value="operator">操作员</option>
              <option value="viewer">查看员</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAddUserModal">取消</button>
            <button type="submit" class="btn btn-primary">{{ editingUser.id ? '保存' : '添加' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 标签页管理
const activeTab = ref('user-management')

const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

// 用户管理
interface User {
  id: string
  username: string
  role: string
  status: 'active' | 'inactive'
  createdAt: string
}

const users = ref<User[]>([
  { id: 'U001', username: 'admin', role: '管理员', status: 'active', createdAt: '2025-08-01' },
  { id: 'U002', username: 'operator1', role: '操作员', status: 'active', createdAt: '2025-08-05' },
  { id: 'U003', username: 'viewer1', role: '查看员', status: 'active', createdAt: '2025-08-10' },
  { id: 'U004', username: 'operator2', role: '操作员', status: 'inactive', createdAt: '2025-08-12' },
  { id: 'U005', username: 'operator3', role: '操作员', status: 'active', createdAt: '2025-08-15' },
  { id: 'U006', username: 'viewer2', role: '查看员', status: 'active', createdAt: '2025-08-16' },
  { id: 'U007', username: 'operator4', role: '操作员', status: 'active', createdAt: '2025-08-18' },
  { id: 'U008', username: 'admin2', role: '管理员', status: 'active', createdAt: '2025-08-20' }
])

// 分页逻辑
const currentPage = ref(1)
const pageSize = ref(10)
const jumpToPage = ref('')

const totalPages = computed(() => {
  return Math.ceil(users.value.length / pageSize.value)
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return users.value.slice(start, end)
})

const displayedPages = computed(() => {
  const result = []
  const maxDisplayed = 5
  
  if (totalPages.value <= maxDisplayed) {
    // 如果总页数小于等于最大显示页数，则全部显示
    for (let i = 1; i <= totalPages.value; i++) {
      result.push(i)
    }
  } else {
    // 总是显示第一页
    result.push(1)
    
    // 计算中间页
    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)
    
    // 调整以确保显示的页数一致
    if (startPage === 2) {
      endPage = Math.min(totalPages.value - 1, startPage + 2)
    }
    if (endPage === totalPages.value - 1) {
      startPage = Math.max(2, endPage - 2)
    }
    
    // 添加省略号
    if (startPage > 2) {
      result.push('...')
    }
    
    // 添加中间页
    for (let i = startPage; i <= endPage; i++) {
      result.push(i)
    }
    
    // 添加省略号
    if (endPage < totalPages.value - 1) {
      result.push('...')
    }
    
    // 总是显示最后一页
    result.push(totalPages.value)
  }
  
  return result
})

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

const showAddUserModal = ref(false)
const editingUser = ref<Partial<User>>({})
const userForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'operator'
})

const openAddUserModal = () => {
  editingUser.value = {}
  userForm.username = ''
  userForm.password = ''
  userForm.confirmPassword = ''
  userForm.role = 'operator'
  showAddUserModal.value = true
}

const closeAddUserModal = () => {
  showAddUserModal.value = false
}

const editUser = (user: User) => {
  editingUser.value = { ...user }
  userForm.username = user.username
  userForm.role = user.role === '管理员' ? 'admin' : user.role === '操作员' ? 'operator' : 'viewer'
  showAddUserModal.value = true
}

const resetPassword = (user: User) => {
  ElMessageBox.confirm(`确定要重置 ${user.username} 的密码吗？`, '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`已重置 ${user.username} 的密码`)
  }).catch(() => {})
}

const toggleUserStatus = (user: User) => {
  const action = user.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}用户 ${user.username} 吗？`, `${action}用户`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    user.status = user.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`已${action}用户 ${user.username}`)
  }).catch(() => {})
}

const submitUserForm = () => {
  if (!userForm.username) {
    ElMessage.error('请输入用户名')
    return
  }
  
  if (!editingUser.value.id) {
    // 添加新用户
    if (!userForm.password) {
      ElMessage.error('请输入密码')
      return
    }
    if (userForm.password !== userForm.confirmPassword) {
      ElMessage.error('两次输入的密码不一致')
      return
    }
    
    const newId = `U${(users.value.length + 1).toString().padStart(3, '0')}`
    const roleMap = {
      'admin': '管理员',
      'operator': '操作员',
      'viewer': '查看员'
    } as const
    
    users.value.push({
      id: newId,
      username: userForm.username,
      role: roleMap[userForm.role as keyof typeof roleMap],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    })
    
    ElMessage.success('添加用户成功')
  } else {
    // 编辑用户
    const user = users.value.find(u => u.id === editingUser.value.id)
    if (user) {
      const roleMap = {
        'admin': '管理员',
        'operator': '操作员',
        'viewer': '查看员'
      } as const
      
      user.username = userForm.username
      user.role = roleMap[userForm.role as keyof typeof roleMap]
      
      ElMessage.success('更新用户成功')
    }
  }
  
  showAddUserModal.value = false
}

// 系统配置
const systemConfig = reactive({
  apiEndpoint: 'http://api.tianxun-system.com/v1',
  dataStoragePath: '/data/tianxun/storage',
  defaultCoordinateSystem: 'WGS84',
  autoUpdate: true,
  realtimeSync: false
})

const saveSystemConfig = () => {
  ElMessage.success('配置保存成功')
}

// 日志管理
interface LogEntry {
  time: string
  level: string
  levelText: string
  message: string
}

const logLevels = [
  { value: 'all', label: '全部' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'error', label: '错误' },
  { value: 'debug', label: '调试' }
]

const activeLogLevel = ref('all')
const logFilter = reactive({
  dateFrom: '',
  dateTo: ''
})

const logs = ref<LogEntry[]>([
  { time: '2025-08-20 10:15:32', level: 'info', levelText: 'INFO', message: '系统启动成功' },
  { time: '2025-08-20 10:16:45', level: 'info', levelText: 'INFO', message: '用户 admin 登录成功' },
  { time: '2025-08-20 10:20:12', level: 'info', levelText: 'INFO', message: '数据导入任务开始执行，任务ID: T1001' },
  { time: '2025-08-20 10:25:30', level: 'error', levelText: 'ERROR', message: '数据导入任务失败，任务ID: T1001，错误: 文件格式不支持' },
  { time: '2025-08-20 10:30:05', level: 'info', levelText: 'INFO', message: '用户 operator1 登录成功' },
  { time: '2025-08-20 10:35:18', level: 'warning', levelText: 'WARNING', message: '磁盘空间不足，剩余空间: 10%' },
  { time: '2025-08-20 10:40:22', level: 'info', levelText: 'INFO', message: '三维重建任务完成，任务ID: T1002' }
])

const setLogLevel = (level: string) => {
  activeLogLevel.value = level
}

const filteredLogs = computed(() => {
  let filtered = logs.value

  // 按级别筛选
  if (activeLogLevel.value !== 'all') {
    filtered = filtered.filter(log => log.level === activeLogLevel.value)
  }

  // 按日期筛选
  if (logFilter.dateFrom) {
    filtered = filtered.filter(log => {
      const logDate = log.time.split(' ')[0]
      return logDate >= logFilter.dateFrom
    })
  }

  if (logFilter.dateTo) {
    filtered = filtered.filter(log => {
      const logDate = log.time.split(' ')[0]
      return logDate <= logFilter.dateTo
    })
  }

  return filtered
})

const exportLogs = () => {
  ElMessage.success('日志导出成功')
}

const clearLogs = () => {
  ElMessageBox.confirm('确定要清除所有日志吗？此操作不可恢复。', '清除日志', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    logs.value = []
    ElMessage.success('日志已清除')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.system-settings {
  padding: 2rem;
  background: transparent;
  min-height: calc(100vh - 80px);
}

.page-header {
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: var(--text-secondary);
    margin: 0;
  }
}

/* 标签页导航 */
.settings-tabs {
  display: flex;
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  margin-bottom: 2rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.settings-tab {
  flex: 1;
  padding: 1rem 1.5rem;
  text-align: center;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  border-right: 1px solid var(--border-color);
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background: var(--bg-color-secondary);
    color: var(--text-primary);
  }
  
  &.active {
    background: var(--primary-gradient);
    color: white;
    box-shadow: var(--shadow-md);
  }
}

/* 设置面板 */
.settings-panel {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1rem;
  }
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
  }
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
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: var(--card-bg);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

.form-row {
  display: flex;
  gap: 1rem;
  
  .form-group {
    flex: 1;
  }
}

/* 按钮样式 */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: var(--shadow-md);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
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

/* 用户表格 */
.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  
  th, td {
    padding: 1.25rem 2rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    white-space: nowrap;
  }
  
  th {
    background: var(--bg-color-secondary);
    font-weight: 700;
    color: var(--text-primary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  tbody tr {
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--bg-color-secondary);
      transform: scale(1.005);
    }
  }
}

.status-active {
  color: #16a34a;
  font-weight: 600;
}

.status-inactive {
  color: #dc2626;
  font-weight: 600;
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
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
}

.action-btn-view {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-btn-download {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.action-btn-primary {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-btn-delete {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .4s;
  border-radius: 28px;
  
  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

/* 日志管理 */
.log-levels {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.log-level-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-color-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  
  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
}

.log-entries-container {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  height: 400px;
  overflow-y: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.875rem;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.log-entry {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed var(--border-color);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

.log-time {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.log-message {
  white-space: pre-wrap;
  word-break: break-all;
}

.log-info { color: var(--text-primary); }
.log-warning { color: #d97706; }
.log-error { color: #dc2626; }
.log-debug { color: #4f46e5; }

/* 帮助与关于 */
.help-links {
  margin-top: 1rem;
  margin-left: 1.5rem;
  list-style: disc;
  
  li {
    margin-bottom: 0.5rem;
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.version-info {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  margin-top: 1.5rem;
  
  p {
    margin-bottom: 0.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: var(--primary-color);
  }
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
  
  &.show {
    opacity: 1;
    visibility: visible;
  }
}

.modal-content {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
}

.modal-header {
  padding: 1.5rem 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  
  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    border-bottom: none;
    padding-bottom: 0;
  }
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-color-secondary);
    color: var(--text-primary);
  }
}

.modal form {
  padding: 1.5rem 2rem 2rem;
}

.modal-footer {
  padding-top: 0.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 淡入动画 */
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

/* 分页控件 */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-color-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.875rem;
  
  .highlight {
    color: var(--primary-color);
    font-weight: 700;
  }
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  
  select {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 0.875rem;
    text-align: center;
  }
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: var(--bg-color-secondary);
    color: var(--text-primary);
    border-color: var(--primary-color);
  }
  
  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.pagination-ellipsis {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.pagination-jump {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  
  input {
    width: 50px;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 0.875rem;
    text-align: center;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .settings-tabs {
    flex-wrap: wrap;
  }
  
  .settings-tab {
    flex-basis: 50%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    
    &:nth-child(even) {
      border-right: none;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .pagination-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .system-settings {
    padding: 1rem;
  }
  
  .settings-panel {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .log-levels {
    flex-wrap: wrap;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
