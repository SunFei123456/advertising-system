import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 简单鉴权：持久化存储 token，并提供登录/登出方法
export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: async ({ username, password }) => {
        // 固定账户密码验证
        if (username === 'root' && password === 'root123456') {
          const token = 'mock-token'
          set({ token, user: { username } })
          return true
        }
        return false
      },
      logout: () => set({ token: null, user: null }),
      isAuthed: () => Boolean(get().token)
    }),
    {
      name: 'auth-storage',
    }
  )
)
