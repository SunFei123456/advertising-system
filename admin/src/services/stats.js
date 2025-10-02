import http from './http'

/**
 * 获取按域名和IP的点击统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.start - 开始日期 (YYYY-MM-DD)
 * @param {string} params.end - 结束日期 (YYYY-MM-DD)
 * @param {string} params.type - 广告类型 ('main' | 'secondary')
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @returns {Promise<Object>} 统计数据
 */
export const getClicksByDomainIp = async (params) => {
  const { start, end, type = 'main', page, page_size } = params
  
  const response = await http.get('/stats/clicks/by_domain_ip', {
    params: {
      start,
      end,
      type,
      page,
      page_size
    }
  })
  return response.data
}

/**
 * 获取按域名和IP的访客统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.start - 开始日期 (YYYY-MM-DD)
 * @param {string} params.end - 结束日期 (YYYY-MM-DD)
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @returns {Promise<Object>} 访客统计数据
 */
export const getVisitorsByDomainIp = async (params) => {
  const { start, end, page, page_size } = params
  
  const response = await http.get('/stats/visitors/by_domain_ip', {
    params: {
      start,
      end,
      page,
      page_size
    }
  })
  return response.data
}


/**
 * 获取统计概览数据
 * @returns {Promise<Object>} 概览数据
 */
export const getOverview = async () => {
  const response = await http.get('/stats/overview')
  return response.data
}

/**
 * 获取每日统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.start - 开始日期 (YYYY-MM-DD)
 * @param {string} params.end - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 每日统计数据
 */
export const getDailyStats = async (params) => {
  const { start, end } = params
  const response = await http.get('/stats/daily', {
    params: {
      start,
      end
    }
  })
  return response.data
}