import React from 'react'

/**
 * SkeletonLine：通用骨架条
 * @param {Object} props
 * @param {number|string} [props.width='100%'] 宽度
 * @param {number|string} [props.height=16] 高度
 * @param {string} [props.className] 自定义类
 */
export function SkeletonLine({ width = '100%', height = 16, className = '' }) {
  const style = { width, height }
  return (
    <div
      className={`rounded bg-gray-200/70 dark:bg-zinc-700/60 animate-pulse ${className}`}
      style={style}
    />
  )
}

/**
 * SkeletonTable：表格骨架屏
 * @param {Object} props
 * @param {number} [props.headerCols=4] 表头列数
 * @param {number} [props.rows=8] 行数
 */
export function SkeletonTable({ headerCols = 4, rows = 8 }) {
  const header = new Array(headerCols).fill(0)
  const body = new Array(rows).fill(0)
  return (
    <div className="h-full overflow-auto border border-gray-200 dark:border-zinc-800 rounded">
      <div className="min-w-full">
        {/* 表头骨架 */}
        <div className="sticky top-0 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-800 px-3 py-2">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${headerCols}, minmax(0, 1fr))` }}>
            {header.map((_, i) => (
              <div key={i} className="pr-3">
                <SkeletonLine width="70%" height={14} />
              </div>
            ))}
          </div>
        </div>
        {/* 行骨架 */}
        <div className="divide-y divide-gray-200 dark:divide-zinc-800">
          {body.map((_, r) => (
            <div key={r} className="px-3 py-2">
              <div className="grid items-center gap-3" style={{ gridTemplateColumns: `repeat(${headerCols}, minmax(0, 1fr))` }}>
                {header.map((__, c) => (
                  <SkeletonLine key={c} height={14} width={`${60 + (c * 5) % 30}%`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SkeletonLine
