import React, { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import DataTablePro from '../components/DataTablePro'
import Loading from '../components/Loading'
import { getVisitorsByDomainIp } from '../services/stats'
import dayjs from 'dayjs';

/**
 * 访客来源统计页面
 * 展示访客的域名、IP地址、访问次数和日期信息
 */
export default function VisitorStats() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({
    total_visits: 0,
    distinct_domains: 0,
    distinct_ips: 0,
  });
  
  const [filters, setFilters] = useState({
    start: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD')
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /**
   * 加载访客统计数据
   */
  const loadData = async (page, pageSize) => {
    try {
      setLoading(true)
      const params = { ...filters, page, page_size: pageSize };
      const result = await getVisitorsByDomainIp(params);
      setData(result.data || []);
      if (result.pagination) {
        setPagination({
          current: result.pagination.page,
          pageSize: result.pagination.page_size,
          total: result.pagination.total_items,
        });
      }
      // 更新统计摘要
      if (result.summary) {
        setSummary(result.summary);
      }
    } catch (error) {
      console.error('加载访客统计数据失败:', error)
      setData([])
      // 重置摘要
      setSummary({ total_visits: 0, distinct_domains: 0, distinct_ips: 0 });
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理筛选条件变化
   * @param {string} key - 筛选条件的键
   * @param {string} value - 筛选条件的值
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  /**
   * 处理查询操作
   */
  const handleQuery = () => {
    loadData(1, pagination.pageSize)
  }

  // 初始加载数据
  useEffect(() => {
    loadData(1, 10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 处理分页变化
  const handlePageChange = (page, pageSize) => {
    loadData(page, pageSize);
  }

  // 表格列定义
  const columns = [
    {
      key: 'domain',
      title: '域名',
      dataIndex: 'domain',
      width: '25%',
      sortable: false
    },
    {
      key: 'ip',
      title: 'IP地址',
      dataIndex: 'ip',
      width: '25%',
      sortable: false
    },
    {
      key: 'visits',
      title: '访问次数',
      dataIndex: 'visits',
      width: '20%',
      sortable: false,
      render: (value) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          {value || 0}
        </span>
      )
    },
    {
      key: 'day',
      title: '日期',
      dataIndex: 'day',
      width: '30%',
      sortable: true,
      sortingFn: (rowA, rowB) => {
        const a = new Date(rowA.original.day).getTime()
        const b = new Date(rowB.original.day).getTime()
        return a - b
      }
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="访客来源统计" 
        subtitle="查看各域名和IP的访客访问统计数据"
      />

      {/* 筛选区域 */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* 开始日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              开始日期
            </label>
            <input
              type="date"
              value={filters.start}
              onChange={(e) => handleFilterChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white"
            />
          </div>

          {/* 结束日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              结束日期
            </label>
            <input
              type="date"
              value={filters.end}
              onChange={(e) => handleFilterChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white"
            />
          </div>

          {/* 查询按钮 */}
          <div>
            <button
              onClick={handleQuery}
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? '查询中...' : '查询'}
            </button>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
        {loading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : (
          <DataTablePro
            columns={columns}
            data={data}
            pagination={{
              ...pagination,
              onChange: handlePageChange,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
            }}
            emptyText={
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
                  暂无数据
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  请调整筛选条件后重新查询
                </div>
              </div>
            }
          />
        )}
      </div>

      {/* 统计信息 */}
      {!loading && pagination.total > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            统计摘要
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summary.total_visits}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                总访问次数
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.distinct_domains}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                涉及域名数
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {summary.distinct_ips}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                独立IP数
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}