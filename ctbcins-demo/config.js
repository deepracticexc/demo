// 台北市交通數據API配置文件
const CONFIG = {
    // API配置
    TAIPEI_API: {
        BASE_URL: 'https://data.taipei/',
        API_KEY: '', // 請在此處填入您的API金鑰
        ENDPOINTS: {
            // 即時交通資訊
            TRAFFIC: 'https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_alldisplay.json',
            // 公車即時動態
            BUS_REALTIME: 'https://tcgbusfs.blob.core.windows.net/blobbusapi/GetBusData.json',
            // 停車場資訊
            PARKING: 'https://tcgbusfs.blob.core.windows.net/blobparking/GetParkingData.json',
            // 路況資訊（備用）
            ROAD_CONDITIONS: 'https://tcgbusfs.blob.core.windows.net/blobbus/GetEstimateTime.json'
        }
    },
    
    // 更新頻率配置（毫秒）
    UPDATE_INTERVALS: {
        TRAFFIC: 300000,    // 5分鐘
        ROAD: 60000,        // 1分鐘
        BUS: 30000,         // 30秒
        PARKING: 600000     // 10分鐘
    },
    
    // 錯誤處理配置
    ERROR_HANDLING: {
        MAX_RETRIES: 3,
        RETRY_DELAY: 5000,
        FALLBACK_TO_MOCK: true,
        TIMEOUT: 10000
    },
    
    // 數據驗證配置
    VALIDATION: {
        MIN_SPEED: 0,
        MAX_SPEED: 120,
        MIN_FLOW: 0,
        MAX_FLOW: 10000
    },
    
    // UI配置
    UI: {
        LOADING_MESSAGES: [
            '正在獲取最新交通數據...',
            '連接台北市交通監控中心...',
            '處理即時路況資訊...',
            '更新交通流量數據...'
        ],
        ERROR_MESSAGES: {
            NETWORK: '網路連線異常，請檢查網路設定',
            API_LIMIT: 'API請求次數已達上限，請稍後再試',
            DATA_FORMAT: '數據格式異常，使用備用數據',
            TIMEOUT: '請求逾時，正在重試...',
            GENERAL: '數據載入失敗，使用模擬數據'
        }
    },
    
    // 開發模式配置
    DEVELOPMENT: {
        ENABLE_CONSOLE_LOG: true,
        MOCK_API_DELAY: 1000,
        SHOW_DEBUG_INFO: true
    }
};

// 環境檢測
if (typeof window !== 'undefined') {
    // 瀏覽器環境 - 避免重複聲明
    if (!window.CONFIG) {
        window.CONFIG = CONFIG;
    }
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = CONFIG;
}