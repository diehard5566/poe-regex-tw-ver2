# POE Regex TW

Path of Exile 正則表達式工具 - 整合版 Monorepo

## 專案結構

```
poe-regex-tw/
├── server/       # 後端 API (Node.js/Express)
├── client/       # 前端應用 (React)
└── README.md     # 本檔案
```

## 開發環境設定

### 後端 API

1. 進入 `server` 目錄：
   ```bash
   cd server
   ```

2. 安裝依賴：
   ```bash
   npm install
   ```

3. 啟動開發伺服器：
   ```bash
   npm start
   ```

   後端會在 `http://localhost:9000` 運行

### 前端 Client

1. 進入 `client` 目錄：
   ```bash
   cd client
   ```

2. 安裝依賴：
   ```bash
   npm install
   ```

3. 啟動開發伺服器：
   ```bash
   npm start
   ```

   前端會在 `http://localhost:3000` 運行

## 檢查連線

確保前後端都在運行後，在瀏覽器開啟 `http://localhost:3000/` 即可使用。

## 部署

本專案使用 Vercel 進行部署，詳細部署設定請參考 Vercel 專案配置。
