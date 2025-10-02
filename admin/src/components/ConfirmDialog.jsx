import React from 'react'

// 通用确认/信息弹窗：用于简单展示或确认操作
export default function ConfirmDialog({ open, title, children, onOk, onCancel, okText = 'OK', cancelText = 'Cancel' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-lg p-4 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-800 shadow">
        <div className="text-lg font-semibold mb-3">{title}</div>
        <div className="mb-4 text-sm leading-6 max-h-[60vh] overflow-auto">{children}</div>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded border dark:border-zinc-700" onClick={onCancel}>{cancelText}</button>
          <button className="px-3 py-1 rounded border dark:border-zinc-700" onClick={onOk}>{okText}</button>
        </div>
      </div>
    </div>
  )
}
