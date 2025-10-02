import React from 'react'

/**
 * Spinner 组件：显示加载中的旋转图标
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md'] - 尺寸大小
 * @param {string} [props.className] - 自定义类名
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }
  return (
    <svg className={`animate-spin text-gray-500 ${sizeMap[size]} ${className}`} viewBox="0 0 24 24">
      {/* 中文注释：外环 */}
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      {/* 中文注释：高亮弧段 */}
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

/**
 * Overlay 组件：半透明遮罩 + 居中 Spinner（可全屏）
 * @param {Object} props
 * @param {boolean} [props.fullscreen=false] - 是否全屏
 * @param {string} [props.text] - 可选文案
 * @param {string} [props.className] - 自定义类名
 */
export function Overlay({ fullscreen = false, text, className = '' }) {
  const base = 'inset-0 flex items-center justify-center bg-black/30 z-50'
  const style = fullscreen ? base : `${base} absolute`
  return (
    <div className={style + ' ' + className}>
      <div className="flex flex-col items-center gap-2 p-4 rounded bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800">
        <Spinner size="md" />
        {text && <div className="text-sm text-gray-600 dark:text-gray-300">{text}</div>}
      </div>
    </div>
  )
}

export default Spinner
