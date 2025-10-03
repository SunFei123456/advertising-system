from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from typing import Optional
from pydantic import BaseModel
from urllib.parse import urlparse

from . import db

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'static', 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="广告后台 API")

# 添加CORS中间件 - 修复跨域访问问题
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有域名
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # 明确指定允许的方法
    allow_headers=["*"],  # 允许所有请求头
    expose_headers=["*"],  # 暴露所有响应头
)

app.mount('/static', StaticFiles(directory=os.path.join(BASE_DIR, 'static')), name='static')

# 添加 OPTIONS 处理路由，确保预检请求正确响应
@app.options("/{full_path:path}")
async def options_handler(request: Request):
    """处理所有 OPTIONS 预检请求"""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )


class UploadResponse(BaseModel):
    id: int


class AdSettingsOut(BaseModel):
    """广告投放开关返回模型"""
    global_enabled: bool
    main_enabled: bool
    secondary_enabled: bool
    main_ad_once_per_day: bool
    secondary_ad_once_per_day: bool


class AdSettingsPatch(BaseModel):
    """广告投放开关部分更新模型（任意字段可选）"""
    global_enabled: Optional[bool] = None
    main_enabled: Optional[bool] = None
    secondary_enabled: Optional[bool] = None
    main_ad_once_per_day: Optional[bool] = None
    secondary_ad_once_per_day: Optional[bool] = None


class DomainIn(BaseModel):
    """域名输入模型"""
    domain: str


@app.on_event('startup')
def startup():
    db.init_db()


@app.post('/ads/upload', response_model=UploadResponse)
async def upload_ad(
    file: UploadFile = File(...),
    link: str = Form(...),
    is_main: Optional[bool] = Form(False),
    x_redirect_enabled: Optional[bool] = Form(True),
):
    # save file
    ext = os.path.splitext(file.filename)[1]
    fname = f"{uuid.uuid4().hex}{ext}"
    fpath = os.path.join(UPLOAD_DIR, fname)
    contents = await file.read()
    with open(fpath, 'wb') as f:
        f.write(contents)
    # img_url could be a static path
    img_url = f"/static/uploads/{fname}"
    ad_id = db.create_ad(img_url=img_url, link=link, is_main=is_main, x_redirect_enabled=x_redirect_enabled)
    return {'id': ad_id}


@app.get('/ads')
def list_ads(start: Optional[str]=None, end: Optional[str]=None, type: Optional[str]=None, status: Optional[str]=None):
    rows = db.list_ads(start=start, end=end, type_filter=type, status=status)
    return {'data': rows}


@app.get('/ads/random_pair')
def random_pair(domain: Optional[str] = None, request: Request = None):
    # 获取域名（优先从参数，其次从请求头）
    if not domain:
        domain = extract_domain_from_headers(request) if request else 'unknown'
    
    # 检查域名是否在黑名单中
    if domain and domain != 'unknown' and db.is_domain_blacklisted(domain):
        return {
            'code': 200,
            'msg': 'domain blacklisted',
            'data': {'main': None, 'secondary': None}
        }
    
    # 获取广告设置（包括频率控制）
    settings = db.get_ad_settings()
    
    pair = db.get_random_pair()
    return {
        'code': 200,
        'msg': 'success',
        'data': pair,
        'settings': {
            'main_ad_once_per_day': settings['main_ad_once_per_day'],
            'secondary_ad_once_per_day': settings['secondary_ad_once_per_day'],
        }
    }


@app.get('/ads/settings', response_model=AdSettingsOut)
def get_ad_settings():
    """获取广告投放开关"""
    settings = db.get_ad_settings()
    return AdSettingsOut(**settings)


@app.patch('/ads/settings')
def patch_ad_settings(payload: AdSettingsPatch):
    """部分更新广告投放开关"""
    db.update_ad_settings(
        global_enabled=payload.global_enabled,
        main_enabled=payload.main_enabled,
        secondary_enabled=payload.secondary_enabled,
        main_ad_once_per_day=payload.main_ad_once_per_day,
        secondary_ad_once_per_day=payload.secondary_ad_once_per_day,
    )
    return {'ok': True}


class StatusUpdate(BaseModel):
    status: str

@app.patch('/ads/{ad_id}/status')
def patch_status(ad_id: int, payload: StatusUpdate):
    if payload.status not in ('active', 'inactive'):
        raise HTTPException(status_code=400, detail='invalid status')
    db.update_ad_status(ad_id, payload.status)
    return {'ok': True}


@app.put('/ads/{ad_id}')
async def update_ad(
    ad_id: int,
    file: Optional[UploadFile] = File(None),
    link: str = Form(...),
    is_main: Optional[bool] = Form(False),
    x_redirect_enabled: Optional[bool] = Form(True),
):
    # 如果有新文件，保存新文件
    img_url = None
    if file:
        ext = os.path.splitext(file.filename)[1]
        fname = f"{uuid.uuid4().hex}{ext}"
        fpath = os.path.join(UPLOAD_DIR, fname)
        contents = await file.read()
        with open(fpath, 'wb') as f:
            f.write(contents)
        img_url = f"/static/uploads/{fname}"
    
    # 更新广告信息
    db.update_ad(ad_id, img_url=img_url, link=link, is_main=is_main, x_redirect_enabled=x_redirect_enabled)
    return {'ok': True}

@app.delete('/ads/{ad_id}')
def remove_ad(ad_id: int):
    db.delete_ad(ad_id)
    return {'ok': True}


class XRedirectUpdate(BaseModel):
    enabled: bool


@app.patch('/ads/{ad_id}/x_redirect')
def patch_x_redirect(ad_id: int, payload: XRedirectUpdate):
    db.update_ad_x_redirect(ad_id, payload.enabled)
    return {'ok': True}


@app.post('/events/page_view')
def page_view(request: Request):
    # 获取域名和IP
    domain = extract_domain_from_headers(request)
    client_ip = extract_client_ip(request)
    
    # 双写：保持原有统计 + 新增按域名IP统计
    db.record_page_view()
    db.record_visitor_view_by_domain_ip(domain, client_ip)
    
    return {'ok': True}


class ClickIn(BaseModel):
    ad_id: int
    domain: Optional[str] = None


def extract_domain_from_headers(request: Request) -> str:
    """从请求头中提取域名"""
    # 优先从 Origin 头获取
    origin = request.headers.get('origin')
    if origin:
        parsed = urlparse(origin)
        return parsed.netloc or 'unknown'
    
    # 其次从 Referer 头获取
    referer = request.headers.get('referer')
    if referer:
        parsed = urlparse(referer)
        return parsed.netloc or 'unknown'
    
    return 'unknown'


def extract_client_ip(request: Request) -> str:
    """从请求中提取客户端IP"""
    # 优先从 X-Forwarded-For 头获取（代理情况）
    x_forwarded_for = request.headers.get('x-forwarded-for')
    if x_forwarded_for:
        # 取第一个IP（客户端真实IP）
        return x_forwarded_for.split(',')[0].strip()
    
    # 其次从 X-Real-IP 头获取
    x_real_ip = request.headers.get('x-real-ip')
    if x_real_ip:
        return x_real_ip.strip()
    
    # 最后使用直连IP
    if request.client and request.client.host:
        return request.client.host
    
    return 'unknown'


@app.post('/events/click')
def ad_click(payload: ClickIn, request: Request):
    ad = db.get_ad(payload.ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail='ad not found')
    
    # 获取域名和IP
    domain = payload.domain or extract_domain_from_headers(request)
    client_ip = extract_client_ip(request)
    
    # 双写：保持原有统计 + 新增按域名IP统计
    db.record_ad_click(payload.ad_id)
    db.record_ad_click_by_domain_ip(payload.ad_id, domain, client_ip)
    
    return {'link': ad['link']}


@app.get('/stats/overview')
def overview():
    return db.get_overview()


@app.get('/stats/daily')
def daily(start: str, end: str):
    return db.get_daily_stats(start, end)


@app.get('/stats/clicks/by_domain_ip')
def clicks_by_domain_ip(start: str, end: str, type: str = 'main', page: int = 1, page_size: int = 10):
    """获取按域名和IP的点击统计数据"""
    is_main = type == 'main'
    
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    if page_size > 100:
        page_size = 100

    result = db.get_clicks_by_domain_ip(start, end, is_main, page, page_size)
    
    total_items = result['total']
    total_pages = (total_items + page_size - 1) // page_size

    return {
        'data': result['data'],
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages,
            'total_items': total_items,
        }
    }


@app.get('/stats/visitors/by_domain_ip')
def visitors_by_domain_ip(start: str, end: str, page: int = 1, page_size: int = 10):
    """获取按域名和IP的访客统计数据"""
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    if page_size > 100:
        page_size = 100
    
    result = db.get_visitors_by_domain_ip(start, end, page, page_size)
    
    total_items = result['total']
    total_pages = (total_items + page_size - 1) // page_size

    return {
        'data': result['data'],
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages,
            'total_items': total_items,
        },
        'summary':result['summary']
    }


# 域名黑名单管理接口
@app.get('/domains/blacklist')
def get_blacklist_domains():
    """获取黑名单域名列表"""
    domains = db.list_blacklist_domains()
    return {'data': domains}


@app.post('/domains/blacklist')
def add_to_blacklist(payload: DomainIn):
    """添加域名到黑名单"""
    if not payload.domain or payload.domain.strip() == '':
        raise HTTPException(status_code=400, detail='domain cannot be empty')
    
    domain = payload.domain.strip()
    success = db.add_domain_to_blacklist(domain)
    
    if not success:
        raise HTTPException(status_code=400, detail='domain already in blacklist')
    
    return {'ok': True, 'domain': domain}


@app.delete('/domains/blacklist/{domain_id}')
def remove_from_blacklist(domain_id: int):
    """从黑名单移除域名"""
    db.remove_domain_from_blacklist(domain_id)
    return {'ok': True}


@app.get('/domains/blacklist/check')
def check_domain_blacklist(domain: str):
    """检查域名是否在黑名单中"""
    is_blacklisted = db.is_domain_blacklisted(domain)
    return {'domain': domain, 'blacklisted': is_blacklisted}
