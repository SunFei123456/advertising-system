import http from './http';

// 获取统计概览
export async function fetchStatsOverview() {
  const response = await http.get('/stats/overview');
  return response.data;
}

// 获取日统计数据
export async function fetchDailyStats(params) {
  const response = await http.get('/stats/daily', { params });
  return response.data;
}
