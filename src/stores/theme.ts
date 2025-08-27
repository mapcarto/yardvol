import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('light')
  const isDark = ref(false)

  const initTheme = () => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      mode.value = savedMode
    } else {
      // 默认使用浅色主题
      mode.value = 'light'
    }
    
    updateTheme()
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme-mode')) {
        mode.value = e.matches ? 'dark' : 'light'
        updateTheme()
      }
    })
  }

  const updateTheme = () => {
    isDark.value = mode.value === 'dark'
    
    // 使用 data-theme 属性，与原型保持一致
    document.documentElement.setAttribute('data-theme', mode.value)
    
    // 保持 class 名兼容性
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.body.style.background = 'var(--bg-color)'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.background = 'var(--bg-color)'
    }
  }


  const setTheme = (newMode: ThemeMode) => {
    mode.value = newMode
    localStorage.setItem('theme-mode', newMode)
    updateTheme()
  }

  const toggleTheme = () => {
    const newMode = mode.value === 'light' ? 'dark' : 'light'
    setTheme(newMode)
  }

  return {
    mode,
    isDark,
    initTheme,
    setTheme,
    toggleTheme
  }
})