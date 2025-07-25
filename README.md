# 台北市交通流量實時數據演示文稿

一個現代化的在線演示文稿，集成台北市交通流量實時數據大屏，使用純HTML/CSS/JavaScript技術實現。

## 🚀 功能特點

### 📊 數據可視化
- **即時車流量監測**：柱狀圖展示各路段車流量
- **路段速度分析**：折線圖顯示平均行車速度
- **交通事件統計**：圓餅圖展示事件分布
- **智能狀況評估**：自動分析交通狀況並提供建議

### 🎯 演示功能
- **5頁精美幻燈片**：涵蓋數據概覽到詳細分析
- **流暢切換動畫**：專業的幻燈片轉場效果
- **響應式設計**：支持桌面、平板、手機多端適配
- **鍵盤導航**：支持方向鍵、Home/End鍵操作

### 📱 用戶體驗
- **現代化UI設計**：漸變背景、毛玻璃效果
- **實時數據更新**：每5分鐘自動刷新數據
- **智能狀態指示**：直觀的交通狀況顏色編碼
- **載入動畫**：優雅的數據載入提示

## 📋 幻燈片內容

### 第1頁：數據概覽
- 監測站點總數
- 活躍站點數量
- 最後更新時間
- 系統狀態指示

### 第2頁：即時車流量
- 8個主要路段的車流量柱狀圖
- 顏色編碼表示交通狀況
- 數據來源和更新頻率說明

### 第3頁：速度分析
- 各路段平均速度折線圖
- 速度區間顏色圖例
- 交通狀況分級標準

### 第4頁：事件統計
- 道路施工、交通事故等事件卡片
- 事件分布圓餅圖
- 今日事件總覽

### 第5頁：總結建議
- 當前交通狀況評估
- 智能出行建議
- 交通趨勢預測

## 🛠️ 技術架構

### 前端技術
- **HTML5**：語義化標籤結構
- **CSS3**：現代化樣式和動畫
- **JavaScript ES6+**：模組化程式設計
- **Chart.js**：專業圖表庫
- **Axios**：HTTP請求處理

### 數據來源
- **台北市政府開放數據**：即時交通資訊API
- **模擬數據**：開發和演示用途
- **自動更新機制**：定時刷新保持數據新鮮度

## 🚀 快速開始

### 環境要求
- 現代瀏覽器（支持ES6+）
- HTTP服務器（不能直接打開HTML文件）
- （可選）台北市政府開放數據API金鑰

### 本地運行
1. 下載所有文件到本地目錄
2. **配置API金鑰（可選）**
   - 打開 `config.js` 文件
   - 在 `TAIPEI_API.API_KEY` 處填入您的API金鑰
   - 如未設置，系統將使用模擬數據

3. 使用任何HTTP服務器運行

**方法一：使用Python**
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**方法二：使用Node.js**
```bash
npx http-server -p 8080
```

**方法三：使用PHP**
```bash
php -S localhost:8080
```

4. 在瀏覽器中訪問 `http://localhost:8080`

### API註冊指南
如需使用真實數據，請參考 `API_INTEGRATION_GUIDE.md` 文件中的詳細註冊步驟。

## 🎮 操作指南

### 導航控制
- **滑鼠點擊**：使用頂部導航按鈕
- **鍵盤操作**：
  - `←/→` 方向鍵：上一頁/下一頁
  - `Home`：跳到第一頁
  - `End`：跳到最後一頁
- **進度指示器**：點擊底部圓點直接跳轉

### 數據交互
- **圖表懸停**：查看詳細數值
- **自動更新**：數據每5分鐘自動刷新
- **狀態指示**：實時顯示系統運行狀態

## 🔧 自定義配置

### 修改更新頻率
```javascript
// 在script.js中修改
setInterval(() => {
    // 更新邏輯
}, 300000); // 300000ms = 5分鐘
```

### 添加新的監測點
```javascript
// 在mockTrafficData中添加
stations: [
    { name: '新路段', flow: 1000, speed: 30, status: 'normal' },
    // ... 其他站點
]
```

### 自定義顏色主題
```css
/* 在styles.css中修改 */
:root {
    --primary-color: #4CAF50;
    --warning-color: #FF9800;
    --danger-color: #F44336;
}
```

## 🌐 實際API集成

### 台北市開放數據API
```javascript
// 即時交通資訊
const trafficAPI = 'https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_alldisplay.json';

// 路況資訊
const roadAPI = 'https://tcgbusfs.blob.core.windows.net/blobbus/GetEstimateTime.json';
```

### API集成步驟
1. 註冊台北市政府開放數據平台
2. 獲取API金鑰
3. 修改script.js中的fetchRealTrafficData函數
4. 處理API返回數據格式
5. 實現錯誤處理和降級機制

## 📱 響應式支持

### 桌面端 (>1024px)
- 完整功能展示
- 大尺寸圖表
- 多列佈局

### 平板端 (768px-1024px)
- 適配中等屏幕
- 調整圖表大小
- 優化觸控操作

### 手機端 (<768px)
- 單列佈局
- 簡化導航
- 觸控友好設計

## 🔒 安全考慮

- **CORS處理**：正確配置跨域請求
- **API金鑰保護**：避免在前端暴露敏感信息
- **數據驗證**：驗證API返回數據的完整性
- **錯誤處理**：優雅處理網絡錯誤和數據異常

## 🚀 部署建議

### 靜態網站託管
- **GitHub Pages**：免費託管靜態網站
- **Netlify**：自動部署和CDN加速
- **Vercel**：現代化部署平台

### 服務器部署
- **Nginx**：高性能Web服務器
- **Apache**：傳統Web服務器
- **CDN**：全球內容分發網絡

## 📈 性能優化

- **圖片優化**：使用WebP格式
- **代碼壓縮**：CSS/JS文件壓縮
- **緩存策略**：合理設置緩存頭
- **懶加載**：按需載入圖表數據

## 🤝 貢獻指南

1. Fork項目
2. 創建功能分支
3. 提交更改
4. 發起Pull Request

## 📄 許可證

MIT License - 詳見LICENSE文件

## 📞 聯繫方式

- **項目作者**：鲁班 (PromptX工具開發大師)
- **技術支持**：deepractice.ai
- **問題反饋**：GitHub Issues

---

**注意**：本項目為演示用途，實際部署時請確保遵守台北市政府開放數據使用條款。