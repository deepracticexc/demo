# 產險資訊全景與技術藍圖

## 項目介紹

這是一個互動式的產險資訊系統架構圖，展示了完整的技術堆疊和服務架構。

## 特色功能

- 🌌 **星空主題背景** - 優雅的深色主題設計
- 📱 **響應式設計** - 支持各種屏幕尺寸
- 🖼️ **PNG導出功能** - 可將架構圖導出為高解析度圖片
- ⚡ **互動效果** - 組件點擊動畫和載入效果
- 🏗️ **層次化架構** - 清晰的服務層級劃分

## 架構層級

### 🎯 應用層
- B2B 新企業平台
- B2C 官網
- 新核心系統
- 各類業務系統

### 🔧 基礎服務層
#### 共用服務
- CWP (地址正規化/監理查詢/公會報送)
- ToG (關貿服務、電子保單)
- MSG Service (68818簡訊, Mail郵件, Line服務)
- MOS (Multiple Object Service)
- SSO-Keycloak

#### 智能服務
- 人臉識別 (FRS)
- OCR 文字識別
- Voice Intelligent Service (TTS & STT)

#### 數據服務
- 統計報表
- OLAP
- 資料查詢

### 🚀 DevOps
- **AI Coding**: Cursor AI, IntelliJ IDEA +, Claude AI, Github Copilot
- **CICD**: Jenkins, ArgoCD

### 🔧 中間件 (Middleware)
- APIM, Scheduler, Logging, Monitor
- HA-Service, MinIO, Kafka, Kubernetes

### 💾 數據儲存 (Storage)
- Oracle, DB2 For AS400, SQL Server
- PostgreSQL, MongoDB

## 在線訪問

🌐 **GitHub Pages**: [https://deepracticexc.github.io/demo/](https://deepracticexc.github.io/demo/)

## 技術棧

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- JavaScript (ES6+)
- html2canvas (圖片導出)

## 使用說明

1. 在瀏覽器中打開 `index.html`
2. 點擊右上角的 "導出 PNG" 按鈕可下載架構圖
3. 點擊各個組件可查看互動效果

---

*🤖 Generated with [Claude Code](https://claude.ai/code)*