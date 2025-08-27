<template>
  <div class="layout-container" :data-theme="currentTheme">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- 纹理背景 -->
      <div class="sidebar-bg"></div>
      
      <!-- 头部 -->
      <div class="sidebar-header">
        <div class="header-content">
          <h2>天巡散货体积监测</h2>
          <p>智能监测 · 精准分析</p>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar" :title="isCollapsed ? '展开导航栏' : '收起导航栏'">
          <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>
      
      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <ul>
          <li v-for="item in menuItems" :key="item.path">
            <router-link :to="item.path" :class="{ active: $route.path === item.path }">
              <i :class="item.icon"></i>
              <span class="nav-text">{{ item.title }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部栏 -->
      <header class="header">
        <div class="header-left">
          <button class="menu-toggle" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
          <h1>{{ currentPageTitle }}</h1>
        </div>
        
        <div class="user-info">
          <button class="screensaver-btn" @click="toggleScreensaver" :title="screensaverActive ? '退出屏保' : '启动屏保'">
            <i class="fas fa-desktop"></i>
          </button>
          
          <button class="theme-toggle" @click="toggleTheme" :title="currentTheme === 'dark' ? '切换为浅色模式' : '切换为深色模式'">
            <i :class="currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
          
          <button class="notification-btn">
            <i class="fas fa-bell"></i>
            <span class="notification-badge">3</span>
          </button>
          
          <div class="user-avatar" @click="toggleUserPanel">
            {{ userInitial }}
          </div>
        </div>
      </header>
      
      <!-- 页面内容 -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
    
    <!-- 屏保层 -->
    <div v-if="screensaverActive" class="screensaver" @click="toggleScreensaver">
      <div class="screensaver-content">
        <div class="screensaver-logo">
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
        </div>
        <h1>守护每方货堆，亦暖每刻坚守</h1>
        <div class="screensaver-clock">{{ currentClock }}</div>
        <div class="screensaver-date">{{ currentDate }}</div>
        <div class="screensaver-hint">点击任意位置退出屏保</div>
      </div>
    </div>
    
    <!-- 用户信息面板 - 使用Teleport传送到body末尾 -->
    <Teleport to="body">
      <div class="user-panel-portal" v-show="showUserPanel" @click.stop>
        <div class="user-panel">
          <div class="user-panel-header">
            <div class="user-panel-avatar">{{ userInitial }}</div>
            <div class="user-panel-info">
              <h3>{{ userName }}</h3>
              <p>{{ userRole }}</p>
            </div>
          </div>
          <div class="user-panel-content">
            <div class="user-panel-item" @click="navigateTo('/profile')">
              <i class="fas fa-user"></i>
              <span>个人信息</span>
            </div>
            <div class="user-panel-item" @click="navigateTo('/system-settings')">
              <i class="fas fa-cog"></i>
              <span>系统设置</span>
            </div>
            <div class="user-panel-item" @click="toggleTheme">
              <i :class="currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
              <span>{{ currentTheme === 'dark' ? '切换为浅色' : '切换为深色' }}</span>
            </div>
            <div class="user-panel-item" @click="toggleScreensaver">
              <i class="fas fa-desktop"></i>
              <span>启动屏保</span>
            </div>
            <div class="user-panel-divider"></div>
            <div class="user-panel-item logout" @click="logout">
              <i class="fas fa-sign-out-alt"></i>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { Teleport } from 'vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

// 响应式数据
const isCollapsed = ref(false)
const screensaverActive = ref(false)
const currentTime = ref('')
const currentClock = ref('')
const currentDate = ref('')
const currentTheme = computed(() => themeStore.isDark ? 'dark' : 'light')
const userInitial = ref('管')
const userName = ref('管理员')
const userRole = ref('系统管理员')
const showUserPanel = ref(false)

// 菜单项目
const menuItems = ref([
  {
    path: '/dashboard',
    title: '首页',
    icon: 'fas fa-home'
  },
  {
    path: '/data-management',
    title: '数据管理',
    icon: 'fas fa-database'
  },
  {
    path: '/task-management',
    title: '任务管理',
    icon: 'fas fa-tasks'
  },
  {
    path: '/3d-visualization',
    title: '三维展示',
    icon: 'fas fa-cube'
  },
  {
    path: '/result-analysis',
    title: '结果分析',
    icon: 'fas fa-chart-line'
  },
  {
    path: '/report-management',
    title: '报告管理',
    icon: 'fas fa-file-alt'
  },
  {
    path: '/system-settings',
    title: '系统设置',
    icon: 'fas fa-cog'
  }
])

// 当前页面标题
const currentPageTitle = computed(() => {
  const currentItem = menuItems.value.find(item => item.path === route.path)
  return currentItem?.title || '首页'
})

// 切换侧边栏
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 切换主题
const toggleTheme = () => {
  themeStore.toggleTheme()
}

// 切换用户面板
const toggleUserPanel = () => {
  showUserPanel.value = !showUserPanel.value
  
  // 添加点击外部关闭面板的事件监听
  if (showUserPanel.value) {
    setTimeout(() => {
      document.addEventListener('click', closeUserPanel)
    }, 0)
  } else {
    document.removeEventListener('click', closeUserPanel)
  }
}

// 关闭用户面板
const closeUserPanel = () => {
  showUserPanel.value = false
  document.removeEventListener('click', closeUserPanel)
}

// 页面导航
const navigateTo = (path: string) => {
  router.push(path)
  showUserPanel.value = false
}

// 退出登录
const logout = () => {
  // 这里可以添加退出登录的逻辑，如清除token等
  router.push('/login')
  showUserPanel.value = false
}

// 屏保功能
const toggleScreensaver = () => {
  screensaverActive.value = !screensaverActive.value
  if (screensaverActive.value) {
    updateTime()
    startTimeUpdate()
  } else {
    stopTimeUpdate()
  }
}

// 时间更新
let timeInterval: number | undefined

const updateTime = () => {
  const now = new Date()
  
  // 完整时间显示
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  // 大时钟显示（仅时分秒）
  currentClock.value = now.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  // 日期显示
  currentDate.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const startTimeUpdate = () => {
  timeInterval = window.setInterval(updateTime, 1000)
}

const stopTimeUpdate = () => {
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = undefined
  }
}

// 生命周期钩子
onMounted(() => {
  // 初始化主题
  document.documentElement.setAttribute('data-theme', themeStore.isDark ? 'dark' : 'light')
  
  // 监听键盘事件退出屏保
  const handleKeyPress = () => {
    if (screensaverActive.value) {
      toggleScreensaver()
    }
  }
  
  document.addEventListener('keydown', handleKeyPress)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress)
    stopTimeUpdate()
  })
})
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  
  // 全局背景
  &[data-theme="light"] {
    background: var(--bg-color);
  }
  
  &[data-theme="dark"] {
    background: var(--bg-color);
  }
}

// 侧边栏样式 - 浅色主题用渐变，深色主题用黑色
.sidebar {
  width: 280px;
  background: var(--primary-gradient);
  color: white;
  padding: 2rem 0;
  box-shadow: var(--shadow-xl);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  
  // 浅色主题：渐变背景
  [data-theme="light"] & {
    background: var(--primary-gradient);
    color: white;
  }
  
  // 深色主题：黑色背景
  [data-theme="dark"] & {
    background: linear-gradient(135deg, #1a1d29 0%, #2d3748 100%);
    color: #f7fafc;
    border-right: 1px solid #4a5568;
  }
  
  &.collapsed {
    width: 70px;
    
    .sidebar-header {
      .header-content {
        display: none;
      }
      
      .sidebar-toggle {
        margin: 0 auto;
      }
    }
    
    .sidebar-nav {
      padding: 0;
      
      ul {
        padding: 0;
      }
      
      li {
        margin-bottom: 0.5rem;
      }
      
      a {
        width: 50px;
        height: 50px;
        margin: 0 auto;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: none;
        }
        
        &.active {
          background: rgba(255, 255, 255, 0.2);
          transform: none;
        }
        
        i {
          margin: 0;
          font-size: 1.2rem;
        }
        
        .nav-text {
          display: none;
        }
      }
    }
  }
  
  // 纹理背景
  .sidebar-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="20" cy="80" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
}

.sidebar-header {
  padding: 0 2rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  .header-content {
    flex: 1;
    
    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(45deg, #ffffff, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transition: all 0.3s ease;
      white-space: nowrap;
    }
    
    p {
      font-size: 0.875rem;
      opacity: 0.8;
      transition: all 0.3s ease;
      white-space: nowrap;
    }
  }
  
  .sidebar-toggle {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
    margin-left: 1rem;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
    
    i {
      font-size: 0.875rem;
    }
  }
}

// 收起状态的样式调整
.sidebar.collapsed {
  .sidebar-header {
    padding: 0 1rem 2rem;
    justify-content: center;
    
    .header-content {
      display: none;
    }
    
    .sidebar-toggle {
      margin-left: 0;
    }
  }
}

.sidebar-nav {
  ul {
    list-style: none;
    padding: 0 1rem;
    margin: 0;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
  
  a {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      
      &::before {
        left: 100%;
      }
    }
    
    &.active {
      background: rgba(255, 255, 255, 0.2);
      transform: translateX(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    i {
      margin-right: 1rem;
      font-size: 1.1rem;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }
    
    .nav-text {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
    }
  }
}

// 主内容区
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
  margin-left: 280px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  .sidebar.collapsed + & {
    margin-left: 80px;
  }
}

.header {
  background: var(--card-bg);
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  
  .header-left {
    display: flex;
    align-items: center;
    
    .menu-toggle {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-primary);
      cursor: pointer;
      display: inline-flex;
      margin-right: 1rem;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        background: var(--border-color);
      }
    }
    
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    
    button {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      
      &:hover {
        background: var(--border-color);
        color: var(--text-primary);
        transform: scale(1.1);
      }
    }
    
    .notification-btn {
      position: relative;
      
      .notification-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 18px;
        height: 18px;
        background: var(--danger-gradient);
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      box-shadow: var(--shadow-md);
      cursor: pointer;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
      }
    }
    

  }
}

.page-content {
  flex: 1;
  overflow-y: auto;
  background: transparent;
  height: calc(100vh - 80px); /* 减去header高度 */
  max-height: calc(100vh - 80px);
}

// 屏保样式
.screensaver {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #1a1d29 0%, #2d3748 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
  overflow: hidden;
  
  // 动态背景粒子效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.1), transparent),
      radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.08), transparent),
      radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.06), transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.04), transparent),
      radial-gradient(2px 2px at 160px 30px, rgba(255,255,255,0.1), transparent);
    background-repeat: repeat;
    background-size: 200px 100px;
    animation: sparkle 20s linear infinite;
    pointer-events: none;
  }
  
  .screensaver-content {
    text-align: center;
    animation: fadeInUp 1.5s ease-out;
    position: relative;
    z-index: 2;
    
    .screensaver-logo {
      margin-bottom: 1.5rem;
      
      i {
        font-size: 3rem;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
        display: block;
        animation: pulse 3s ease-in-out infinite;
        filter: drop-shadow(0 0 15px rgba(102, 126, 234, 0.3));
        opacity: 0.6;
      }
      
      .drone-icon {
        width: 4rem;
        height: 4rem;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
        display: block;
        animation: pulse 3s ease-in-out infinite;
        filter: drop-shadow(0 0 15px rgba(102, 126, 234, 0.3));
        opacity: 0.6;
      }
    }
    
    h1 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 400;
      letter-spacing: 1px;
      opacity: 0.7;
    }
    
    // 时钟样式 - 加粗显眼
    .screensaver-clock {
      font-size: 9rem;
      font-weight: 700;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial', sans-serif;
      margin-bottom: 1.5rem;
      background: linear-gradient(45deg, #ffffff, #f8fafc, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 60px rgba(255, 255, 255, 0.4);
      letter-spacing: -2px;
      animation: glow 4s ease-in-out infinite alternate;
      line-height: 1.4;
      font-variant-numeric: tabular-nums;
    }
    
    // 日期显示 - 加大加粗
    .screensaver-date {
      font-size: 2.2rem;
      margin-bottom: 3rem;
      opacity: 0.8;
      font-weight: 600;
      letter-spacing: 0.5px;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    }
    
    .screensaver-hint {
      font-size: 1.1rem;
      opacity: 0.6;
      animation: breathe 3s ease-in-out infinite;
      font-weight: 300;
    }
  }
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

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

@keyframes glow {
  0% {
    text-shadow: 
      0 0 60px rgba(255, 255, 255, 0.4),
      0 0 40px rgba(255, 255, 255, 0.3);
  }
  100% {
    text-shadow: 
      0 0 80px rgba(255, 255, 255, 0.6),
      0 0 100px rgba(102, 126, 234, 0.4),
      0 0 120px rgba(102, 126, 234, 0.3),
      0 0 60px rgba(255, 255, 255, 0.5);
  }
}

@keyframes sparkle {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-200px);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .sidebar {
    width: 240px;
    
    &.collapsed {
      width: 0;
      padding: 0;
    }
  }
  
  .main-content {
    margin-left: 240px;
    
    .sidebar.collapsed + & {
      margin-left: 0;
    }
  }
  
  .header {
    padding: 1rem;
    
    .header-left h1 {
      font-size: 1.5rem;
    }
    
    .user-info {
      gap: 1rem;
    }
  }
  
  .screensaver .screensaver-content {
    h1 {
      font-size: 1.2rem;
    }
    
    .screensaver-clock {
      font-size: 5rem;
      letter-spacing: -1px;
      font-weight: 700;
      line-height: 1.4;
    }
    
    .screensaver-date {
      font-size: 1.4rem;
      font-weight: 600;
    }
    
    .screensaver-logo i {
      font-size: 2rem;
    }
  }
}
</style>

<style lang="scss">
// 全局样式，用于Teleport到body的用户面板
.user-panel-portal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999998;
  pointer-events: none;
}

.user-panel {
  position: fixed;
  top: 80px;
  right: 2rem;
  width: 280px;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
  overflow: hidden;
  z-index: 999999;
  animation: fadeInDown 0.3s ease;
  pointer-events: auto;
}

.user-panel-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.user-panel-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

.user-panel-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.user-panel-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.user-panel-content {
  padding: 0.75rem;
}

.user-panel-item {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-panel-item i {
  width: 20px;
  text-align: center;
  color: var(--text-secondary);
}

.user-panel-item span {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.user-panel-item:hover {
  background: var(--bg-color-secondary);
}

.user-panel-item.logout {
  color: var(--danger-color);
}

.user-panel-item.logout i, 
.user-panel-item.logout span {
  color: var(--danger-color);
}

.user-panel-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

.user-panel-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}
</style>