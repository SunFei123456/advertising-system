import React, { useEffect, useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import DataTablePro from '../components/DataTablePro';
import { fetchAds, deleteAd, uploadAd, updateAd, updateAdStatus, updateAdXRedirect, fetchAdSettings, updateAdSettings } from '../services/ads';
import Icon from '../components/Icon';
import AdFormDialog from '../components/AdFormDialog';
import dayjs from 'dayjs';

export default function AdManagement() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  // 投放开关设置（总/主/次）
  const [adSettings, setAdSettings] = useState({
    global_enabled: true,
    main_enabled: true,
    secondary_enabled: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [filters, setFilters] = useState({
    start: '',
    end: '',
    type: 'all',
    status: 'all',
  });
  const [sorting, setSorting] = useState([]);

  const loadAds = () => {
    setLoading(true);
    const params = {
      start: filters.start || null,
      end: filters.end || null,
      type: filters.type === 'all' ? null : filters.type,
      status: filters.status === 'all' ? null : filters.status,
    };
    fetchAds(params).then(data => {
      setAds(data || []);
      setLoading(false);
    });
  };

  // 切换“总开关/主/次”——采用乐观更新，失败回滚
  const applySettingsUpdate = async (patch) => {
    const prev = adSettings;
    const next = { ...prev, ...patch };
    setAdSettings(next);
    try {
      await updateAdSettings(patch);
    } catch (e) {
      console.error('更新广告投放开关失败:', e);
      // 回滚
      setAdSettings(prev);
      // 也可以弹窗提示
      window.alert('更新广告投放开关失败，请重试');
    }
  };

  const handleToggleGlobal = () => {
    const newVal = !adSettings.global_enabled;
    applySettingsUpdate({ global_enabled: newVal });
  };

  const handleToggleMainEnabled = () => {
    // 当总开关关闭时，不允许单独更改主/次（UI 层禁用，这里再保护）
    if (!adSettings.global_enabled) return;
    const newVal = !adSettings.main_enabled;
    applySettingsUpdate({ main_enabled: newVal });
  };

  const handleToggleSecondaryEnabled = () => {
    if (!adSettings.global_enabled) return;
    const newVal = !adSettings.secondary_enabled;
    applySettingsUpdate({ secondary_enabled: newVal });
  };

  useEffect(() => {
    loadAds();
  }, [filters]);

  // 初始化加载广告投放开关
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const data = await fetchAdSettings();
        setAdSettings(data || { global_enabled: true, main_enabled: true, secondary_enabled: true });
      } catch (err) {
        console.error('获取广告投放开关失败:', err);
      } finally {
        setSettingsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleOpenDialog = (ad = null) => {
    setEditingAd(ad);
    setIsDialogOpen(true);
  };

  const handleEdit = (ad) => {
    handleOpenDialog(ad);
  };

  const handleCloseDialog = () => {
    setEditingAd(null);
    setIsDialogOpen(false);
  };

  const handleSaveAd = async (adData) => {
    const formData = new FormData();
    formData.append('link', adData.link);
    formData.append('is_main', adData.type === 'main');
    formData.append('x_redirect_enabled', adData.x_redirect_enabled);
    if (adData.file) {
      formData.append('file', adData.file);
    }

    try {
      if (editingAd) {
        // 编辑模式
        await updateAd(editingAd.id, formData);
      } else {
        // 新增模式
        await uploadAd(formData);
      }
      // 操作成功后重新获取最新数据
      loadAds();
      handleCloseDialog();
    } catch (error) {
      console.error('保存广告失败:', error);
      handleCloseDialog();
    }
  };

  const handleDeleteAd = async (adId) => {
    if (window.confirm('确定要删除这个广告吗？')) {
      try {
        await deleteAd(adId);
        // 立即从本地状态中移除
        setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
      } catch (error) {
        console.error('删除广告失败:', error);
        // 如果失败，重新加载数据
        loadAds();
      }
    }
  };

  const handleToggleStatus = async (adId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? '上架' : '下架';
    
    if (window.confirm(`确定要${action}这个广告吗？`)) {
      try {
        await updateAdStatus(adId, newStatus);
        // 立即更新本地状态，实现即时响应
        setAds(prevAds => 
          prevAds.map(ad => 
            ad.id === adId ? { ...ad, status: newStatus } : ad
          )
        );
      } catch (error) {
        console.error('更新状态失败:', error);
        // 如果失败，重新加载数据
        loadAds();
      }
    }
  };

  const handleToggleXRedirect = async (adId, newValue) => {
    try {
      await updateAdXRedirect(adId, newValue);
      // 立即更新本地状态
      setAds(prevAds => 
        prevAds.map(ad => 
          ad.id === adId ? { ...ad, x_redirect_enabled: newValue } : ad
        )
      );
    } catch (error) {
      console.error('更新X号跳转状态失败:', error);
      // 如果失败，重新加载数据
      loadAds();
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(`https://pang.55kk.top:29999${imageUrl}`);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage('');
  };

  const columns = useMemo(() => [
    { 
      key: 'id', 
      title: 'ID', 
      dataIndex: 'id', 
      width: 60, 
      sortable: true,
      sortingFn: (rowA, rowB) => {
        const a = Number(rowA.original.id);
        const b = Number(rowB.original.id);
        return a - b;
      }
    },
    {
      key: 'img_url',
      title: '图片',
      dataIndex: 'img_url',
      width: 80,
      sortable: false,
      render: (url) => (
        <img 
          src={`https://pang.55kk.top:29999${url}`} 
          alt="ad" 
          className="h-10 w-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => handleImageClick(url)}
        />
      )
    },
    { 
      key: 'link', 
      title: '链接', 
      dataIndex: 'link', 
      width: 300, 
      sortable: false,
      render: (link) => {
        const maxLength = 30; // 设置默认显示字数
        const displayText = link && link.length > maxLength ? link.substring(0, maxLength) + '...' : link;
        return (
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block"
            title={link}
          >
            {displayText}
          </a>
        );
      }
    },
    { 
      key: 'type', 
      title: '类型', 
      dataIndex: 'is_main',
      width: 30,
      sortable: false,
      render: (isMain) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isMain 
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
        }`}>
          {isMain ? '主广告' : '次要广告'}
        </span>
      )
    },
    { 
      key: 'status', 
      title: '状态', 
      dataIndex: 'status',
      width: 30,
      sortable: false,
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'active' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
        }`}>
          {status === 'active' ? '激活' : '禁用'}
        </span>
      )
    },
    { 
      key: 'x_redirect_enabled', 
      title: 'X号跳转', 
      dataIndex: 'x_redirect_enabled', 
      width: 90, 
      sortable: false, 
      render: (enabled, record) => (
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={() => handleToggleXRedirect(record.id, !enabled)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      )
    },
    {
      key: 'created_at',
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
      sortable: true,
      sortingFn: (rowA, rowB) => {
        const a = new Date(rowA.original.created_at);
        const b = new Date(rowB.original.created_at);
        return a.getTime() - b.getTime();
      },
      render: (createdAt) => {
        if (!createdAt) return '-';
        return dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      key: 'actions',
      title: '操作',
      width: 200,
      sortable: false,
      render: (text, record) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(record)} 
            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-sm font-medium"
          >
            编辑
          </button>
          <button 
            onClick={() => handleDeleteAd(record.id)} 
            className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 border border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 text-sm font-medium"
          >
            删除
          </button>
          <button 
            onClick={() => handleToggleStatus(record.id, record.status)} 
            className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium ${
              record.status === 'active' 
                ? 'bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-300 hover:text-orange-700 dark:hover:text-orange-200 border border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600'
                : 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-300 hover:text-green-700 dark:hover:text-green-200 border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600'
            }`}
          >
            {record.status === 'active' ? '下架' : '上架'}
          </button>
        </div>
      )
    }
  ], [ads]);

  return (
    <div>
      <PageHeader title="广告管理" extra={
        <button 
          onClick={() => handleOpenDialog()} 
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white inline-flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Icon name="plus" className="w-5 h-5" />
          <span>新增广告</span>
        </button>
      } />
      <div className="p-6 mb-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px]">日期:</span>
            <input 
              type="date" 
              value={filters.start} 
              onChange={e => setFilters(f => ({...f, start: e.target.value}))} 
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            />
            <span className="text-gray-500 dark:text-gray-400">-</span>
            <input 
              type="date" 
              value={filters.end} 
              onChange={e => setFilters(f => ({...f, end: e.target.value}))} 
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px]">类型:</span>
            <select 
              value={filters.type} 
              onChange={e => setFilters(f => ({...f, type: e.target.value}))} 
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-[120px]"
            >
              <option value="all">全部</option>
              <option value="main">主广告</option>
              <option value="secondary">次要广告</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px]">状态:</span>
            <select 
              value={filters.status} 
              onChange={e => setFilters(f => ({...f, status: e.target.value}))} 
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-[120px]"
            >
              <option value="all">全部</option>
              <option value="active">激活</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
          {/* 投放控制：总开关/主/次 */}
          <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">投放控制</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">总开关</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!adSettings.global_enabled}
                  onChange={handleToggleGlobal}
                  className="sr-only peer"
                  disabled={settingsLoading}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${adSettings.global_enabled ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>主广告</span>
              <label className={`relative inline-flex items-center ${adSettings.global_enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                <input
                  type="checkbox"
                  checked={!!adSettings.main_enabled}
                  onChange={handleToggleMainEnabled}
                  className="sr-only peer"
                  disabled={!adSettings.global_enabled || settingsLoading}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${adSettings.global_enabled ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>次要广告</span>
              <label className={`relative inline-flex items-center ${adSettings.global_enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                <input
                  type="checkbox"
                  checked={!!adSettings.secondary_enabled}
                  onChange={handleToggleSecondaryEnabled}
                  className="sr-only peer"
                  disabled={!adSettings.global_enabled || settingsLoading}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <DataTablePro
          columns={columns}
          data={ads}
          loading={loading}
          rowKey="id"
          enableColumnResizing={false}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      </div>
      <AdFormDialog
        open={isDialogOpen}
        onOk={handleSaveAd}
        onCancel={handleCloseDialog}
        ad={editingAd}
      />
      
      {/* 图片放大模态框 */}
      {imageModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleCloseImageModal}
        >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <button 
              onClick={handleCloseImageModal}
              className="absolute top-2 right-2 text-white hover:text-gray-300 text-2xl font-bold z-10"
            >
              ×
            </button>
            <img 
              src={selectedImage} 
              alt="放大图片" 
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
