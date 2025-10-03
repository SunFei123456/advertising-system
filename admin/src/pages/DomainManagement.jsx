import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import dayjs from 'dayjs';

export default function DomainManagement() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);

  const loadDomains = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://pang.55kk.top:29999/domains/blacklist');
      const data = await response.json();
      setDomains(data.data || []);
    } catch (error) {
      console.error('加载域名黑名单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      alert('请输入域名');
      return;
    }

    setAddingDomain(true);
    try {
      const response = await fetch('https://pang.55kk.top:29999/domains/blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });

      if (response.ok) {
        setNewDomain('');
        loadDomains();
      } else {
        const error = await response.json();
        alert(error.detail || '添加失败');
      }
    } catch (error) {
      console.error('添加域名失败:', error);
      alert('添加失败，请重试');
    } finally {
      setAddingDomain(false);
    }
  };

  const handleDeleteDomain = async (domainId, domainName) => {
    if (!window.confirm(`确定要从黑名单移除域名 "${domainName}" 吗？`)) {
      return;
    }

    try {
      const response = await fetch(`https://pang.55kk.top:29999/domains/blacklist/${domainId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDomains(prev => prev.filter(d => d.id !== domainId));
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除域名失败:', error);
      alert('删除失败，请重试');
    }
  };

  return (
    <div>
      <PageHeader title="域名黑名单管理" />
      
      {/* 添加域名表单 */}
      <div className="p-6 mb-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">添加域名到黑名单</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddDomain()}
            placeholder="例如: example.com"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={addingDomain}
          />
          <button
            onClick={handleAddDomain}
            disabled={addingDomain || !newDomain.trim()}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white inline-flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {addingDomain ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>添加中...</span>
              </>
            ) : (
              <>
                <Icon name="plus" className="w-5 h-5" />
                <span>添加到黑名单</span>
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          说明：黑名单中的域名即使引入了广告脚本，也不会弹出广告
        </p>
      </div>

      {/* 域名列表 */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          黑名单列表 ({domains.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            加载中...
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            暂无黑名单域名
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    域名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    添加时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {domains.map(domain => (
                  <tr key={domain.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {domain.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {domain.domain}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {domain.created_at ? dayjs(domain.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteDomain(domain.id, domain.domain)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 border border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 text-sm font-medium"
                      >
                        移除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

