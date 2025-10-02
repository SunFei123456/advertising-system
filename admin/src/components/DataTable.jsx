import React from 'react'

// 极简表格封装（用于演示）。生产可替换为 TanStack Table 自定义列
export default function DataTable({ columns, data, rowKey = 'id', onRowClick, containerClassName }) {
  return (
    <div className={containerClassName || "overflow-auto border border-gray-200 dark:border-zinc-800 rounded"}>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 dark:bg-zinc-800">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="text-left px-3 py-2 font-medium">{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row[rowKey]} className="border-t border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer" onClick={() => onRowClick && onRowClick(row)}>
              {columns.map(col => (
                <td key={col.key} className="px-3 py-2">{col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
