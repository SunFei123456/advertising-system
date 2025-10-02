import React from 'react'

// 页面抬头组件：标题与可选的右侧操作区
export default function PageHeader({ title, extra }) {
  return (
    <div className="h-12 mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold leading-none">{title}</h2>
      <div className="flex items-center gap-2">{extra}</div>
    </div>
  )
}
