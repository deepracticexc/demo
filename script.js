// 全局变量
let currentSlide = 1;
const totalSlides = 4;
let trafficChart = null;
let speedChart = null;
let eventsChart = null;
let dataUpdateInterval = null;
let isUsingRealData = false; // 是否使用真實數據

// 模拟的台北市交通数据（实际项目中应该从API获取）
const mockTrafficData = {
    stations: [
        { name: '信義路', flow: 1250, speed: 35, status: 'normal' },
        { name: '忠孝東路', flow: 1680, speed: 28, status: 'slow' },
        { name: '南京東路', flow: 980, speed: 42, status: 'normal' },
        { name: '民生東路', flow: 1420, speed: 18, status: 'congested' },
        { name: '松山路', flow: 890, speed: 38, status: 'normal' },
        { name: '基隆路', flow: 1560, speed: 22, status: 'slow' },
        { name: '羅斯福路', flow: 1340, speed: 31, status: 'slow' },
        { name: '中山北路', flow: 1180, speed: 45, status: 'normal' }
    ],
    events: {
        construction: 3,
        accidents: 2,
        alerts: 5,
        busDelays: 8
    },
    lastUpdate: new Date()
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('頁面載入完成，開始初始化...');
    initializePresentation();
    loadTrafficData();
    startDataUpdateInterval();
    setupKeyboardNavigation();
    
    // 確保頁面可以接收鍵盤事件
    document.body.tabIndex = -1;
    document.body.focus();
    console.log('鍵盤導航已設置完成');
});

// 初始化演示文稿
function initializePresentation() {
    updateSlideCounter();
    updateNavigationButtons();
    
    // 載入當前幻燈片的內容
    setTimeout(() => {
        loadSlideContent(currentSlide);
    }, 500);
    
    // 不在這裡隱藏loading指示器，讓loadTrafficData函數控制
}

// 幻灯片切换功能
function changeSlide(direction) {
    console.log('切換幻燈片，方向:', direction, '當前頁面:', currentSlide);
    
    const newSlide = currentSlide + direction;
    
    if (newSlide >= 1 && newSlide <= totalSlides) {
        // 添加退出動畫到當前幻燈片
        const currentSlideElement = document.querySelector('.slide.active');
        if (currentSlideElement) {
            currentSlideElement.classList.add('slide-out');
            
            // 延遲切換到新幻燈片，讓退出動畫完成
            setTimeout(() => {
                goToSlide(newSlide);
            }, 300);
        } else {
            goToSlide(newSlide);
        }
    } else {
        console.log('已到達邊界，無法切換');
        // 添加邊界反彈效果
        const currentSlideElement = document.querySelector('.slide.active');
        if (currentSlideElement) {
            currentSlideElement.style.transform = direction > 0 ? 'translateY(-20px) scale(1)' : 'translateY(20px) scale(1)';
            setTimeout(() => {
                currentSlideElement.style.transform = 'translateY(0) scale(1)';
            }, 200);
        }
    }
}

// 按鈕導航函數
function previousSlide() {
    changeSlide(-1);
}

function nextSlide() {
    changeSlide(1);
}



function goToSlide(slideNumber) {
    if (slideNumber < 1 || slideNumber > totalSlides) return;
    
    console.log('切換到幻燈片:', slideNumber);
    
    // 移除当前活动状态和动画类
    const currentSlideElement = document.querySelector('.slide.active');
    if (currentSlideElement) {
        currentSlideElement.classList.remove('active', 'slide-out');
    }
    
    // 安全地移除進度點的活動狀態
    const activeProgressDot = document.querySelector('.progress-dot.active');
    if (activeProgressDot) {
        activeProgressDot.classList.remove('active');
    }
    
    // 设置新的活动状态
    currentSlide = slideNumber;
    const targetSlide = document.getElementById(`slide${slideNumber}`);
    if (targetSlide) {
        targetSlide.classList.add('active');
    } else {
        console.error('找不到目標幻燈片:', `slide${slideNumber}`);
    }
    
    // 安全地設置進度點的活動狀態
    const progressDots = document.querySelectorAll('.progress-dot');
    if (progressDots[slideNumber - 1]) {
        progressDots[slideNumber - 1].classList.add('active');
    }
    
    updateSlideCounter();
    updateNavigationButtons();
    
    // 根据当前幻灯片加载相应的图表
    setTimeout(() => {
        loadSlideContent(slideNumber);
    }, 300);
}

function updateSlideCounter() {
    document.getElementById('slideCounter').textContent = `${currentSlide} / ${totalSlides}`;
}

function updateNavigationButtons() {
    document.getElementById('prevBtn').disabled = currentSlide === 1;
    document.getElementById('nextBtn').disabled = currentSlide === totalSlides;
}

// 键盘导航
function setupKeyboardNavigation() {
    console.log('設置鍵盤導航事件監聽器...');
    
    // 確保頁面可以接收鍵盤事件
    document.addEventListener('click', function() {
        document.body.focus();
    });
    
    // 鍵盤事件監聽
    document.addEventListener('keydown', function(event) {
        console.log('鍵盤事件觸發:', event.key, '當前頁面:', currentSlide, 'Target:', event.target.tagName);
        
        // 確保頁面有焦點且不是在輸入元素中
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            console.log('在輸入元素中，忽略鍵盤事件');
            return;
        }
        
        let handled = false;
        
        switch(event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                console.log('觸發上一頁');
                changeSlide(-1);
                handled = true;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // 空格鍵也可以切換到下一頁
                console.log('觸發下一頁');
                changeSlide(1);
                handled = true;
                break;
            case 'Home':
                console.log('跳到第一頁');
                goToSlide(1);
                handled = true;
                break;
            case 'End':
                console.log('跳到最後一頁');
                goToSlide(totalSlides);
                handled = true;
                break;
            case 'F11':
                console.log('切換全屏');
                toggleFullscreen();
                handled = true;
                break;
            case 'Escape':
                console.log('退出全屏');
                exitFullscreen();
                handled = true;
                break;
        }
        
        if (handled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true); // 使用捕獲階段
}

// 全屏功能
let isFullscreen = false;

function toggleFullscreen() {
    if (!isFullscreen) {
        enterFullscreen();
    } else {
        exitFullscreen();
    }
}

function enterFullscreen() {
    const body = document.body;
    
    // 添加全屏模式類
    body.classList.add('fullscreen-mode');
    
    // 嘗試使用瀏覽器全屏API
    if (body.requestFullscreen) {
        body.requestFullscreen().catch(() => {
            // 如果全屏API失敗，仍然應用CSS全屏樣式
            console.log('瀏覽器全屏API不可用，使用CSS全屏模式');
        });
    } else if (body.webkitRequestFullscreen) {
        body.webkitRequestFullscreen().catch(() => {
            console.log('Webkit全屏API不可用，使用CSS全屏模式');
        });
    } else if (body.msRequestFullscreen) {
        body.msRequestFullscreen().catch(() => {
            console.log('MS全屏API不可用，使用CSS全屏模式');
        });
    } else if (body.mozRequestFullScreen) {
        body.mozRequestFullScreen().catch(() => {
            console.log('Mozilla全屏API不可用，使用CSS全屏模式');
        });
    }
    
    isFullscreen = true;
    updateFullscreenButton();
}

function exitFullscreen() {
    const body = document.body;
    
    // 移除全屏模式類
    body.classList.remove('fullscreen-mode');
    
    // 退出瀏覽器全屏
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
            console.log('退出全屏失敗');
        });
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    
    isFullscreen = false;
    updateFullscreenButton();
}

function updateFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        const icon = fullscreenBtn.querySelector('.fullscreen-icon');
        
        if (isFullscreen) {
            fullscreenBtn.title = '退出全屏';
            if (icon) icon.textContent = '';
        } else {
            fullscreenBtn.title = '全屏演示';
            if (icon) icon.textContent = '⛶';
        }
    }
}

// 監聽瀏覽器全屏狀態變化
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    const isInFullscreen = !!(document.fullscreenElement || 
                             document.webkitFullscreenElement || 
                             document.mozFullScreenElement || 
                             document.msFullscreenElement);
    
    if (!isInFullscreen && isFullscreen) {
        // 用戶通過ESC或其他方式退出了瀏覽器全屏
        exitFullscreen();
    }
}

// 載入交通數據（簡化版 - 僅使用mock數據）
function loadTrafficData() {
    // 更新UI
    updateDashboardStats();
    updateTrafficStatus();
    updateLastUpdateTime();
    
    // 隱藏載入指示器
    hideLoadingIndicator();
}

// 隱藏載入指示器
function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// 數字動畫函數
function animateNumber(element, targetValue, duration = 2000, isInteger = true, useComma = false) {
    if (!element) return;
    
    const startValue = 0;
    const startTime = performance.now();
    
    // 添加動畫類
    element.classList.add('animating');
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用緩動函數讓動畫更自然
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
        
        if (isInteger) {
            const displayValue = Math.floor(currentValue);
            element.textContent = useComma ? displayValue.toLocaleString() : displayValue;
        } else {
            element.textContent = currentValue.toFixed(1);
        }
        
        // 在動畫過程中添加隨機的脈衝效果
        if (progress < 1 && Math.random() < 0.1) {
            element.style.transform = `scale(${1.02 + Math.random() * 0.03})`;
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 100);
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            // 確保最終值正確顯示
            element.textContent = useComma ? targetValue.toLocaleString() : targetValue;
            element.classList.remove('animating');
            
            // 完成動畫後的最終效果
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// 更新仪表板统计数据（帶動畫效果）
function updateDashboardStats() {
    const totalTraffic = mockTrafficData.stations.reduce((sum, station) => sum + station.flow, 0);
    const avgSpeed = Math.round(mockTrafficData.stations.reduce((sum, station) => sum + station.speed, 0) / mockTrafficData.stations.length);
    const monitorPoints = mockTrafficData.stations.length;
    
    const currentTrafficElement = document.getElementById('currentTraffic');
    const avgSpeedElement = document.getElementById('avgSpeed');
    const monitorPointsElement = document.getElementById('monitorPoints');
    
    // 使用動畫效果更新數字
    if (currentTrafficElement) {
        animateNumber(currentTrafficElement, totalTraffic, 2500, true, true);
    }
    if (avgSpeedElement) {
        animateNumber(avgSpeedElement, avgSpeed, 2000, true, false);
    }
    if (monitorPointsElement) {
        animateNumber(monitorPointsElement, monitorPoints, 1500, true, false);
    }
}

// 更新交通状况
function updateTrafficStatus() {
    const avgSpeed = mockTrafficData.stations.reduce((sum, station) => sum + station.speed, 0) / mockTrafficData.stations.length;
    const statusElement = document.getElementById('trafficStatus');
    const descriptionElement = document.getElementById('statusDescription');
    
    let status, description, className;
    
    if (avgSpeed > 35) {
        status = '良好';
        description = '大部分路段交通順暢，建議正常出行。';
        className = 'status-good';
    } else if (avgSpeed > 25) {
        status = '一般';
        description = '部分路段有輕微壅塞，建議避開尖峰時段。';
        className = 'status-warning';
    } else {
        status = '壅塞';
        description = '多個路段出現嚴重壅塞，建議改用大眾運輸。';
        className = 'status-danger';
    }
    
    // 只更新存在的元素
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.className = `status-indicator ${className}`;
    }
    if (descriptionElement) {
        descriptionElement.textContent = description;
    }
    
    // 更新建议（如果元素存在）
    const recommendationsElement = document.getElementById('recommendations');
    if (recommendationsElement) {
        updateRecommendations(avgSpeed);
    }
    
    // 更新趋势分析（如果元素存在）
    const trendElement = document.getElementById('trendAnalysis');
    if (trendElement) {
        updateTrendAnalysis();
    }
    
    // 更新时间戳（如果元素存在）
    const timestampElement = document.getElementById('dataTimestamp');
    if (timestampElement) {
        timestampElement.textContent = formatTime(new Date());
    }
}

// 更新出行建议
function updateRecommendations(avgSpeed) {
    const recommendationsElement = document.getElementById('recommendations');
    if (!recommendationsElement) return;
    
    let recommendations = [];
    
    if (avgSpeed > 35) {
        recommendations = [
            '交通狀況良好，可正常出行',
            '建議使用主要幹道',
            '停車位充足，可考慮開車'
        ];
    } else if (avgSpeed > 25) {
        recommendations = [
            '避開信義路、忠孝東路等壅塞路段',
            '建議提前15-20分鐘出門',
            '可考慮使用替代道路'
        ];
    } else {
        recommendations = [
            '強烈建議使用捷運系統',
            '避免開車進入市中心',
            '如需開車，建議延後1-2小時出行'
        ];
    }
    
    recommendationsElement.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
}

// 更新趋势分析
function updateTrendAnalysis() {
    const trendElement = document.getElementById('trendAnalysis');
    if (!trendElement) return;
    
    const hour = new Date().getHours();
    
    let trend;
    if (hour >= 7 && hour <= 9) {
        trend = '目前為上班尖峰時段，預計1小時後交通狀況將逐漸改善。';
    } else if (hour >= 17 && hour <= 19) {
        trend = '目前為下班尖峰時段，預計2小時後交通狀況將明顯改善。';
    } else {
        trend = '目前為離峰時段，交通狀況相對穩定。';
    }
    
    trendElement.textContent = trend;
}

// 根据幻灯片加载内容
function loadSlideContent(slideNumber) {
    console.log('載入幻燈片內容:', slideNumber);
    
    // 停止之前的數據動畫
    stopDataAnimation();
    
    switch(slideNumber) {
        case 1:
            // 第1頁：AI應用實戰經驗分享，確保頁面正常顯示
            console.log('載入第1頁內容');
            break;
        case 2:
            // 第2頁：啟動數據動畫
            setTimeout(() => {
                startDataAnimation();
            }, 500);
            break;
        case 3:
            // 第3頁：交通流量趨勢圖
            createTrafficChart();
            break;
        case 4:
            // 第4頁：總結頁面，無需圖表
            break;
    }
}

// 创建交通流量图表
function createTrafficChart() {
    console.log('開始創建交通流量圖表...');
    const ctx = document.getElementById('trafficChart');
    if (!ctx) {
        console.error('找不到trafficChart元素');
        return;
    }
    
    // 檢查Chart.js是否載入
    if (typeof Chart === 'undefined') {
        console.error('Chart.js未載入');
        return;
    }
    
    console.log('Chart.js已載入，開始創建圖表');
    
    // 销毁现有图表
    if (trafficChart) {
        trafficChart.destroy();
    }
    
    const labels = mockTrafficData.stations.map(station => station.name);
    const data = mockTrafficData.stations.map(station => station.flow);
    
    trafficChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '車流量 (輛/小時)',
                data: data,
                backgroundColor: [
                    '#4CAF50', '#FF9800', '#4CAF50', '#F44336',
                    '#4CAF50', '#FF9800', '#FF9800', '#4CAF50'
                ],
                borderColor: [
                    '#45a049', '#e68900', '#45a049', '#da190b',
                    '#45a049', '#e68900', '#e68900', '#45a049'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '各路段即時車流量統計'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '車流量 (輛/小時)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '路段名稱'
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    console.log('交通流量圖表創建成功');
}

// 创建速度图表
function createSpeedChart() {
    const ctx = document.getElementById('speedChart');
    if (!ctx) return;
    
    if (speedChart) {
        speedChart.destroy();
    }
    
    const labels = mockTrafficData.stations.map(station => station.name);
    const data = mockTrafficData.stations.map(station => station.speed);
    const colors = mockTrafficData.stations.map(station => {
        if (station.speed > 40) return '#4CAF50';
        if (station.speed > 20) return '#FF9800';
        return '#F44336';
    });
    
    speedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '平均速度 (km/h)',
                data: data,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                pointBackgroundColor: colors,
                pointBorderColor: colors,
                pointRadius: 8,
                pointHoverRadius: 12,
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '各路段平均行車速度'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 60,
                    title: {
                        display: true,
                        text: '速度 (km/h)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '路段名稱'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// 创建事件统计图表
function createEventsChart() {
    const ctx = document.getElementById('eventsChart');
    if (!ctx) return;
    
    if (eventsChart) {
        eventsChart.destroy();
    }
    
    const events = mockTrafficData.events;
    
    eventsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['道路施工', '交通事故', '交通警示', '公車延誤'],
            datasets: [{
                data: [events.construction, events.accidents, events.alerts, events.busDelays],
                backgroundColor: [
                    '#FF9800',
                    '#F44336', 
                    '#FFC107',
                    '#9C27B0'
                ],
                borderColor: [
                    '#e68900',
                    '#da190b',
                    '#ffb300',
                    '#7b1fa2'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: '今日交通事件分布'
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// 启动数据更新定时器
function startDataUpdateInterval() {
    // 根據配置設置更新間隔
    const interval = isUsingRealData && window.CONFIG ? 
        window.CONFIG.UPDATE_INTERVALS.TRAFFIC : 
        300000; // 模擬數據5分鐘更新一次
    
    dataUpdateInterval = setInterval(() => {
        console.log('🔄 定時更新交通數據...');
        
        // 如果使用模擬數據，先更新模擬數據
        if (!isUsingRealData) {
            simulateDataUpdate();
        }
        
        loadTrafficData();
        
        // 如果当前在显示图表的幻灯片，重新创建图表
        if (currentSlide === 4) createTrafficChart();
        if (currentSlide === 5) createHeatmap();
        
    }, interval);
    
    console.log(`⏰ 數據更新間隔設置為 ${interval/1000} 秒`);
}

// 數據動畫相關變量
let dataAnimationInterval = null;
let currentAnimatedData = {
    totalFlow: 10300,
    avgSpeed: 32,
    stations: 8
};

// 啟動數據動畫
function startDataAnimation() {
    console.log('🎬 啟動數據動畫效果...');
    
    // 清除之前的動畫
    if (dataAnimationInterval) {
        clearInterval(dataAnimationInterval);
    }
    
    // 每2秒更新一次數據
    dataAnimationInterval = setInterval(() => {
        updateAnimatedData();
        updateDataDisplay();
    }, 2000);
    
    // 立即執行一次
    updateAnimatedData();
    updateDataDisplay();
}

// 停止數據動畫
function stopDataAnimation() {
    if (dataAnimationInterval) {
        clearInterval(dataAnimationInterval);
        dataAnimationInterval = null;
        console.log('⏹️ 數據動畫已停止');
    }
}

// 更新動畫數據
function updateAnimatedData() {
    // 即時車流量變化 (±200)
    const flowChange = (Math.random() - 0.5) * 400;
    currentAnimatedData.totalFlow = Math.max(8000, Math.min(15000, 
        Math.floor(currentAnimatedData.totalFlow + flowChange)));
    
    // 平均速度變化 (±3 km/h)
    const speedChange = (Math.random() - 0.5) * 6;
    currentAnimatedData.avgSpeed = Math.max(15, Math.min(50, 
        Math.floor(currentAnimatedData.avgSpeed + speedChange)));
    
    // 監測站數量偶爾變化
    if (Math.random() < 0.3) {
        const stationChange = Math.random() < 0.5 ? -1 : 1;
        currentAnimatedData.stations = Math.max(6, Math.min(12, 
            currentAnimatedData.stations + stationChange));
    }
    
    console.log('📊 數據更新:', currentAnimatedData);
}

// 更新數據顯示
function updateDataDisplay() {
    // 使用數字動畫效果
    animateNumber('currentTraffic', currentAnimatedData.totalFlow, 1500);
    animateNumber('avgSpeed', currentAnimatedData.avgSpeed, 1200);
    animateNumber('monitorPoints', currentAnimatedData.stations, 800);
    
    // 更新狀態指示
    updateDataStatus();
}

// 數字動畫函數
function animateNumber(elementId, targetValue, duration = 1000) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const difference = targetValue - startValue;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用緩動函數
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (difference * easeProgress));
        
        // 格式化數字顯示
        if (elementId === 'currentTraffic') {
            element.textContent = currentValue.toLocaleString();
        } else {
            element.textContent = currentValue;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// 更新數據狀態指示
function updateDataStatus() {
    const statusElement = document.getElementById('lastUpdateTime');
    if (statusElement) {
        statusElement.textContent = '獲取數據中...';
        
        // 模擬數據載入完成
        setTimeout(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            statusElement.textContent = `最後更新：${timeString}`;
        }, 1000);
    }
}

// 模拟数据更新
function simulateDataUpdate() {
    mockTrafficData.stations.forEach(station => {
        // 随机变化车流量 ±10%
        const flowChange = (Math.random() - 0.5) * 0.2;
        station.flow = Math.max(100, Math.floor(station.flow * (1 + flowChange)));
        
        // 随机变化速度 ±5km/h
        const speedChange = (Math.random() - 0.5) * 10;
        station.speed = Math.max(5, Math.min(60, Math.floor(station.speed + speedChange)));
        
        // 根据速度更新状态
        if (station.speed > 40) station.status = 'normal';
        else if (station.speed > 20) station.status = 'slow';
        else station.status = 'congested';
    });
    
    // 随机更新事件数量
    mockTrafficData.events.construction = Math.floor(Math.random() * 5) + 1;
    mockTrafficData.events.accidents = Math.floor(Math.random() * 4);
    mockTrafficData.events.alerts = Math.floor(Math.random() * 8) + 2;
    mockTrafficData.events.busDelays = Math.floor(Math.random() * 12) + 3;
    
    mockTrafficData.lastUpdate = new Date();
}

// 創建熱力圖
function createHeatmap() {
    const heatmapGrid = document.getElementById('heatmapGrid');
    if (!heatmapGrid) return;
    
    // 清空現有內容
    heatmapGrid.innerHTML = '';
    
    // 台北市區域數據（模擬）
    const districts = [
        { name: '信義區', intensity: 0.8 },
        { name: '大安區', intensity: 0.9 },
        { name: '中山區', intensity: 0.7 },
        { name: '松山區', intensity: 0.6 },
        { name: '中正區', intensity: 0.8 },
        { name: '萬華區', intensity: 0.5 },
        { name: '大同區', intensity: 0.4 },
        { name: '士林區', intensity: 0.3 },
        { name: '北投區', intensity: 0.2 },
        { name: '內湖區', intensity: 0.6 },
        { name: '南港區', intensity: 0.4 },
        { name: '文山區', intensity: 0.3 }
    ];
    
    // 創建熱力圖網格
    districts.forEach(district => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.style.backgroundColor = getHeatmapColor(district.intensity);
        cell.innerHTML = `
            <div class="district-name">${district.name}</div>
            <div class="district-value">${Math.round(district.intensity * 100)}%</div>
        `;
        cell.title = `${district.name}: ${Math.round(district.intensity * 100)}% 交通密度`;
        heatmapGrid.appendChild(cell);
    });
    
    console.log('✅ 熱力圖已創建');
}

// 手動刷新數據
function manualRefreshData() {
    console.log('🔄 手動刷新數據...');
    loadTrafficData();
    
    // 根據當前幻燈片重新創建圖表
    if (currentSlide === 4) createTrafficChart();
    if (currentSlide === 5) createHeatmap();
    
    // 顯示刷新成功提示
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '✅ 已刷新';
        refreshBtn.disabled = true;
        
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }, 2000);
    }
}

// 更新最後更新時間
function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdateTime');
    if (lastUpdateElement) {
        const now = new Date();
        const timeString = now.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        lastUpdateElement.textContent = `最後更新：${timeString}`;
    }
}

// 獲取熱力圖顏色
function getHeatmapColor(intensity) {
    // 從綠色到紅色的漸變
    const red = Math.round(255 * intensity);
    const green = Math.round(255 * (1 - intensity));
    return `rgba(${red}, ${green}, 0, 0.7)`;
}

// 工具函数
function formatTime(date) {
    return date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function showErrorMessage(message) {
    console.warn(message);
    // 可以在这里添加用户友好的错误提示
}

// 清理资源
window.addEventListener('beforeunload', function() {
    if (dataUpdateInterval) {
        clearInterval(dataUpdateInterval);
    }
    
    if (trafficChart) trafficChart.destroy();
    if (speedChart) speedChart.destroy();
    if (eventsChart) eventsChart.destroy();
});

// 实际API集成示例（注释掉的代码）
/*
// 台北市政府开放数据API示例
async function fetchRealTrafficData() {
    try {
        // 即时交通资讯API
        const trafficResponse = await axios.get('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_alldisplay.json');
        
        // 路况资讯API  
        const roadResponse = await axios.get('https://tcgbusfs.blob.core.windows.net/blobbus/GetEstimateTime.json');
        
        // 处理API数据
        const processedData = processApiData(trafficResponse.data, roadResponse.data);
        
        return processedData;
    } catch (error) {
        console.error('获取实时数据失败:', error);
        return mockTrafficData; // 降级到模拟数据
    }
}

function processApiData(trafficData, roadData) {
    // 处理API返回的数据，转换为应用需要的格式
    // 这里需要根据实际API结构进行调整
    return {
        stations: trafficData.map(item => ({
            name: item.RouteName,
            flow: item.CarLoad || 0,
            speed: item.Speed || 0,
            status: determineStatus(item.Speed)
        })),
        events: extractEvents(roadData),
        lastUpdate: new Date()
    };
}

function determineStatus(speed) {
    if (speed > 40) return 'normal';
    if (speed > 20) return 'slow';
    return 'congested';
}

function extractEvents(roadData) {
    // 从路况数据中提取事件信息
    return {
        construction: roadData.filter(item => item.EventType === 'Construction').length,
        accidents: roadData.filter(item => item.EventType === 'Accident').length,
        alerts: roadData.filter(item => item.EventType === 'Alert').length,
        busDelays: roadData.filter(item => item.EventType === 'BusDelay').length
    };
}
*/