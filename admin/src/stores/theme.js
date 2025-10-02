import { create } from 'zustand'

// 主题状态：dark/light，使用 localStorage 持久化
export const useThemeStore = create((set, get) => ({
  theme: (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) || 'light',
  setTheme: (t) => {
    set({ theme: t })
    try { localStorage.setItem('theme', t) } catch {}
    // 同步到 html 根元素 class，用于 Tailwind dark 模式
    const root = document.documentElement
    if (t === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  },
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  }
}))

// 初始化时同步一次（刷新后保持）
if (typeof window !== 'undefined') {
  const t = localStorage.getItem('theme') || 'light'
  const root = document.documentElement
  if (t === 'dark') root.classList.add('dark')
}
