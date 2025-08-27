<template>
  <div class="data-management">
    <!-- 搜索和操作栏 -->
    <div class="action-bar fade-in-up">
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          class="search-input" 
          placeholder="搜索数据..."
          v-model="searchTerm"
          @input="handleSearch"
        >
      </div>
      <div class="action-buttons">
        <button class="btn btn-secondary" @click="showUploadOverview">
          <i class="fas fa-chart-line"></i>
          上传概览
        </button>
        <button class="btn btn-primary" @click="handleUploadData">
          <i class="fas fa-upload"></i>
          上传下载
        </button>
      </div>
    </div>

    <!-- 过滤标签 -->
    <div class="filter-tabs fade-in-up" style="animation-delay: 0.1s;">
      <div 
        class="filter-tab" 
        :class="{ active: activeFilter === 'all' }"
        @click="setFilter('all')"
      >
        全部数据
      </div>
      <div 
        class="filter-tab" 
        :class="{ active: activeFilter === 'raw' }"
        @click="setFilter('raw')"
      >
        原始影像
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-card fade-in-up" style="animation-delay: 0.2s;">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>数据ID</th>
              <th>名称</th>
              <th>类型</th>
              <th>大小</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredData" :key="item.id">
              <td><strong>{{ item.id }}</strong></td>
              <td><span>{{ item.name }}</span></td>
              <td>
                <div class="data-type">
                  <div class="data-type-icon" :class="item.typeClass">
                    <i :class="item.icon"></i>
                  </div>
                  <span>{{ item.typeName }}</span>
                </div>
              </td>
              <td><span class="file-size">{{ item.size }}</span></td>
              <td><span>{{ item.uploadTime }}</span></td>
              <td>
                <div class="action-buttons">
                  <button 
                    v-if="item.type === 'model' || item.type === 'pointcloud'" 
                    class="action-btn action-btn-view" 
                    @click="viewData(item)"
                  >
                    <i class="fas fa-eye"></i>查看
                  </button>
                  <button
                    v-if="item.type === 'image'"
                    :class="['action-btn', getImageActionClass(item.status)]"
                    @click="handleImageAction(item)"
                    :disabled="item.status === 'processing'"
                    :style="item.status === 'completed' ? 'background-color: #9333ea; color: white;' : (item.status === 'processing' ? '' : 'background-color: #16a34a; color: white;')"
                  >
                    <i :class="getImageActionIcon(item.status)"></i>
                    {{ getImageActionText(item.status) }}
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
          共 <span class="pagination-total">{{ totalData }}</span> 条记录
        </div>
        <div class="pagination-controls">
          <div class="page-size-selector">
            <span>每页</span>
            <select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
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

    <!-- 上传数据模态框 -->
    <div v-if="showUploadModal" class="modal" @click="closeUploadModal">
      <div class="modal-content" @click.stop>
        <span class="close-modal" @click="closeUploadModal">&times;</span>
        <h2>数据上传</h2>
        <div class="upload-notice">
          <h3>📋 PDM上传系统</h3>
          <div class="naming-rules">
            <h4>🔒 命名规范约束（PDM工具强制执行）</h4>
            <p><strong>所有数据必须按以下格式命名：</strong></p>
            <div class="format-example">
              <code>前缀-堆场名-日期-第次</code>
            </div>
            <ul>
              <li><strong>前缀：</strong>YX（影像）、DY（点云）、MX（模型）</li>
              <li><strong>堆场名：</strong>如"龙口煤场"、"天津港"、"秦皇岛煤场"</li>
              <li><strong>日期：</strong>YYYY-MM-DD 格式</li>
              <li><strong>第次：</strong>01、02、03...（当天第几次数据采集）</li>
            </ul>
            <div class="examples">
              <h4>✅ 正确示例：</h4>
              <ul>
                <li>YX-龙口煤场-2025-08-22-01 （原始影像）</li>
                <li>MX-天津港-2025-08-22-01 （模型数据）</li>
                <li>DY-秦皇岛煤场-2025-08-23-02 （点云数据）</li>
              </ul>
            </div>
            <div class="data-flow">
              <h4>🔄 数据处理流程：</h4>
              <p>原始影像（YX） → 三维重建 → 模型数据（MX） + 点云数据（DY）</p>
            </div>
            <div class="warning">
              <p>⚠️ <strong>重要：</strong>不符合此命名规范的文件将被PDM工具拒绝，无法完成上传</p>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" @click="closeUploadModal">确定</button>
      </div>
    </div>

    <!-- 上传概览模态框 -->
    <div v-if="showOverviewModal" class="modal" @click="closeOverviewModal">
      <div class="modal-content" @click.stop>
        <span class="close-modal" @click="closeOverviewModal">&times;</span>
        <h2>上传概览</h2>
        <div class="table-card fade-in-up">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>堆场名称</th>
                  <th>最近上传时间</th>
                  <th>第次</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="yard in yardOverview" :key="yard.name">
                  <td>{{ yard.name }}</td>
                  <td>{{ yard.lastUpload }}</td>
                  <td>
                    <span class="status-badge" :class="yard.count >= 2 ? 'status-completed' : 'status-pending'">
                      {{ yard.count }} {{ yard.count >= 2 ? '已完成' : '未完成' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <button class="btn btn-primary" @click="closeOverviewModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const searchTerm = ref('')
const activeFilter = ref('all')
const showUploadModal = ref(false)
const showOverviewModal = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const jumpToPage = ref<number | string>('')

// 数据列表 - 包含原始影像、模型数据、点云数据和结果数据
// 新命名规范：前缀-堆场名-日期-第次
// YX: 影像, DY: 点云, MX: 模型
const dataList = ref([
  // 龙口煤场 2025-08-15 第01次数据组
  {
    id: 'D001',
    name: 'YX-龙口煤场-2025-08-15-01',
    type: 'image',
    typeName: '原始影像',
    typeClass: 'image',
    icon: 'fas fa-camera',
    size: '4.2 GB',
    uploadTime: '2025-08-15 09:00',
    status: 'completed'
  },
  {
    id: 'D002',
    name: 'MX-龙口煤场-2025-08-15-01',
    type: 'model',
    typeName: '模型数据',
    typeClass: 'model',
    icon: 'fas fa-cube',
    size: '2.4 GB',
    uploadTime: '2025-08-15 09:30'
  },
  {
    id: 'D003',
    name: 'DY-龙口煤场-2025-08-15-01',
    type: 'pointcloud',
    typeName: '点云数据',
    typeClass: 'point-cloud',
    icon: 'fas fa-cubes',
    size: '1.8 GB',
    uploadTime: '2025-08-15 09:30'
  },
  // 秦皇岛煤场 2025-08-16 第01次数据组
  {
    id: 'D004',
    name: 'YX-秦皇岛煤场-2025-08-16-01',
    type: 'image',
    typeName: '原始影像',
    typeClass: 'image',
    icon: 'fas fa-camera',
    size: '3.8 GB',
    uploadTime: '2025-08-16 08:00',
    status: 'processing'
  },
  {
    id: 'D005',
    name: 'MX-秦皇岛煤场-2025-08-16-01',
    type: 'model',
    typeName: '模型数据',
    typeClass: 'model',
    icon: 'fas fa-cube',
    size: '2.1 GB',
    uploadTime: '2025-08-16 10:15'
  },
  {
    id: 'D006',
    name: 'DY-秦皇岛煤场-2025-08-16-01',
    type: 'pointcloud',
    typeName: '点云数据',
    typeClass: 'point-cloud',
    icon: 'fas fa-cubes',
    size: '1.6 GB',
    uploadTime: '2025-08-16 10:15'
  },
  // 天津港 2025-08-17 第01次数据组
  {
    id: 'D007',
    name: 'YX-天津港-2025-08-17-01',
    type: 'image',
    typeName: '原始影像',
    typeClass: 'image',
    icon: 'fas fa-camera',
    size: '5.1 GB',
    uploadTime: '2025-08-17 07:30',
    status: 'pending'
  },
  {
    id: 'D008',
    name: 'MX-天津港-2025-08-17-01',
    type: 'model',
    typeName: '模型数据',
    typeClass: 'model',
    icon: 'fas fa-cube',
    size: '3.2 GB',
    uploadTime: '2025-08-17 08:45'
  },
  {
    id: 'D009',
    name: 'DY-天津港-2025-08-17-01',
    type: 'pointcloud',
    typeName: '点云数据',
    typeClass: 'point-cloud',
    icon: 'fas fa-cubes',
    size: '2.3 GB',
    uploadTime: '2025-08-17 08:45'
  },
  // 黄骅港 2025-08-17 第02次数据组
  {
    id: 'D010',
    name: 'YX-黄骅港-2025-08-17-02',
    type: 'image',
    typeName: '原始影像',
    typeClass: 'image',
    icon: 'fas fa-camera',
    size: '4.5 GB',
    uploadTime: '2025-08-17 11:00',
    status: 'pending'
  },
  {
    id: 'D011',
    name: 'MX-黄骅港-2025-08-17-02',
    type: 'model',
    typeName: '模型数据',
    typeClass: 'model',
    icon: 'fas fa-cube',
    size: '2.8 GB',
    uploadTime: '2025-08-17 13:20'
  },
  {
    id: 'D012',
    name: 'DY-黄骅港-2025-08-17-02',
    type: 'pointcloud',
    typeName: '点云数据',
    typeClass: 'point-cloud',
    icon: 'fas fa-cubes',
    size: '2.0 GB',
    uploadTime: '2025-08-17 13:20'
  },
  // 日照港 2025-08-18 第02次数据组
  {
    id: 'D013',
    name: 'YX-日照港-2025-08-18-02',
    type: 'image',
    typeName: '原始影像',
    typeClass: 'image',
    icon: 'fas fa-camera',
    size: '4.1 GB',
    uploadTime: '2025-08-18 06:30',
    status: 'pending'
  },
  {
    id: 'D014',
    name: 'MX-日照港-2025-08-18-02',
    type: 'model',
    typeName: '模型数据',
    typeClass: 'model',
    icon: 'fas fa-cube',
    size: '2.7 GB',
    uploadTime: '2025-08-18 08:00'
  },
  {
    id: 'D015',
    name: 'DY-日照港-2025-08-18-02',
    type: 'pointcloud',
    typeName: '点云数据',
    typeClass: 'point-cloud',
    icon: 'fas fa-cubes',
    size: '1.9 GB',
    uploadTime: '2025-08-18 08:00'
  },
  // 青岛港 2025-08-19 第01次数据组  
  {
    id: 'D016',
    name: 'YX-青岛港-2025-08-19-01',
    type: 'image',
    typeName: '原始影像',
    typeClass: 'image',
    icon: 'fas fa-camera',
    size: '3.9 GB',
    uploadTime: '2025-08-19 07:00',
    status: 'pending'
  },
  {
    id: 'D017',
    name: 'MX-青岛港-2025-08-19-01',
    type: 'model',
    typeName: '模型数据',
    typeClass: 'model',
    icon: 'fas fa-cube',
    size: '2.6 GB',
    uploadTime: '2025-08-19 08:30'
  },
  {
    id: 'D018',
    name: 'DY-青岛港-2025-08-19-01',
    type: 'pointcloud',
    typeName: '点云数据',
    typeClass: 'point-cloud',
    icon: 'fas fa-cubes',
    size: '2.1 GB',
    uploadTime: '2025-08-19 08:30'
  }
])

// 堆场概览数据
const yardOverview = ref([
  { name: '龙口煤场', lastUpload: '2025-08-15 09:30', count: 2 },
  { name: '秦皇岛煤场', lastUpload: '2025-08-16 10:15', count: 2 },
  { name: '天津港', lastUpload: '2025-08-17 08:45', count: 1 },
  { name: '黄骅港', lastUpload: '2025-08-17 13:20', count: 2 },
  { name: '日照港', lastUpload: '2025-08-18 09:00', count: 2 },
  { name: '青岛港', lastUpload: '2025-08-18 14:30', count: 1 }
])

// 过滤后的数据
const filteredAllData = computed(() => {
  // 首先只保留原始影像数据
  let filtered = dataList.value.filter(item => item.type === 'image')

  // 按类型过滤
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(item => {
      switch (activeFilter.value) {
        case 'raw':
          return item.type === 'image'
        default:
          return true
      }
    })
  }

  // 按搜索词过滤
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      item.typeName.toLowerCase().includes(term)
    )
  }

  return filtered
})

// 分页数据
const totalData = computed(() => filteredAllData.value.length)
const totalPages = computed(() => Math.ceil(totalData.value / pageSize.value))

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

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAllData.value.slice(start, end)
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const setFilter = (filter: string) => {
  activeFilter.value = filter
  currentPage.value = 1 // 切换筛选时重置页码
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
    alert('请输入有效的页码')
  }
}

const handleUploadData = () => {
  alert(`📋 PDM上传系统启动\n\n⚠️ 重要提醒：\n所有数据必须按照规范命名：\n【前缀-堆场名-日期-第次】\n\n命名格式说明：\n• 前缀：YX（影像）、DY（点云）、MX（模型）\n• 堆场名：如"龙口煤场"、"天津港"\n• 日期：YYYY-MM-DD 格式\n• 第次：01、02、03...（当天第几次采集）\n\n✅ 正确示例：\n- YX-龙口煤场-2025-08-22-01\n- MX-天津港-2025-08-22-01\n- DY-秦皇岛煤场-2025-08-23-02\n\n📌 此命名规范由PDM工具强制约束\n不符合规范的文件将无法上传`)
  
  showUploadModal.value = true
}

const showUploadOverview = () => {
  showOverviewModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
}

const closeOverviewModal = () => {
  showOverviewModal.value = false
}

// 命名规范检查函数
const validateDataNaming = (filename: string) => {
  // 命名规范：堆场名称-时间(格式YYYY-MM-DD)-第次(格式01,02...)
  const namingPattern = /^[\u4e00-\u9fa5A-Za-z0-9]+\d*[\u53f7]*[\u5806\u573a]*-\d{4}-\d{2}-\d{2}-\d{2}$/
  return namingPattern.test(filename)
}

// 提取命名信息的函数
const parseDataName = (filename: string) => {
  const parts = filename.split('-')
  if (parts.length >= 4) {
    const yardName = parts[0]
    const date = `${parts[1]}-${parts[2]}-${parts[3]}`
    const sequence = parts[4] || '01'
    return { yardName, date, sequence, isValid: true }
  }
  return { isValid: false }
}

const getImageActionClass = (status) => {
  if (status === 'processing') return 'action-btn-processing';
  if (status === 'completed') return 'action-btn-completed custom-purple';
  return 'action-btn-process custom-green';
};

const getImageActionIcon = (status) => {
  if (status === 'processing') return 'fas fa-spinner fa-spin';
  if (status === 'completed') return 'fas fa-cube';
  return 'fas fa-cogs';
};

const getImageActionText = (status) => {
  if (status === 'processing') return '处理中';
  if (status === 'completed') return '3D';
  return '处理';
};

const handleImageAction = (item) => {
  if (item.status === 'pending') {
    // 更新状态为处理中
    item.status = 'processing';
    
    // 解析数据信息
    const dataInfo = parseDataInfo(item);
    
    // 创建全流程处理任务
    console.log(`创建全流程处理任务: ${item.name}`);
    
    // 显示任务创建成功的提示
    alert(`已自动创建全流程处理任务：
任务名称：${item.name}全流程处理
数据来源：${dataInfo.site || '未知堆场'}
处理内容：原始影像处理、三维模型生成、点云数据提取
预计完成时间：40分钟`);
    
    // 模拟处理时间
    setTimeout(() => {
      // 更新状态为已完成
      item.status = 'completed';
      
      // 显示处理完成的提示
      alert(`${item.name} 全流程处理已完成！
您现在可以点击"查看"按钮查看生成的三维模型和点云数据。`);
    }, 3000);
  } else if (item.status === 'completed') {
    // 跳转到三维展示页面查看对应场景的三维模型
    viewData(item);
  }
};

// 操作方法
const viewData = (item: any) => {
  console.log('查看数据:', item)
  
  // 解析数据信息
  const dataInfo = parseDataInfo(item)
  
  // 跳转到三维展示界面并传递数据信息
  router.push({
    path: '/3d-visualization',
    query: {
      dataId: item.id,
      dataName: item.name,
      dataType: item.type,
      site: dataInfo.site,
      date: dataInfo.date,
      sequence: dataInfo.sequence || '01'
    }
  })
}

// 解析数据信息（堆场、日期、第次）
// 新命名规范：前缀-堆场名-日期-第次
// YX: 影像, DY: 点云, MX: 模型
const parseDataInfo = (item: any) => {
  const name = item.name
  const uploadTime = item.uploadTime
  
  let site = ''
  let date = ''
  let sequence = '01'
  
  // 使用新的命名规范解析：前缀-堆场名-日期-第次
  if (name.includes('-')) {
    const parts = name.split('-')
    
    // 检查是否符合新命名规范（至少包含前缀、堆场名、日期、第次）
    if (parts.length >= 5) {
      const prefix = parts[0] // 前缀（YX/DY/MX）
      site = parts[1] // 堆场名
      date = `${parts[2]}-${parts[3]}-${parts[4]}` // 日期 YYYY-MM-DD
      sequence = parts[5] || '01' // 第次
      
      // 验证前缀是否合法
      if (!['YX', 'DY', 'MX'].includes(prefix)) {
        console.warn(`无效的数据前缀: ${prefix}`)
      }
    } else {
      // 兼容旧的命名格式（堆场名-日期-第次）
      if (parts.length >= 4) {
        site = parts[0] // 堆场名
        date = `${parts[1]}-${parts[2]}-${parts[3]}` // 日期 YYYY-MM-DD
        sequence = parts[4] || '01' // 第次
      }
    }
  } else {
    // 对于非标准命名的数据，从名称中提取堆场名称
    if (name.includes('龙口煤场')) site = '龙口煤场'
    else if (name.includes('秦皇岛煤场')) site = '秦皇岛煤场'
    else if (name.includes('天津港')) site = '天津港'
    else if (name.includes('黄骅港')) site = '黄骅港'
    else if (name.includes('日照港')) site = '日照港'
    else if (name.includes('青岛港')) site = '青岛港'
    
    // 从上传时间中提取日期
    date = uploadTime.split(' ')[0]
    
    // 根据同一天的数据计算第次（简化处理）
    const sameDay = dataList.value.filter(d => 
      d.uploadTime.includes(date) && (
        d.name.includes(site) || 
        (d.type === 'image' && d.name.includes(`-${site}-`))
      )
    )
    if (sameDay.length > 3) sequence = '02'
  }
  
  return { site, date, sequence }
}

onMounted(() => {
  // 初始化
})
</script>

<style lang="scss" scoped>
.data-management {
  padding: 2rem;
  background: transparent;
  min-height: calc(100vh - 80px);
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

// 搜索和操作栏
.action-bar {
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

.action-buttons {
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
  background: var(--border-color);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--text-secondary);
  color: white;
}

// 过滤标签
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
  background: var(--border-color);
  transform: translateY(-1px);
}

// 数据表格卡片
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

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1.5rem 2rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
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

.data-table tbody tr {
  transition: all 0.2s ease;
}

.data-table tbody tr:hover {
  background: var(--bg-color-secondary);
  transform: scale(1.01);
}

// 数据类型图标
.data-type {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.data-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  font-weight: 600;
}

.data-type-icon.point-cloud {
  background: var(--primary-gradient);
}

.data-type-icon.image {
  background: var(--warning-gradient);
}

.data-type-icon.model {
  background: var(--secondary-gradient);
}

.data-type-icon.result {
  background: var(--danger-gradient);
}

// 状态标签
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

.status-processed {
  background: #dcfce7;
  color: #166534;
}

.status-processing {
  background: #fef3c7;
  color: #92400e;
  animation: processing 2s infinite;
}

.status-completed {
  background: #dbeafe;
  color: #1e40af;
}

.status-pending {
  background: #f3e8ff;
  color: #7c3aed;
}

[data-theme="dark"] .data-management .status-processed {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

[data-theme="dark"] .data-management .status-processing {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

[data-theme="dark"] .data-management .status-completed {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

[data-theme="dark"] .data-management .status-pending {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

@keyframes processing {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

// 操作按钮
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

.action-btn-process {
  background: #16a34a !important;
  color: white !important;
}

.action-btn-processing {
  background: #fef3c7;
  color: #92400e;
  cursor: not-allowed;
}

.action-btn-completed {
  background: #9333ea !important;
  color: white !important;
  cursor: pointer;
}

.disabled-operation {
  color: var(--text-secondary);
  font-size: 1.2rem;
  text-align: center;
  user-select: none;
}

[data-theme="dark"] .data-management .action-btn-view {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

[data-theme="dark"] .data-management .action-btn-process {
  background: rgba(34, 197, 94, 0.1) !important;
  color: #22c55e !important;
}

[data-theme="dark"] .data-management .action-btn-processing {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

[data-theme="dark"] .data-management .action-btn-completed {
  background: rgba(168, 85, 247, 0.1) !important;
  color: #a855f7 !important;
}

.filter-tab.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--border-color) !important;
  color: var(--text-secondary) !important;
  pointer-events: none;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

// 文件大小显示
.file-size {
  font-weight: 600;
  color: var(--text-secondary);
}

/* 模态框样式 */
.modal {
  display: flex;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: var(--card-bg);
  margin: auto;
  padding: 2rem;
  border: 1px solid var(--border-color);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  animation: fadeIn 0.3s;
  position: relative;
  overflow-y: auto;
}

.modal-content h2 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-content p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.close-modal {
  color: var(--text-secondary);
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-modal:hover {
  color: var(--primary-color);
}

/* 上传命名规范样式 */
.upload-notice {
  .naming-rules {
    background: var(--bg-color-secondary);
    border: 2px solid var(--primary-color);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1rem 0;
    
    h3, h4 {
      color: var(--primary-color);
      margin: 0 0 1rem 0;
      font-weight: 600;
    }
    
    h3 {
      font-size: 1.3rem;
    }
    
    h4 {
      font-size: 1.1rem;
      margin-top: 1rem;
    }
    
    .format-example {
      background: var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      text-align: center;
      
      code {
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--primary-color);
        background: transparent;
      }
    }
    
    ul {
      margin: 1rem 0;
      padding-left: 1.5rem;
      
      li {
        margin: 0.5rem 0;
        color: var(--text-primary);
        line-height: 1.5;
        
        strong {
          color: var(--primary-color);
        }
      }
    }
    
    .examples {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid #22c55e;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      
      h4 {
        color: #22c55e;
        margin: 0 0 0.5rem 0;
      }
      
      ul {
        margin: 0;
        
        li {
          font-family: 'Fira Code', 'Consolas', monospace;
          font-weight: 500;
          color: #22c55e;
        }
      }
    }
    
    .data-flow {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      
      h4 {
        color: #3b82f6;
        margin: 0 0 0.5rem 0;
      }
      
      p {
        margin: 0;
        font-family: 'Fira Code', 'Consolas', monospace;
        font-weight: 500;
        color: #3b82f6;
        text-align: center;
        font-size: 0.95rem;
      }
    }
    
    .warning {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid #ef4444;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      
      p {
        margin: 0;
        color: #ef4444;
        font-weight: 500;
        
        strong {
          font-weight: 600;
        }
      }
    }
  }
}

[data-theme="dark"] .data-management {
  .upload-notice .naming-rules {
    .examples {
      background: rgba(34, 197, 94, 0.15);
    }
    
    .data-flow {
      background: rgba(59, 130, 246, 0.15);
    }
    
    .warning {
      background: rgba(239, 68, 68, 0.15);
    }
  }
}

@keyframes fadeIn {
  from {opacity: 0; transform: translateY(-20px);}
  to {opacity: 1; transform: translateY(0);}
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

// 响应式设计
@media (max-width: 1024px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .data-management {
    padding: 1rem;
  }

  .action-bar {
    padding: 1rem;
  }

  .data-table th,
  .data-table td {
    padding: 1rem;
  }

  .filter-tabs {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .filter-tab {
    white-space: nowrap;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-btn {
    font-size: 0.7rem;
    padding: 0.4rem 0.8rem;
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
</style>