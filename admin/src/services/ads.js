import http from './http';

// 获取广告列表
export async function fetchAds(params) {
  const response = await http.get('/ads', { params });
  return response.data.data; // 后端返回格式是 {data: rows}
}

// 上传广告
export async function uploadAd(formData) {
  const response = await http.post('/ads/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// 编辑广告
export async function updateAd(adId, formData) {
  const response = await http.put(`/ads/${adId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// 更新广告状态
export async function updateAdStatus(adId, status) {
  const response = await http.patch(`/ads/${adId}/status`, { status });
  return response.data;
}

// 更新X号重定向设置
export async function updateAdXRedirect(adId, enabled) {
  const response = await http.patch(`/ads/${adId}/x_redirect`, { enabled });
  return response.data;
}

// 删除广告
export async function deleteAd(adId) {
  const response = await http.delete(`/ads/${adId}`);
  return response.data;
}

// 获取广告投放开关（总/主/次）
export async function fetchAdSettings() {
  // 返回：{ global_enabled, main_enabled, secondary_enabled }
  const response = await http.get('/ads/settings');
  return response.data;
}

// 更新广告投放开关（部分更新即可）
export async function updateAdSettings(payload) {
  // payload 示例：{ global_enabled: true, main_enabled: false }
  const response = await http.patch('/ads/settings', payload);
  return response.data;
}
