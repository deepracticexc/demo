/**
 * 台北市交通數據API服務類
 * 提供完整的API集成、錯誤處理和數據驗證功能
 */
class TaipeiTrafficAPI {
    constructor(config) {
        this.config = config;
        this.retryCount = 0;
        this.lastRequestTime = 0;
        this.requestQueue = [];
        this.isRateLimited = false;
        
        // 初始化監控
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            lastUpdate: null,
            averageResponseTime: 0
        };
        
        this.log('TaipeiTrafficAPI 初始化完成');
    }
    
    /**
     * 通用API請求方法
     * @param {string} url - API端點URL
     * @param {Object} options - 請求選項
     * @returns {Promise<Object>} API響應數據
     */
    async makeRequest(url, options = {}) {
        const startTime = Date.now();
        this.stats.totalRequests++;
        
        try {
            // 檢查請求頻率限制
            await this.checkRateLimit();
            
            this.log(`發送API請求: ${url}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, this.config.ERROR_HANDLING.TIMEOUT);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'TaipeiTrafficDemo/1.0',
                    'Cache-Control': 'no-cache',
                    ...options.headers
                },
                signal: controller.signal,
                ...options
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new APIError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    url
                );
            }
            
            const data = await response.json();
            
            // 更新統計信息
            const responseTime = Date.now() - startTime;
            this.updateStats(true, responseTime);
            
            this.retryCount = 0; // 重置重試計數
            this.log(`API請求成功，響應時間: ${responseTime}ms`);
            
            return data;
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateStats(false, responseTime);
            
            if (error.name === 'AbortError') {
                throw new APIError('請求逾時', 408, url);
            }
            
            this.log(`API請求失敗: ${error.message}`, 'error');
            
            // 重試邏輯
            if (this.shouldRetry(error) && this.retryCount < this.config.ERROR_HANDLING.MAX_RETRIES) {
                this.retryCount++;
                this.log(`重試第 ${this.retryCount} 次...`);
                
                await this.delay(this.config.ERROR_HANDLING.RETRY_DELAY * this.retryCount);
                return this.makeRequest(url, options);
            }
            
            // 降級到模擬數據
            if (this.config.ERROR_HANDLING.FALLBACK_TO_MOCK) {
                this.log('API請求失敗，使用模擬數據', 'warn');
                return this.getMockData(url);
            }
            
            throw error;
        }
    }
    
    /**
     * 獲取即時交通數據
     * @returns {Promise<Array>} 處理後的交通數據
     */
    async getTrafficData() {
        try {
            const url = this.config.TAIPEI_API.ENDPOINTS.TRAFFIC;
            const rawData = await this.makeRequest(url);
            
            if (!this.validateTrafficData(rawData)) {
                throw new Error('交通數據驗證失敗');
            }
            
            const processedData = this.processTrafficData(rawData);
            this.log(`成功獲取 ${processedData.length} 條交通數據`);
            
            return processedData;
            
        } catch (error) {
            this.log(`獲取交通數據失敗: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 獲取公車即時數據
     * @returns {Promise<Array>} 處理後的公車數據
     */
    async getBusData() {
        try {
            const url = this.config.TAIPEI_API.ENDPOINTS.BUS_REALTIME;
            const rawData = await this.makeRequest(url);
            
            const processedData = this.processBusData(rawData);
            this.log(`成功獲取 ${processedData.length} 條公車數據`);
            
            return processedData;
            
        } catch (error) {
            this.log(`獲取公車數據失敗: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 獲取停車場數據
     * @returns {Promise<Array>} 處理後的停車場數據
     */
    async getParkingData() {
        try {
            const url = this.config.TAIPEI_API.ENDPOINTS.PARKING;
            const rawData = await this.makeRequest(url);
            
            const processedData = this.processParkingData(rawData);
            this.log(`成功獲取 ${processedData.length} 條停車場數據`);
            
            return processedData;
            
        } catch (error) {
            this.log(`獲取停車場數據失敗: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 獲取綜合交通數據
     * @returns {Promise<Object>} 綜合交通數據
     */
    async getComprehensiveData() {
        try {
            this.log('開始獲取綜合交通數據...');
            
            const [trafficData, busData, parkingData] = await Promise.allSettled([
                this.getTrafficData(),
                this.getBusData(),
                this.getParkingData()
            ]);
            
            const result = {
                traffic: trafficData.status === 'fulfilled' ? trafficData.value : [],
                bus: busData.status === 'fulfilled' ? busData.value : [],
                parking: parkingData.status === 'fulfilled' ? parkingData.value : [],
                events: this.generateEventStatistics(trafficData.status === 'fulfilled' ? trafficData.value : []),
                lastUpdate: new Date(),
                dataQuality: this.assessDataQuality([
                    trafficData.status === 'fulfilled',
                    busData.status === 'fulfilled',
                    parkingData.status === 'fulfilled'
                ])
            };
            
            this.log('綜合交通數據獲取完成');
            return result;
            
        } catch (error) {
            this.log(`獲取綜合數據失敗: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 處理交通數據
     * @param {Array} rawData - 原始交通數據
     * @returns {Array} 處理後的數據
     */
    processTrafficData(rawData) {
        if (!Array.isArray(rawData)) {
            this.log('交通數據格式錯誤，不是數組格式', 'warn');
            return [];
        }
        
        return rawData
            .filter(item => this.isValidTrafficItem(item))
            .map(item => ({
                id: item.DeviceId || `traffic_${Date.now()}_${Math.random()}`,
                name: item.RouteName || item.RoadName || '未知路段',
                flow: this.normalizeNumber(item.CarLoad || item.Volume, 0),
                speed: this.normalizeNumber(item.Speed || item.AvgSpeed, 0),
                status: this.determineTrafficStatus(item.Speed || item.AvgSpeed || 0),
                location: {
                    lat: parseFloat(item.Latitude) || 0,
                    lng: parseFloat(item.Longitude) || 0
                },
                direction: item.Direction || 'unknown',
                lastUpdate: new Date(item.UpdateTime || item.DataTime || Date.now()),
                quality: this.assessItemQuality(item)
            }))
            .sort((a, b) => b.flow - a.flow); // 按流量排序
    }
    
    /**
     * 處理公車數據
     * @param {Array} rawData - 原始公車數據
     * @returns {Array} 處理後的數據
     */
    processBusData(rawData) {
        if (!Array.isArray(rawData)) {
            return [];
        }
        
        return rawData
            .filter(item => item && item.RouteName)
            .map(item => ({
                id: item.PlateNumb || `bus_${Date.now()}_${Math.random()}`,
                routeName: item.RouteName,
                direction: item.Direction || 0,
                speed: this.normalizeNumber(item.Speed, 0),
                delay: this.normalizeNumber(item.EstimateTime, 0),
                status: item.BusStatus || 'unknown',
                location: {
                    lat: parseFloat(item.BusLat) || 0,
                    lng: parseFloat(item.BusLon) || 0
                },
                lastUpdate: new Date(item.UpdateTime || Date.now())
            }));
    }
    
    /**
     * 處理停車場數據
     * @param {Array} rawData - 原始停車場數據
     * @returns {Array} 處理後的數據
     */
    processParkingData(rawData) {
        if (!Array.isArray(rawData)) {
            return [];
        }
        
        return rawData
            .filter(item => item && item.Name)
            .map(item => ({
                id: item.Id || `parking_${Date.now()}_${Math.random()}`,
                name: item.Name,
                totalSpaces: this.normalizeNumber(item.TotalSpace, 0),
                availableSpaces: this.normalizeNumber(item.AvailableSpace, 0),
                occupancyRate: this.calculateOccupancyRate(item.TotalSpace, item.AvailableSpace),
                type: item.Type || 'unknown',
                location: {
                    lat: parseFloat(item.Latitude) || 0,
                    lng: parseFloat(item.Longitude) || 0
                },
                lastUpdate: new Date(item.UpdateTime || Date.now())
            }));
    }
    
    /**
     * 生成事件統計
     * @param {Array} trafficData - 交通數據
     * @returns {Object} 事件統計
     */
    generateEventStatistics(trafficData) {
        const events = {
            construction: 0,
            accidents: 0,
            alerts: 0,
            busDelays: 0
        };
        
        // 檢查trafficData是否有效
        if (Array.isArray(trafficData) && trafficData.length > 0) {
            trafficData.forEach(item => {
                if (item && item.status === 'congested') {
                    events.alerts++;
                }
                if (item && item.speed < 10) {
                    events.accidents++; // 可能的事故
                }
            });
        }
        
        // 添加隨機事件（模擬）
        events.construction = Math.floor(Math.random() * 5);
        events.busDelays = Math.floor(Math.random() * 10);
        
        return events;
    }
    
    /**
     * 判斷交通狀況
     * @param {number} speed - 速度
     * @returns {string} 交通狀況
     */
    determineTrafficStatus(speed) {
        const normalizedSpeed = this.normalizeNumber(speed, 0);
        
        if (normalizedSpeed > 40) return 'normal';
        if (normalizedSpeed > 20) return 'slow';
        if (normalizedSpeed > 0) return 'congested';
        return 'unknown';
    }
    
    /**
     * 數據驗證
     * @param {Array} data - 待驗證數據
     * @returns {boolean} 驗證結果
     */
    validateTrafficData(data) {
        if (!Array.isArray(data)) {
            this.log('數據驗證失敗：不是數組格式', 'warn');
            return false;
        }
        
        if (data.length === 0) {
            this.log('數據驗證警告：數據為空', 'warn');
            return true; // 空數據也是有效的
        }
        
        // 檢查數據結構
        const sampleItem = data[0];
        const hasValidStructure = sampleItem && 
            (sampleItem.RouteName || sampleItem.RoadName) &&
            (sampleItem.CarLoad !== undefined || sampleItem.Volume !== undefined);
        
        if (!hasValidStructure) {
            this.log('數據驗證失敗：數據結構無效', 'warn');
            return false;
        }
        
        this.log(`數據驗證成功：${data.length} 條記錄`);
        return true;
    }
    
    /**
     * 檢查單個交通項目是否有效
     * @param {Object} item - 交通項目
     * @returns {boolean} 是否有效
     */
    isValidTrafficItem(item) {
        if (!item) return false;
        
        const speed = this.normalizeNumber(item.Speed || item.AvgSpeed, -1);
        const flow = this.normalizeNumber(item.CarLoad || item.Volume, -1);
        
        return speed >= this.config.VALIDATION.MIN_SPEED && 
               speed <= this.config.VALIDATION.MAX_SPEED &&
               flow >= this.config.VALIDATION.MIN_FLOW &&
               flow <= this.config.VALIDATION.MAX_FLOW;
    }
    
    /**
     * 正規化數字
     * @param {any} value - 待正規化的值
     * @param {number} defaultValue - 預設值
     * @returns {number} 正規化後的數字
     */
    normalizeNumber(value, defaultValue = 0) {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }
    
    /**
     * 計算停車場使用率
     * @param {number} total - 總車位
     * @param {number} available - 可用車位
     * @returns {number} 使用率（百分比）
     */
    calculateOccupancyRate(total, available) {
        const totalSpaces = this.normalizeNumber(total, 0);
        const availableSpaces = this.normalizeNumber(available, 0);
        
        if (totalSpaces <= 0) return 0;
        
        const occupiedSpaces = totalSpaces - availableSpaces;
        return Math.round((occupiedSpaces / totalSpaces) * 100);
    }
    
    /**
     * 評估數據品質
     * @param {Array} successFlags - 成功標誌數組
     * @returns {string} 數據品質等級
     */
    assessDataQuality(successFlags) {
        const successCount = successFlags.filter(flag => flag).length;
        const totalCount = successFlags.length;
        const successRate = successCount / totalCount;
        
        if (successRate >= 0.8) return 'excellent';
        if (successRate >= 0.6) return 'good';
        if (successRate >= 0.4) return 'fair';
        return 'poor';
    }
    
    /**
     * 評估單個項目品質
     * @param {Object} item - 數據項目
     * @returns {string} 品質等級
     */
    assessItemQuality(item) {
        let score = 0;
        
        if (item.RouteName || item.RoadName) score += 25;
        if (item.Speed !== undefined && item.Speed >= 0) score += 25;
        if (item.CarLoad !== undefined && item.CarLoad >= 0) score += 25;
        if (item.UpdateTime || item.DataTime) score += 25;
        
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
    }
    
    /**
     * 檢查是否應該重試
     * @param {Error} error - 錯誤對象
     * @returns {boolean} 是否應該重試
     */
    shouldRetry(error) {
        // 網路錯誤或暫時性錯誤才重試
        if (error instanceof APIError) {
            return error.status >= 500 || error.status === 408 || error.status === 429;
        }
        
        return error.name === 'TypeError' || error.name === 'NetworkError';
    }
    
    /**
     * 檢查請求頻率限制
     * @returns {Promise<void>}
     */
    async checkRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minInterval = 1000; // 最小間隔1秒
        
        if (timeSinceLastRequest < minInterval) {
            const waitTime = minInterval - timeSinceLastRequest;
            this.log(`請求頻率限制，等待 ${waitTime}ms`);
            await this.delay(waitTime);
        }
        
        this.lastRequestTime = Date.now();
    }
    
    /**
     * 更新統計信息
     * @param {boolean} success - 是否成功
     * @param {number} responseTime - 響應時間
     */
    updateStats(success, responseTime) {
        if (success) {
            this.stats.successfulRequests++;
        } else {
            this.stats.failedRequests++;
        }
        
        // 計算平均響應時間
        const totalRequests = this.stats.successfulRequests + this.stats.failedRequests;
        this.stats.averageResponseTime = 
            (this.stats.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
        
        this.stats.lastUpdate = new Date();
    }
    
    /**
     * 獲取API統計信息
     * @returns {Object} 統計信息
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.totalRequests > 0 ? 
                (this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(2) + '%' : '0%'
        };
    }
    
    /**
     * 延遲函數
     * @param {number} ms - 延遲毫秒數
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 獲取模擬數據（降級方案）
     * @param {string} url - 請求的URL
     * @returns {Array} 模擬數據
     */
    getMockData(url) {
        this.log('使用模擬數據', 'warn');
        
        if (url.includes('TCMSV_alldisplay')) {
            return mockTrafficData.stations || [];
        }
        
        return [];
    }
    
    /**
     * 日誌記錄
     * @param {string} message - 日誌消息
     * @param {string} level - 日誌級別
     */
    log(message, level = 'info') {
        if (!this.config.DEVELOPMENT.ENABLE_CONSOLE_LOG) return;
        
        const timestamp = new Date().toISOString();
        const prefix = `[TaipeiAPI ${timestamp}]`;
        
        switch (level) {
            case 'error':
                console.error(`${prefix} ❌ ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} ⚠️ ${message}`);
                break;
            case 'info':
            default:
                console.log(`${prefix} ℹ️ ${message}`);
                break;
        }
    }
}

/**
 * API錯誤類
 */
class APIError extends Error {
    constructor(message, status, endpoint) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.endpoint = endpoint;
        this.timestamp = new Date();
    }
    
    toString() {
        return `${this.name}: ${this.message} (Status: ${this.status}, Endpoint: ${this.endpoint})`;
    }
}

// 導出類（支持多種環境）
if (typeof window !== 'undefined') {
    // 瀏覽器環境 - 避免重複聲明
    if (!window.TaipeiTrafficAPI) {
        window.TaipeiTrafficAPI = TaipeiTrafficAPI;
    }
    if (!window.APIError) {
        window.APIError = APIError;
    }
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { TaipeiTrafficAPI, APIError };
}