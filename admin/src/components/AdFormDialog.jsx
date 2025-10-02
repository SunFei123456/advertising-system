import React, { useState, useEffect } from 'react';

export default function AdFormDialog({ open, onOk, onCancel, ad }) {
  const [form, setForm] = useState({ link: '', type: 'main', status: 'active', x_redirect_enabled: true, file: null });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ad) {
      setForm({ ...ad, type: ad.is_main ? 'main' : 'secondary', file: null });
    } else {
      setForm({ link: '', type: 'main', status: 'active', x_redirect_enabled: true, file: null });
    }
  }, [ad]);

  const handleOk = () => {
    onOk(form);
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, file: e.target.files[0] }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-lg mx-4 p-6 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 shadow-2xl transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{ad ? '编辑广告' : '新增广告'}</h3>
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-5">

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">广告链接</label>
            <input 
              value={form.link} 
              onChange={e => setForm(f => ({...f, link: e.target.value}))} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="请输入广告链接"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">广告类型</label>
            <select 
              value={form.type} 
              onChange={e => setForm(f => ({...f, type: e.target.value}))} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="main">主广告</option>
              <option value="secondary">次要广告</option>
            </select>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <input 
              type="checkbox" 
              checked={form.x_redirect_enabled} 
              onChange={e => setForm(f => ({...f, x_redirect_enabled: e.target.checked}))} 
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">X号关闭时跳转链接</label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">上传图片</label>
            {/* 当没有图片时显示上传区域 */}
            {!form.file && !form.img_url && (
              <div className="relative">
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept="image/*"
                />
                <div className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-zinc-800 dark:bg-zinc-900 hover:bg-gray-100 dark:border-zinc-600 dark:hover:border-zinc-500">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">点击上传</span> 或拖拽文件到此处
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF (最大 10MB)</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* 当有图片时显示图片预览区域 */}
            {(form.file || form.img_url) && (
              <div className="relative group">
                <div className="w-full h-32 rounded-lg border-2 border-gray-200 dark:border-zinc-600 overflow-hidden bg-gray-50 dark:bg-zinc-800">
                  <img 
                    src={form.file ? URL.createObjectURL(form.file) : `http://localhost:8000${form.img_url}`} 
                    alt="preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 重新上传按钮 */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="relative">
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      accept="image/*"
                    />
                    <button className="px-4 py-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg font-medium transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      重新上传
                    </button>
                  </div>
                </div>
                {/* 删除按钮 */}
                <button 
                  onClick={() => setForm(prev => ({ ...prev, file: null, img_url: '' }))}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700">
          <button 
            className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-medium" 
            onClick={onCancel}
          >
            取消
          </button>
          <button 
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105" 
            onClick={handleOk}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
