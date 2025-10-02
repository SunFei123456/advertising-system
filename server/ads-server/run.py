#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
广告系统服务器启动脚本
"""

import uvicorn
import os
import sys

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # SSL证书文件路径
    ssl_keyfile = os.path.join(os.path.dirname(__file__), 'certs', 'privkey.key')
    ssl_certfile = os.path.join(os.path.dirname(__file__), 'certs', 'fullchain.pem')
    
    # 检查SSL证书文件是否存在
    if os.path.exists(ssl_keyfile) and os.path.exists(ssl_certfile):
   
        # 启动HTTPS FastAPI应用
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=29999,
            reload=True,
            log_level="info",
            ssl_keyfile=ssl_keyfile,
            ssl_certfile=ssl_certfile
        )
    else:
        # 启动HTTP FastAPI应用（回退模式）
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=29999,
            reload=True,
            log_level="info"
        )