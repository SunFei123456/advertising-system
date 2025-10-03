
import threading
import os
from datetime import datetime
import random
import pymysql
from pymysql.cursors import DictCursor

# MySQL 配置
MYSQL_HOST = os.environ.get('MYSQL_HOST', '127.0.0.1')
MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
MYSQL_USER = os.environ.get('MYSQL_USER', 'ads-db')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'msLLm3477eaRYT8z')
MYSQL_DB = os.environ.get('MYSQL_DB', 'ads-db')


DB_LOCK = threading.Lock()

SCHEMA_TABLES = [
    # 广告表
    """
    CREATE TABLE IF NOT EXISTS ads (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        img_url VARCHAR(1024) NOT NULL,
        link VARCHAR(2048) NOT NULL,
        is_main TINYINT(1) DEFAULT 0,
        status VARCHAR(32) DEFAULT 'active',
        x_redirect_enabled TINYINT(1) DEFAULT 1,
        created_at DATETIME
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    # 设置表：用于全局/分类级别的投放开关
    """
    CREATE TABLE IF NOT EXISTS settings (
        k VARCHAR(128) PRIMARY KEY,
        v VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    # 域名黑名单表
    """
    CREATE TABLE IF NOT EXISTS domain_blacklist (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        domain VARCHAR(255) NOT NULL UNIQUE,
        created_at DATETIME,
        INDEX idx_domain (domain)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    # 页面访问量，按 day 为唯一键
    """
    CREATE TABLE IF NOT EXISTS page_views (
        day DATE PRIMARY KEY,
        count BIGINT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    # 广告点击，(ad_id, day) 唯一
    """
    CREATE TABLE IF NOT EXISTS ad_clicks (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        ad_id BIGINT,
        day DATE,
        clicks BIGINT DEFAULT 0,
        UNIQUE KEY uk_ad_day (ad_id, day)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    # 广告点击按域名和IP统计，(ad_id, day, domain, ip) 唯一
    """
    CREATE TABLE IF NOT EXISTS ad_clicks_by_domain_ip (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        ad_id BIGINT NOT NULL,
        day DATE NOT NULL,
        domain VARCHAR(255) NOT NULL,
        ip VARCHAR(64) NOT NULL,
        clicks BIGINT DEFAULT 0,
        UNIQUE KEY uk_ad_day_domain_ip (ad_id, day, domain, ip)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    # 访客访问按域名和IP统计，(day, domain, ip) 唯一
    """
    CREATE TABLE IF NOT EXISTS visitor_views_by_domain_ip (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        day DATE NOT NULL,
        domain VARCHAR(255) NOT NULL,
        ip VARCHAR(64) NOT NULL,
        visits BIGINT DEFAULT 0,
        UNIQUE KEY uk_day_domain_ip (day, domain, ip)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
]


def _get_root_conn():
    """先连接到 MySQL 服务（不指定 db），用于创建数据库"""
    return pymysql.connect(
        host=MYSQL_HOST, 
        port=MYSQL_PORT, 
        user=MYSQL_USER, 
        password=MYSQL_PASSWORD, 
        cursorclass=DictCursor, 
        autocommit=True
    )


def get_conn():
    """获取数据库连接"""
    return pymysql.connect(
        host=MYSQL_HOST, 
        port=MYSQL_PORT, 
        user=MYSQL_USER, 
        password=MYSQL_PASSWORD, 
        database=MYSQL_DB, 
        cursorclass=DictCursor, 
        autocommit=True
    )


def init_db():
    """初始化数据库和表"""
    with DB_LOCK:
        # 创建数据库（如果不存在），然后创建表
        root_conn = _get_root_conn()
        try:
            with root_conn.cursor() as cur:
                cur.execute(f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DB}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;")
        finally:
            root_conn.close()

        conn = get_conn()
        try:
            with conn.cursor() as cur:
                for s in SCHEMA_TABLES:
                    cur.execute(s)
                # 初始化默认设置（如不存在）
                # ads_global_enabled / ads_main_enabled / ads_secondary_enabled 全部默认开启
                cur.execute("INSERT IGNORE INTO settings (k, v) VALUES ('ads_global_enabled', 'true')")
                cur.execute("INSERT IGNORE INTO settings (k, v) VALUES ('ads_main_enabled', 'true')")
                cur.execute("INSERT IGNORE INTO settings (k, v) VALUES ('ads_secondary_enabled', 'true')")
                # 广告频率控制：主广告和次要广告每日仅弹出一次的开关，默认关闭
                cur.execute("INSERT IGNORE INTO settings (k, v) VALUES ('main_ad_once_per_day', 'false')")
                cur.execute("INSERT IGNORE INTO settings (k, v) VALUES ('secondary_ad_once_per_day', 'false')")
        finally:
            conn.close()


# CRUD + 统计实现
def create_ad(img_url: str, link: str, is_main: bool = False, x_redirect_enabled: bool = True):
    """创建广告"""
    now = datetime.now()
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO ads (img_url, link, is_main, x_redirect_enabled, created_at) VALUES (%s, %s, %s, %s, %s)",
                    (img_url, link, 1 if is_main else 0, 1 if x_redirect_enabled else 0, now),
                )
                ad_id = cur.lastrowid
                return ad_id
        finally:
            conn.close()


def list_ads(start: str = None, end: str = None, type_filter: str = None, status: str = None):
    """获取广告列表"""
    q = "SELECT * FROM ads WHERE 1=1"
    params = []
    if type_filter == 'main':
        q += " AND is_main=1"
    elif type_filter == 'secondary':
        q += " AND is_main=0"
    if status:
        q += " AND status=%s"
        params.append(status)
    if start:
        q += " AND created_at>=%s"
        params.append(start)
    if end:
        q += " AND created_at<=%s"
        params.append(end)
    q += " ORDER BY created_at DESC"
    
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(q, params)
                rows = cur.fetchall()
                return rows
        finally:
            conn.close()


def get_ad(ad_id: int):
    """根据ID获取广告"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM ads WHERE id=%s", (ad_id,))
                row = cur.fetchone()
                return row
        finally:
            conn.close()


def delete_ad(ad_id: int):
    """删除广告"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM ads WHERE id=%s", (ad_id,))
        finally:
            conn.close()


def update_ad_status(ad_id: int, status: str):
    """更新广告状态"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("UPDATE ads SET status=%s WHERE id=%s", (status, ad_id))
        finally:
            conn.close()


def update_ad_x_redirect(ad_id: int, enabled: bool):
    """更新广告X号重定向设置"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("UPDATE ads SET x_redirect_enabled=%s WHERE id=%s", (1 if enabled else 0, ad_id))
        finally:
            conn.close()


def update_ad(ad_id: int, img_url=None, link=None, is_main=None, x_redirect_enabled=None):
    """更新广告信息"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                # 构建动态更新语句
                updates = []
                params = []
                
                if img_url is not None:
                    updates.append("img_url=%s")
                    params.append(img_url)
                if link is not None:
                    updates.append("link=%s")
                    params.append(link)
                if is_main is not None:
                    updates.append("is_main=%s")
                    params.append(1 if is_main else 0)
                if x_redirect_enabled is not None:
                    updates.append("x_redirect_enabled=%s")
                    params.append(1 if x_redirect_enabled else 0)
                
                if updates:
                    params.append(ad_id)
                    sql = f"UPDATE ads SET {', '.join(updates)} WHERE id=%s"
                    cur.execute(sql, params)
        finally:
            conn.close()


def get_setting(key: str, default: str = None):
    """读取单个设置项。返回字符串值或默认值。"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT v FROM settings WHERE k=%s", (key,))
                row = cur.fetchone()
                if row and 'v' in row:
                    return row['v']
                return default
        finally:
            conn.close()


def set_setting(key: str, value: str):
    """写入单个设置项（字符串）。"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO settings (k, v) VALUES (%s, %s) ON DUPLICATE KEY UPDATE v=VALUES(v)",
                    (key, value)
                )
        finally:
            conn.close()


def _to_bool(s: str, default: bool = True) -> bool:
    """将字符串转换为布尔，支持 'true'/'false'（不区分大小写）。"""
    if s is None:
        return default
    return str(s).lower() in ('1', 'true', 'yes', 'y', 'on')


def get_ad_settings():
    """返回广告投放相关的布尔设置。"""
    ge = _to_bool(get_setting('ads_global_enabled', 'true'), True)
    me = _to_bool(get_setting('ads_main_enabled', 'true'), True)
    se = _to_bool(get_setting('ads_secondary_enabled', 'true'), True)
    main_once = _to_bool(get_setting('main_ad_once_per_day', 'false'), False)
    sec_once = _to_bool(get_setting('secondary_ad_once_per_day', 'false'), False)
    return {
        'global_enabled': ge,
        'main_enabled': me,
        'secondary_enabled': se,
        'main_ad_once_per_day': main_once,
        'secondary_ad_once_per_day': sec_once,
    }


def update_ad_settings(global_enabled: bool = None, main_enabled: bool = None, secondary_enabled: bool = None,
                      main_ad_once_per_day: bool = None, secondary_ad_once_per_day: bool = None):
    """更新广告投放相关的设置，允许部分更新。"""
    if global_enabled is not None:
        set_setting('ads_global_enabled', 'true' if global_enabled else 'false')
    if main_enabled is not None:
        set_setting('ads_main_enabled', 'true' if main_enabled else 'false')
    if secondary_enabled is not None:
        set_setting('ads_secondary_enabled', 'true' if secondary_enabled else 'false')
    if main_ad_once_per_day is not None:
        set_setting('main_ad_once_per_day', 'true' if main_ad_once_per_day else 'false')
    if secondary_ad_once_per_day is not None:
        set_setting('secondary_ad_once_per_day', 'true' if secondary_ad_once_per_day else 'false')


def get_random_pair():
    """获取随机的主广告和次要广告组合"""
    # 读取设置
    settings = get_ad_settings()
    ge = settings['global_enabled']
    me = settings['main_enabled']
    se = settings['secondary_enabled']

    if not ge:
        # 全局关闭则均不返回
        return {"main": None, "secondary": None}

    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                mains = []
                secs = []
                if me:
                    cur.execute("SELECT * FROM ads WHERE is_main=1 AND status='active'")
                    mains = cur.fetchall()
                if se:
                    cur.execute("SELECT * FROM ads WHERE is_main=0 AND status='active'")
                    secs = cur.fetchall()
        finally:
            conn.close()

    main = random.choice(mains) if mains else None
    secondary = random.choice(secs) if secs else None
    return {"main": main, "secondary": secondary}


def record_page_view(day: str = None):
    """记录页面访问量"""
    day = day or datetime.now().date().isoformat()
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                # 使用 INSERT ... ON DUPLICATE KEY UPDATE
                cur.execute(
                    "INSERT INTO page_views (day, count) VALUES (%s, 1) ON DUPLICATE KEY UPDATE count = count + 1", 
                    (day,)
                )
        finally:
            conn.close()




def record_ad_click(ad_id: int, day: str = None):
    """记录广告点击量"""
    day = day or datetime.now().date().isoformat()
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO ad_clicks (ad_id, day, clicks) VALUES (%s, %s, 1) ON DUPLICATE KEY UPDATE clicks = clicks + 1", 
                    (ad_id, day)
                )
        finally:
            conn.close()




def record_ad_click_by_domain_ip(ad_id: int, domain: str, ip: str, day: str = None):
    """记录按域名和IP的广告点击量"""
    day = day or datetime.now().date().isoformat()
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO ad_clicks_by_domain_ip (ad_id, day, domain, ip, clicks) VALUES (%s, %s, %s, %s, 1) ON DUPLICATE KEY UPDATE clicks = clicks + 1", 
                    (ad_id, day, domain, ip)
                )
        finally:
            conn.close()




def get_overview():
    """获取统计概览"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT SUM(count) as total_views FROM page_views")
                total_views = cur.fetchone().get('total_views') or 0
                
                cur.execute("SELECT SUM(clicks) as total_clicks FROM ad_clicks")
                total_clicks = cur.fetchone().get('total_clicks') or 0
                
                cur.execute(
                    "SELECT SUM(ad_clicks.clicks) as main_clicks FROM ad_clicks JOIN ads ON ads.id=ad_clicks.ad_id WHERE ads.is_main=1"
                )
                main_clicks = cur.fetchone().get('main_clicks') or 0
                
                cur.execute(
                    "SELECT SUM(ad_clicks.clicks) as sec_clicks FROM ad_clicks JOIN ads ON ads.id=ad_clicks.ad_id WHERE ads.is_main=0"
                )
                sec_clicks = cur.fetchone().get('sec_clicks') or 0
                
                return {
                    'total_views': total_views,
                    'total_clicks': total_clicks,
                    'main_clicks': main_clicks,
                    'secondary_clicks': sec_clicks
                }
        finally:
            conn.close()




def get_daily_stats(start: str, end: str):
    """获取日统计数据"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                # 页面访问量
                cur.execute(
                    "SELECT DATE_FORMAT(day, '%%Y-%%m-%%d') as day, count FROM page_views WHERE day BETWEEN %s AND %s ORDER BY day", 
                    (start, end)
                )
                pv = [{'day': r['day'], 'count': r['count']} for r in cur.fetchall()]
                
                # 总点击量
                cur.execute(
                    "SELECT DATE_FORMAT(day, '%%Y-%%m-%%d') as day, SUM(clicks) as clicks FROM ad_clicks WHERE day BETWEEN %s AND %s GROUP BY day ORDER BY day", 
                    (start, end)
                )
                clicks = [{'day': r['day'], 'clicks': r['clicks']} for r in cur.fetchall()]
                
                # 主广告点击量
                cur.execute(
                    "SELECT DATE_FORMAT(day, '%%Y-%%m-%%d') as day, SUM(ad_clicks.clicks) as clicks FROM ad_clicks JOIN ads ON ads.id=ad_clicks.ad_id WHERE ads.is_main=1 AND day BETWEEN %s AND %s GROUP BY day ORDER BY day", 
                    (start, end)
                )
                main = [{'day': r['day'], 'clicks': r['clicks']} for r in cur.fetchall()]
                
                # 次要广告点击量
                cur.execute(
                    "SELECT DATE_FORMAT(day, '%%Y-%%m-%%d') as day, SUM(ad_clicks.clicks) as clicks FROM ad_clicks JOIN ads ON ads.id=ad_clicks.ad_id WHERE ads.is_main=0 AND day BETWEEN %s AND %s GROUP BY day ORDER BY day", 
                    (start, end)
                )
                sec = [{'day': r['day'], 'clicks': r['clicks']} for r in cur.fetchall()]
                
                return {
                    'page_views': pv, 
                    'clicks': clicks, 
                    'main_clicks': main, 
                    'secondary_clicks': sec
                }
        finally:
            conn.close()




def get_clicks_by_domain_ip(start: str, end: str, is_main: bool = True, page: int = 1, page_size: int = 10):
    """获取按域名和IP的点击统计数据"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                # Get total count
                cur.execute(
                    """
                    SELECT COUNT(*) as total
                    FROM (
                        SELECT 1
                        FROM ad_clicks_by_domain_ip 
                        JOIN ads ON ads.id = ad_clicks_by_domain_ip.ad_id 
                        WHERE ads.is_main = %s AND day BETWEEN %s AND %s 
                        GROUP BY domain, ip, day
                    ) as grouped_data
                    """,
                    (1 if is_main else 0, start, end)
                )
                total = cur.fetchone()['total']

                # Get paginated data
                offset = (page - 1) * page_size
                cur.execute(
                    """
                    SELECT 
                        domain, 
                        ip, 
                        DATE_FORMAT(day, '%%Y-%%m-%%d') as day, 
                        SUM(clicks) as clicks 
                    FROM ad_clicks_by_domain_ip 
                    JOIN ads ON ads.id = ad_clicks_by_domain_ip.ad_id 
                    WHERE ads.is_main = %s AND day BETWEEN %s AND %s 
                    GROUP BY domain, ip, day 
                    ORDER BY day DESC, clicks DESC
                    LIMIT %s OFFSET %s
                    """, 
                    (1 if is_main else 0, start, end, page_size, offset)
                )
                rows = cur.fetchall()
                return {'data': rows, 'total': total}
        finally:
            conn.close()




def record_visitor_view_by_domain_ip(domain: str, ip: str, day: str = None):
    """记录按域名和IP的访客访问量"""
    day = day or datetime.now().date().isoformat()
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO visitor_views_by_domain_ip (day, domain, ip, visits) VALUES (%s, %s, %s, 1) ON DUPLICATE KEY UPDATE visits = visits + 1", 
                    (day, domain, ip)
                )
        finally:
            conn.close()


def get_visitors_by_domain_ip(start: str, end: str, page: int = 1, page_size: int = 10):
    """获取按域名和IP的访客统计数据"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                 # 1. 获取总览数据
                cur.execute(
                    """
                    SELECT
                        SUM(visits) as total_visits,
                        COUNT(DISTINCT domain) as distinct_domains,
                        COUNT(DISTINCT ip) as distinct_ips
                    FROM visitor_views_by_domain_ip
                    WHERE day BETWEEN %s AND %s
                    """,
                    (start, end)
                )
                summary = cur.fetchone()
                summary = {
                    'total_visits': summary.get('total_visits') or 0,
                    'distinct_domains': summary.get('distinct_domains') or 0,
                    'distinct_ips': summary.get('distinct_ips') or 0,
                }

                # 2. 获取总记录数
                cur.execute(
                    """
                    SELECT COUNT(*) as total FROM (
                        SELECT 1
                        FROM visitor_views_by_domain_ip 
                        WHERE day BETWEEN %s AND %s 
                        GROUP BY domain, ip, day
                    ) as grouped_data
                    """,
                    (start, end)
                )
                total = cur.fetchone()['total']

                # 3. 获取分页数据
                offset = (page - 1) * page_size
                cur.execute(
                    """
                    SELECT 
                        domain, 
                        ip, 
                        DATE_FORMAT(day, '%%Y-%%m-%%d') as day, 
                        SUM(visits) as visits 
                    FROM visitor_views_by_domain_ip 
                    WHERE day BETWEEN %s AND %s 
                    GROUP BY domain, ip, day 
                    ORDER BY day DESC, visits DESC
                    LIMIT %s OFFSET %s
                    """, 
                    (start, end, page_size, offset)
                )
                rows = cur.fetchall()
                return {'data': rows, 'total': total, 'summary': summary}
        finally:
            conn.close()


# 域名黑名单管理
def add_domain_to_blacklist(domain: str):
    """添加域名到黑名单"""
    now = datetime.now()
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT IGNORE INTO domain_blacklist (domain, created_at) VALUES (%s, %s)",
                    (domain, now)
                )
                return cur.rowcount > 0
        finally:
            conn.close()


def remove_domain_from_blacklist(domain_id: int):
    """从黑名单移除域名"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM domain_blacklist WHERE id=%s", (domain_id,))
        finally:
            conn.close()


def list_blacklist_domains():
    """获取黑名单域名列表"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM domain_blacklist ORDER BY created_at DESC")
                rows = cur.fetchall()
                return rows
        finally:
            conn.close()


def is_domain_blacklisted(domain: str):
    """检查域名是否在黑名单中"""
    with DB_LOCK:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) as cnt FROM domain_blacklist WHERE domain=%s", (domain,))
                row = cur.fetchone()
                return row['cnt'] > 0
        finally:
            conn.close()