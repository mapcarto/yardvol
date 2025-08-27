import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hideInMenu: true
    }
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'House',
          affix: true
        }
      },
      {
        path: '/data-management',
        name: 'DataManagement',
        component: () => import('@/views/data-management/index.vue'),
        meta: {
          title: '数据管理',
          icon: 'Database'
        }
      },
      {
        path: '/task-management',
        name: 'TaskManagement',
        component: () => import('@/views/task-management/index.vue'),
        meta: {
          title: '任务管理',
          icon: 'List'
        }
      },
      {
        path: '/3d-visualization',
        name: '3DVisualization',
        component: () => import('@/views/3d-visualization/index.vue'),
        meta: {
          title: '三维展示',
          icon: 'Box'
        }
      },
      {
        path: '/result-analysis',
        name: 'ResultAnalysis',
        component: () => import('@/views/result-analysis/index.vue'),
        meta: {
          title: '结果分析',
          icon: 'TrendCharts'
        }
      },
      {
        path: '/report-management',
        name: 'ReportManagement',
        component: () => import('@/views/report-management/index.vue'),
        meta: {
          title: '报告管理',
          icon: 'Document'
        }
      },
      {
        path: '/system-settings',
        name: 'SystemSettings',
        component: () => import('@/views/system-settings/index.vue'),
        meta: {
          title: '系统设置',
          icon: 'Setting'
        }
      },
      {
        path: '/cesium-test',
        name: 'CesiumTest',
        component: () => import('@/views/CesiumTest.vue'),
        meta: {
          title: 'Cesium测试',
          icon: 'Box'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router