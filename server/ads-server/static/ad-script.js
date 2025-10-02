/**
 * 广告展示脚本
 * 用于在网页中展示主广告和次要广告，并统计访问量和点击量
 */



(function() {
    'use strict';
    
    // 配置
    const CONFIG = {
        API_BASE: 'http://8.152.194.158:29999', // 后台API地址
        MAIN_AD_CONTAINER_ID: 'main-ad-container',
        SECONDARY_AD_CONTAINER_ID: 'secondary-ad-container'
    };
    
    // 广告数据
    let adData = null;
    
    // 初始化
    function init() {
        // 检查是否为本地文件协议，如果是则不展示广告
        if (window.location.protocol === 'file:') {
            console.log('本地文件访问，不展示广告');
            return;
        }
        
        createAdContainers();
        recordPageView();
        loadAds();
    }
    
    // 创建广告容器
    function createAdContainers() {
        // 主广告容器 - 页面中心
        const mainContainer = document.createElement('div');
        mainContainer.id = CONFIG.MAIN_AD_CONTAINER_ID;
        mainContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            padding: 10px;
            display: none;
        `;
        document.body.appendChild(mainContainer);
        
        // 次要广告容器 - 右下角
        const secondaryContainer = document.createElement('div');
        secondaryContainer.id = CONFIG.SECONDARY_AD_CONTAINER_ID;
        secondaryContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            padding: 8px;
            display: none;
            max-width: 300px;
        `;
        document.body.appendChild(secondaryContainer);
    }
    
    // 记录页面访问量
    function recordPageView() {
        fetch(`${CONFIG.API_BASE}/events/page_view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(err => console.warn('记录页面访问失败:', err));
    }
    
    // 加载广告
    function loadAds() {
        fetch(`${CONFIG.API_BASE}/ads/random_pair`)
            .then(response => response.json())
            .then(data => {
                if (data.code === 200 && data.data) {
                    adData = data.data;
                    displayAds();
                }
            })
            .catch(err => console.warn('加载广告失败:', err));
    }
    
    // 显示广告
    function displayAds() {
        if (adData.main) {
            displayMainAd(adData.main);
        }
        if (adData.secondary) {
            displaySecondaryAd(adData.secondary);
        }
    }
    
    // 显示主广告
    function displayMainAd(ad) {
        const container = document.getElementById(CONFIG.MAIN_AD_CONTAINER_ID);
        if (!container) return;
        
        container.innerHTML = `
            <div style="position: relative;">
                <button onclick="closeMainAd(${ad.id}, ${ad.x_redirect_enabled})" 
                        style="position: absolute; top: -5px; right: -5px; 
                               background: #ff4444; color: white; border: none; 
                               border-radius: 50%; width: 25px; height: 25px; 
                               cursor: pointer; font-size: 16px; line-height: 1;
                               display: flex; align-items: center; justify-content: center;">
                    ×
                </button>
                <img src="${CONFIG.API_BASE}${ad.img_url}" 
                     alt="广告" 
                     style="max-width: 500px; max-height: 400px; display: block; cursor: pointer;"
                     onclick="clickAd(${ad.id}, '${ad.link}')">
            </div>
        `;
        
        container.style.display = 'block';
    }
    
    // 显示次要广告
    function displaySecondaryAd(ad) {
        const container = document.getElementById(CONFIG.SECONDARY_AD_CONTAINER_ID);
        if (!container) return;
        
        container.innerHTML = `
            <div style="position: relative;">
                <button onclick="closeSecondaryAd(${ad.id}, ${ad.x_redirect_enabled})" 
                        style="position: absolute; top: -5px; right: -5px; 
                               background: #ff4444; color: white; border: none; 
                               border-radius: 50%; width: 20px; height: 20px; 
                               cursor: pointer; font-size: 14px; line-height: 1;
                               display: flex; align-items: center; justify-content: center;">
                    ×
                </button>
                <img src="${CONFIG.API_BASE}${ad.img_url}" 
                     alt="广告" 
                     style="max-width: 250px; max-height: 200px; display: block; cursor: pointer;"
                     onclick="clickAd(${ad.id}, '${ad.link}')">
            </div>
        `;
        
        container.style.display = 'block';
    }
    
    // 点击广告
    window.clickAd = function(adId, link) {
        // 记录点击
        fetch(`${CONFIG.API_BASE}/events/click`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                ad_id: adId,
                domain: window.location.hostname
            })
        }).then(() => {
            // 跳转到广告链接
            window.open(link, '_blank');
        }).catch(err => {
            console.warn('记录点击失败:', err);
            // 即使记录失败也要跳转
            window.open(link, '_blank');
        });
    };
    
    // 关闭主广告
    window.closeMainAd = function(adId, xRedirectEnabled) {
        const container = document.getElementById(CONFIG.MAIN_AD_CONTAINER_ID);
        if (container) {
            container.style.display = 'none';
        }
        
        // 如果启用了X号重定向，则跳转到广告链接
        if (xRedirectEnabled && adData && adData.main) {
            window.clickAd(adId, adData.main.link);
        }
    };
    
    // 关闭次要广告
    window.closeSecondaryAd = function(adId, xRedirectEnabled) {
        const container = document.getElementById(CONFIG.SECONDARY_AD_CONTAINER_ID);
        if (container) {
            container.style.display = 'none';
        }
        
        // 如果启用了X号重定向，则跳转到广告链接
        if (xRedirectEnabled && adData && adData.secondary) {
            window.clickAd(adId, adData.secondary.link);
        }
    };
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();