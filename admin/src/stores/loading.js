import { create } from 'zustand'

// 中文注释：全局 Loading 计数与最小显示时长控制
export const useLoadingStore = create((set, get) => ({
  pendingCount: {}, // { key: number }
  visibleSince: {}, // { key: timestamp }

  begin: (key = 'global') => {
    const { pendingCount, visibleSince } = get()
    const next = { ...pendingCount, [key]: (pendingCount[key] || 0) + 1 }
    const vs = { ...visibleSince }
    if (!vs[key]) vs[key] = Date.now()
    set({ pendingCount: next, visibleSince: vs })
  },

  end: (key = 'global', minDurationMs = 300) => {
    const doEnd = () => {
      const { pendingCount, visibleSince } = get()
      const current = Math.max(0, (pendingCount[key] || 0) - 1)
      const next = { ...pendingCount }
      if (current === 0) delete next[key]
      else next[key] = current

      const vs = { ...visibleSince }
      if (current === 0) delete vs[key]
      set({ pendingCount: next, visibleSince: vs })
    }

    const { visibleSince } = get()
    const since = visibleSince[key]
    if (!since) return doEnd()
    const elapsed = Date.now() - since
    if (elapsed >= minDurationMs) return doEnd()
    const left = minDurationMs - elapsed
    setTimeout(doEnd, left)
  },

  isLoading: (key = 'global') => {
    const { pendingCount } = get()
    return Boolean(pendingCount[key])
  }
}))

// 便捷函数：直接从组件外部调用（例如在拦截器中）
export const loadingBegin = (key) => useLoadingStore.getState().begin(key)
export const loadingEnd = (key, minDurationMs) => useLoadingStore.getState().end(key, minDurationMs)
export const isLoadingKey = (key) => useLoadingStore.getState().isLoading(key)
