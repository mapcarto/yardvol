<template>
  <div class="login-container">
    <div class="login-background">
      <div class="bg-animation"></div>
    </div>
    
    <div class="login-content">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <div class="logo-icon">
              <el-icon><Box /></el-icon>
            </div>
            <h1>天巡散货体积监测</h1>
          </div>
          <p class="subtitle">智能监测 · 精准分析</p>
        </div>

        <el-form
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              style="width: 100%"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <div class="quick-login">
            <p>快速登录</p>
            <div class="quick-accounts">
              <el-button size="small" @click="quickLogin('admin')">管理员</el-button>
              <el-button size="small" @click="quickLogin('operator')">操作员</el-button>
              <el-button size="small" @click="quickLogin('viewer')">观察者</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="features-panel">
        <h3>系统特性</h3>
        <div class="feature-list">
          <div class="feature-item">
            <el-icon class="feature-icon"><DataAnalysis /></el-icon>
            <div class="feature-content">
              <h4>智能分析</h4>
              <p>基于点云数据的三维重建与体积计算</p>
            </div>
          </div>
          
          <div class="feature-item">
            <el-icon class="feature-icon"><Monitor /></el-icon>
            <div class="feature-content">
              <h4>实时监控</h4>
              <p>实时监控散货堆积状态和体积变化</p>
            </div>
          </div>
          
          <div class="feature-item">
            <el-icon class="feature-icon"><Document /></el-icon>
            <div class="feature-content">
              <h4>报告生成</h4>
              <p>自动生成详细的分析报告和趋势图表</p>
            </div>
          </div>
          
          <div class="feature-item">
            <el-icon class="feature-icon"><Warning /></el-icon>
            <div class="feature-content">
              <h4>异常预警</h4>
              <p>智能识别异常数据并及时预警提醒</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="login-background-text">
      <div class="version-info">
        <p>Version 1.0.0</p>
        <p>&copy; 2024 天巡科技. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Box,
  DataAnalysis,
  Monitor,
  Document,
  Warning
} from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref()

// 登录表单数据
const loginForm = ref({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    
    loading.value = true
    
    // 模拟登录请求
    setTimeout(() => {
      // 验证用户名密码
      const validCredentials = [
        { username: 'admin', password: '123456' },
        { username: 'operator', password: '123456' },
        { username: 'viewer', password: '123456' }
      ]
      
      const isValid = validCredentials.some(
        cred => cred.username === loginForm.value.username && cred.password === loginForm.value.password
      )
      
      if (isValid) {
        ElMessage.success('登录成功')
        // 存储用户信息到本地存储
        localStorage.setItem('user', JSON.stringify({
          username: loginForm.value.username,
          loginTime: new Date().toISOString()
        }))
        
        // 跳转到首页
        router.push('/dashboard')
      } else {
        ElMessage.error('用户名或密码错误')
      }
      
      loading.value = false
    }, 1500)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 快速登录
const quickLogin = (userType: string) => {
  const credentials = {
    admin: { username: 'admin', password: '123456' },
    operator: { username: 'operator', password: '123456' },
    viewer: { username: 'viewer', password: '123456' }
  }
  
  const cred = credentials[userType as keyof typeof credentials]
  if (cred) {
    loginForm.value.username = cred.username
    loginForm.value.password = cred.password
    handleLogin()
  }
}

onMounted(() => {
  // 检查是否已经登录
  const user = localStorage.getItem('user')
  if (user) {
    router.push('/dashboard')
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 1;

  .bg-animation {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23pattern)"/></svg>');
    animation: float 20s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.login-content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  max-width: 1200px;
  width: 100%;
  padding: 0 40px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  .login-header {
    text-align: center;
    margin-bottom: 40px;

    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      .logo-icon {
        width: 64px;
        height: 64px;
        background: var(--primary-gradient);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 32px;
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
      }

      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: var(--text-color-primary);
        white-space: nowrap;
      }
    }

    .subtitle {
      margin: 16px 0 0 0;
      color: var(--text-color-secondary);
      font-size: 16px;
    }
  }

  .login-form {
    .el-form-item {
      margin-bottom: 24px;
    }

    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
  }

  .login-footer {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color-light);

    .quick-login {
      text-align: center;

      p {
        margin: 0 0 16px 0;
        color: var(--text-color-secondary);
        font-size: 14px;
      }

      .quick-accounts {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    }
  }
}

.features-panel {
  color: white;
  padding: 40px 20px;

  h3 {
    margin: 0 0 32px 0;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
  }

  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);

      .feature-icon {
        font-size: 24px;
        color: #fff;
        margin-top: 4px;
      }

      .feature-content {
        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }
      }
    }
  }
}

.login-background-text {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 2;

  .version-info {
    text-align: right;
    color: rgba(255, 255, 255, 0.7);

    p {
      margin: 4px 0;
      font-size: 12px;
    }
  }
}

@media (max-width: 768px) {
  .login-content {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 20px;
  }

  .login-card {
    padding: 24px;

    .login-header .logo h1 {
      font-size: 24px;
    }
  }

  .features-panel {
    padding: 24px 16px;

    h3 {
      font-size: 20px;
    }

    .feature-list {
      gap: 16px;

      .feature-item {
        padding: 16px;
      }
    }
  }
}
</style>