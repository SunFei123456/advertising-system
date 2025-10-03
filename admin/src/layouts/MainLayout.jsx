import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import Icon from '../components/Icon'

// 简易布局：左侧侧边栏 + 顶部工具条（主题/语言/登出）+ 面包屑 + 主内容
export default function MainLayout() {
  const theme = useThemeStore(s => s.theme)
  const toggleTheme = useThemeStore(s => s.toggle)
  const logout = useAuthStore(s => s.logout)
  const nav = useNavigate()
  const loc = useLocation()

  const crumbs = loc.pathname.split('/').filter(Boolean)

  // 面包屑中文名称映射，与侧边栏菜单一致
  const crumbNameMap = {
    'traffic': '网站流量管理',
    'ads': '广告管理',
    'domains': '域名黑名单管理',
    'stats': '广告点击来源统计',
    'visitor-stats': '访客来源统计',
  }

  // 侧边栏收缩状态，持久化到 localStorage
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === '1'
  })
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed ? '1' : '0')
  }, [collapsed])



  // 全屏切换：状态与监听
  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const onFsChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement
      setIsFullscreen(Boolean(fsEl))
    }
    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    document.addEventListener('msfullscreenchange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
      document.removeEventListener('msfullscreenchange', onFsChange)
    }
  }, [])

  const enterFullscreen = () => {
    const el = document.documentElement
    if (el.requestFullscreen) return el.requestFullscreen()
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen()
    if (el.msRequestFullscreen) return el.msRequestFullscreen()
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) return document.exitFullscreen()
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen()
    if (document.msExitFullscreen) return document.msExitFullscreen()
  }



  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100">
      {/* 顶部 Header：左 logo+text，右 操作按钮 */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Icon name="home" className="w-4 h-4" />
          <span className="font-semibold">广告管理系统</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 主题切换 */}
          <button 
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 inline-flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md" 
            onClick={toggleTheme}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />
            <span className="font-medium">{theme === 'dark' ? '浅色' : '深色'}</span>
          </button>
          {/* 全屏切换 */}
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 inline-flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => (isFullscreen ? exitFullscreen() : enterFullscreen())}
            title={isFullscreen ? '退出全屏' : '全屏'}
            aria-label={isFullscreen ? '退出全屏' : '全屏'}
          >
            <Icon name={isFullscreen ? 'compress' : 'expand'} className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">{isFullscreen ? '退出全屏' : '全屏'}</span>
          </button>
          {/* 登出 */}
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white inline-flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => { logout(); nav('/login', { replace: true }) }}
          >
            <Icon name="logout" className="w-4 h-4" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </header>

      {/* 下方两栏：左侧侧边栏（可收缩）+ 右侧内容区 */}
      <div className="flex-1 flex">
        {/* 侧边栏 */}
        <aside
          className={`${collapsed ? 'w-16' : 'w-56'} transition-all duration-200 ease-in-out shrink-0 border-r border-gray-200 dark:border-zinc-800 p-3 flex flex-col`}
        >
          <nav className="flex flex-col gap-2 flex-1">
            <NavLink
              to="/traffic"
              className={({ isActive }) => `px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 hover:shadow-md'}`}
            >
              <span className="inline-flex items-center gap-3">
                <Icon name="gauge" className="w-5 h-5" />
                {!collapsed && <span className="font-medium">网站流量管理</span>}
              </span>
            </NavLink>
            <NavLink
              to="/ads"
              className={({ isActive }) => `px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 hover:shadow-md'}`}
            >
              <span className="inline-flex items-center gap-3">
                <Icon name="list" className="w-5 h-5" />
                {!collapsed && <span className="font-medium">广告管理</span>}
              </span>
            </NavLink>
            <NavLink
              to="/domains"
              className={({ isActive }) => `px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 hover:shadow-md'}`}
            >
              <span className="inline-flex items-center gap-3">
                <Icon name="shield" className="w-5 h-5" />
                {!collapsed && <span className="font-medium">域名黑名单</span>}
              </span>
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) => `px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 hover:shadow-md'}`}
            >
              <span className="inline-flex items-center gap-3">
                <Icon name="gauge" className="w-5 h-5" />
                {!collapsed && <span className="font-medium">广告点击来源统计</span>}
              </span>
            </NavLink>
            <NavLink
              to="/visitor-stats"
              className={({ isActive }) => `px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 hover:shadow-md'}`}
            >
              <span className="inline-flex items-center gap-3">
                <Icon name="users" className="w-5 h-5" />
                {!collapsed && <span className="font-medium">访客来源统计</span>}
              </span>
            </NavLink>
          </nav>

          {/* 侧边栏底部：收缩/展开开关 */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-800">
            <button
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => setCollapsed(v => !v)}
              title={collapsed ? '展开侧边栏' : '收起侧边栏'}
              aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
            >
              <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} className="w-4 h-4" />
              {!collapsed && <span className="text-sm font-medium">{collapsed ? '展开' : '收起'}</span>}
            </button>
          </div>
        </aside>

        {/* 右侧主区域 */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* 面包屑（右内容区域左上角） */}
          <div className="h-10 px-4 flex items-center">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1">
              <Icon name="home" className="w-3.5 h-3.5" />
              {crumbs.length === 0 ? (
                <span>首页</span>
              ) : (
                crumbs.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-2">
                    <Icon name="angleRight" className="w-3 h-3 opacity-60" />
                    <span>{crumbNameMap[c] || c}</span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* 主内容 */}
          <main className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 56px - 40px)' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
