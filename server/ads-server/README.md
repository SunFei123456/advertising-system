# 广告后台 (FastAPI + 原生 SQL)

项目包含一个使用 FastAPI 和原生 sqlite SQL 的最小后端，实现广告管理与流量统计的 API。

快速开始:

1. 创建并激活你的 Python 环境。
2. 安装依赖:

   pip install -r requirements.txt

3. 启动服务:

   uvicorn app.main:app --reload

接口摘要:

- POST /ads/upload  -> 上传广告（multipart: file, link, is_main, x_redirect_enabled）
- GET /ads -> 广告列表，支持 query: start,end,type(status main/secondary),status
- GET /ads/random_pair -> 返回一个主广告和一个次广告（各自随机）
- PATCH /ads/{id}/status -> 更改状态 active/inactive
- PATCH /ads/{id}/x_redirect -> 控制 X 按钮是否跳转
- DELETE /ads/{id} -> 删除广告
- POST /events/page_view -> 记录页面访问
- POST /events/click -> 记录广告点击 (body: {"ad_id": number}) 返回广告链接
- GET /stats/overview -> 总览数据
- GET /stats/daily?start=YYYY-MM-DD&end=YYYY-MM-DD -> 按天统计

数据库: sqlite 存储在仓库根目录下的 `ads.db`。

注意: 这是一个最小可用实现，建议在生产中使用更成熟的安全、鉴权与存储策略。
