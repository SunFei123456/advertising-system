import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import EChart from '../components/EChart';
import { fetchStatsOverview, fetchDailyStats } from '../services/traffic';
import dayjs from 'dayjs';

// 将流量数据转换为 ECharts 需要的格式
const toChartOption = (dailyData, key, name) => {
  if (!dailyData || !Array.isArray(dailyData)) return null;
  return {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dailyData.map(d => d.day),
    },
    yAxis: { type: 'value' },
    series: [{
      name,
      type: 'line',
      data: dailyData.map(d => d[key]),
    }],
    grid: { left: 50, right: 20, top: 40, bottom: 30 }
  };
};

export default function TrafficManagement() {
  const [overviewData, setOverviewData] = useState({});
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: dayjs().format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  });

  const loadTrafficData = async () => {
    setLoading(true);
    const overview = await fetchStatsOverview();
    setOverviewData(overview);

    const daily = await fetchDailyStats({
      start: dateRange.start,
      end: dateRange.end,
    });
    setDailyData(daily);
    setLoading(false);
  };

  // 根据日期范围计算KPI数据
  const calculateKpiData = () => {
    if (!dailyData || Object.keys(dailyData).length === 0) return {};
    
    const totalViews = dailyData.page_views?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    const totalClicks = dailyData.clicks?.reduce((sum, item) => sum + (item.clicks || 0), 0) || 0;
    const mainClicks = dailyData.main_clicks?.reduce((sum, item) => sum + (item.clicks || 0), 0) || 0;
    const secondaryClicks = dailyData.secondary_clicks?.reduce((sum, item) => sum + (item.clicks || 0), 0) || 0;
    
    return {
      total_views: totalViews,
      total_clicks: totalClicks,
      main_clicks: mainClicks,
      secondary_clicks: secondaryClicks
    };
  };

  // 生成时间范围描述
  const getDateRangeLabel = () => {
    const start = dayjs(dateRange.start);
    const end = dayjs(dateRange.end);
    const today = dayjs();
    
    if (start.isSame(today, 'day') && end.isSame(today, 'day')) {
      return '今日';
    } else if (start.isSame(end, 'day')) {
      return start.format('MM-DD');
    } else {
      return `${start.format('MM-DD')} 至 ${end.format('MM-DD')}`;
    }
  };

  const kpiData = calculateKpiData();

  useEffect(() => {
    loadTrafficData();
  }, [dateRange]);

  const kpis = [
    { key: 'total_views', label: '网站总访问量', icon: 'globe' },
    { key: 'total_clicks', label: '总广告访问量', icon: 'list' },
    { key: 'main_clicks', label: '主广告访问量', icon: 'list' },
    { key: 'secondary_clicks', label: '次广告访问量', icon: 'list' },
  ];

  return (
    <div>
      <PageHeader title="网站流量管理" />

      {/* 日期筛选 */}
      <div className="p-6 mb-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">日期范围:</span>
          <input 
            type="date" 
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            value={dateRange.start} 
            onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} 
          />
          <span className="text-gray-500 dark:text-gray-400">-</span>
          <input 
            type="date" 
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            value={dateRange.end} 
            onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} 
          />
        </div>
      </div>

      {/* KPI 区 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
           <div key={kpi.key} className="p-6 rounded-2xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-200 dark:hover:border-zinc-600">
             <div className="flex items-center justify-between mb-5">
               <div className={`p-3 rounded-xl ${
                 index === 0 ? 'bg-blue-50 text-blue-500 dark:bg-blue-950 dark:text-blue-400' :
                 index === 1 ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950 dark:text-emerald-400' :
                 index === 2 ? 'bg-violet-50 text-violet-500 dark:bg-violet-950 dark:text-violet-400' :
                 'bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400'
               }`}>
                 <Icon name={kpi.icon} className="w-6 h-6" />
               </div>
               <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                 index === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                 index === 1 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                 index === 2 ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300' :
                 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
               }`}>
                 {getDateRangeLabel()}
               </div>
             </div>
             <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">{kpi.label}</div>
             <div className="flex items-baseline gap-2">
               {loading ? (
                 <div className="animate-pulse bg-gray-200 dark:bg-zinc-700 h-8 w-20 rounded"></div>
               ) : (
                 <>
                   <span className={`text-3xl font-bold ${
                     index === 0 ? 'text-blue-600 dark:text-blue-400' :
                     index === 1 ? 'text-emerald-600 dark:text-emerald-400' :
                     index === 2 ? 'text-violet-600 dark:text-violet-400' :
                     'text-amber-600 dark:text-amber-400'
                   }`}>
                     {(kpiData[kpi.key] || 0).toLocaleString()}
                   </span>
                   <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">次</span>
                 </>
               )}
             </div>
           </div>
         ))}
      </div>

      {/* 图表区 */}
       <div className="grid grid-cols-1 gap-6">
         <div className="p-6 rounded-2xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-200">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-3 rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-950 dark:text-blue-400">
               <Icon name="gauge" className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">网站访问图表</h3>
           </div>
           <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-5">
             <EChart option={toChartOption(dailyData.page_views, 'count', '访问量')} style={{ height: 350 }} />
           </div>
         </div>
         <div className="p-6 rounded-2xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-200">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950 dark:text-emerald-400">
               <Icon name="list" className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">主广告点击量图表</h3>
           </div>
           <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-5">
             <EChart option={toChartOption(dailyData.main_clicks, 'clicks', '点击量')} style={{ height: 350 }} />
           </div>
         </div>
         <div className="p-6 rounded-2xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-200">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-3 rounded-xl bg-violet-50 text-violet-500 dark:bg-violet-950 dark:text-violet-400">
               <Icon name="list" className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">次广告点击量图表</h3>
           </div>
           <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-5">
             <EChart option={toChartOption(dailyData.secondary_clicks, 'clicks', '点击量')} style={{ height: 350 }} />
           </div>
         </div>
       </div>
    </div>
  );
}
