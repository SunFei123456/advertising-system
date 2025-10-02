import React from 'react';
import Icon from './Icon';

/**
 * 分页组件
 * 提供完整的分页功能，包括页码跳转、页面大小选择等
 */
const Pagination = ({
  current = 1,
  pageSize = 10,
  total = 0,
  onChange,
  onShowSizeChange,
  showQuickJumper = false,
  showSizeChanger = true,
  showTotal,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}) => {
  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);
  
  // 如果总数为0，则不渲染分页
  if (total === 0) {
    return null;
  }

  // 处理页码变化
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange?.(page, pageSize);
    }
  };

  // 处理页面大小变化
  const handlePageSizeChange = (newPageSize) => {
    const newCurrent = Math.min(current, Math.ceil(total / newPageSize));
    onShowSizeChange?.(newCurrent, newPageSize);
    onChange?.(newCurrent, newPageSize);
  };

  // 处理快速跳转
  const handleQuickJump = (e) => {
    if (e.key === 'Enter') {
      const page = parseInt(e.target.value);
      if (page >= 1 && page <= totalPages) {
        handlePageChange(page);
        e.target.value = '';
      }
    }
  };

  // 生成页码数组
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7; // 最多显示7个页码
    
    if (totalPages <= maxVisible) {
      // 如果总页数小于等于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 复杂分页逻辑
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, current - half);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      // 添加首页
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      // 添加中间页码
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // 添加尾页
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 ${className}`}>
      {/* 左侧：总数显示 */}
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
        {showTotal && (
          <span>
            {showTotal(total, [
              (current - 1) * pageSize + 1,
              Math.min(current * pageSize, total)
            ])}
          </span>
        )}
      </div>

      {/* 右侧：分页控件 */}
      <div className="flex items-center space-x-4">
        {/* 页面大小选择器 */}
        {showSizeChanger && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">每页</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-zinc-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size} 条</option>
              ))}
            </select>
          </div>
        )}

        {/* 分页按钮组 */}
        <div className="flex items-center space-x-1">
          {/* 上一页 */}
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current <= 1}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Icon name="chevronLeft" className="w-4 h-4" />
            <span>上一页</span>
          </button>

          {/* 页码 */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-sm text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${
                      page === current
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* 下一页 */}
          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current >= totalPages}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <span>下一页</span>
            <Icon name="chevronRight" className="w-4 h-4" />
          </button>
        </div>

        {/* 快速跳转 */}
        {showQuickJumper && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">跳至</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              onKeyPress={handleQuickJump}
              placeholder="页码"
              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-zinc-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">页</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
