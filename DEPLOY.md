# VPS 部署指南 (Oracle Linux 8)

## 前置需求

1. Oracle Cloud VPS (VM.Standard.E2.1.Micro)
2. 網域: regex.poepricer.com (已設定 Cloudflare DNS)
3. Node.js 22.x
4. PM2
5. Nginx

## 1. 伺服器環境設定

### 安裝 Node.js 22.x

```bash
# Oracle Linux 8 使用 dnf
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
node --version  # 確認版本
npm --version   # 確認 npm 版本
```

### 安裝 PM2

```bash
sudo npm install -g pm2
pm2 --version
```

### 安裝 Nginx

```bash
sudo dnf update -y
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 安裝 Git (如果還沒安裝)

```bash
sudo dnf install -y git
```

## 2. 上傳專案檔案

### 方法 1: 使用 Git

```bash
cd /opt  # 或你想要的目錄
sudo git clone <your-repo-url> poe-regex-tw
sudo chown -R $USER:$USER poe-regex-tw
cd poe-regex-tw
```

### 方法 2: 使用 SCP

```bash
# 在本地執行
scp -r /path/to/poe-regex-tw user@your-server-ip:/opt/
```

## 3. 安裝依賴並建置

```bash
cd /opt/poe-regex-tw

# 安裝後端依賴
cd server
npm install --production
cd ..

# 建置前端
cd client
npm install
npm run build
cd ..
```

## 4. 設定 PM2

```bash
# 建立 logs 目錄
mkdir -p logs

# 啟動應用
pm2 start ecosystem.config.js

# 設定開機自動啟動
pm2 startup
# 執行上面指令輸出的命令（通常是 sudo 開頭的）

# 儲存 PM2 配置
pm2 save

# 查看狀態
pm2 status
pm2 logs poe-regex-api
```

## 5. 設定 Nginx

### Oracle Linux 8 的 Nginx 配置方式

Oracle Linux 8 的 Nginx 配置結構與 Ubuntu 不同，有兩種方式：

#### 方法 1: 使用 conf.d (推薦)

```bash
# 複製配置檔到 conf.d
sudo cp nginx.conf.example /etc/nginx/conf.d/regex.poepricer.com.conf
```

#### 方法 2: 使用 sites-available/sites-enabled (需要建立目錄)

```bash
# 建立目錄（如果不存在）
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# 複製配置檔
sudo cp nginx.conf.example /etc/nginx/sites-available/regex.poepricer.com.conf

# 建立 symbolic link
sudo ln -s /etc/nginx/sites-available/regex.poepricer.com.conf /etc/nginx/sites-enabled/

# 在 /etc/nginx/nginx.conf 的 http 區塊中加入：
# include /etc/nginx/sites-enabled/*.conf;
```

### 編輯配置檔

```bash
# 如果使用方法 1
sudo nano /etc/nginx/conf.d/regex.poepricer.com.conf

# 如果使用方法 2
sudo nano /etc/nginx/sites-available/regex.poepricer.com.conf
```

**重要**: 修改 `root` 路徑為你的實際路徑：
```nginx
root /opt/poe-regex-tw/client/build;  # 改成你的實際路徑
```

### 測試並重新載入

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Cloudflare SSL 設定

### 選項 A: Flexible SSL (簡單，推薦)

1. 登入 Cloudflare Dashboard
2. 選擇你的網域
3. SSL/TLS → Overview
4. 選擇 **Flexible** 模式
5. 這樣 Cloudflare 會處理 SSL，Nginx 只需要監聽 HTTP 80 port

### 選項 B: Full/Full Strict SSL (更安全)

1. 安裝 Certbot:
```bash
sudo dnf install -y certbot python3-certbot-nginx
```

2. 取得 Let's Encrypt 證書:
```bash
sudo certbot --nginx -d regex.poepricer.com
```

3. 編輯 Nginx 配置，使用 HTTPS 區塊（參考 nginx.conf.example 中的註解區塊）

4. Cloudflare SSL 模式改為 **Full** 或 **Full (strict)**

## 7. 防火牆設定

Oracle Linux 8 預設使用 `firewalld`，不是 `ufw`：

```bash
# 檢查 firewalld 狀態
sudo systemctl status firewalld

# 如果沒有啟用，啟用 firewalld
sudo systemctl enable firewalld
sudo systemctl start firewalld

# 允許 HTTP 和 HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 如果使用 Full SSL，也需要開放 443
# 如果使用 Flexible SSL，只需要開放 80

# 重新載入防火牆規則
sudo firewall-cmd --reload

# 查看防火牆規則
sudo firewall-cmd --list-all
```

**注意**: 如果 Oracle Cloud 有使用 Security List，也需要在 Oracle Cloud Console 中開放對應的 port。

## 8. 驗證部署

1. 檢查 PM2 狀態: `pm2 status`
2. 檢查 Nginx 狀態: `sudo systemctl status nginx`
3. 檢查後端 API: `curl http://localhost:9000/maps?type=1`
4. 瀏覽器訪問: https://regex.poepricer.com

## 9. 常用指令

### PM2

```bash
pm2 status              # 查看狀態
pm2 logs poe-regex-api  # 查看日誌
pm2 restart poe-regex-api  # 重啟
pm2 stop poe-regex-api    # 停止
pm2 delete poe-regex-api  # 刪除
```

### Nginx

```bash
sudo nginx -t                    # 測試配置
sudo systemctl reload nginx     # 重新載入配置
sudo systemctl restart nginx    # 重啟 Nginx
sudo systemctl status nginx     # 查看狀態
```

### 更新部署

```bash
cd /opt/poe-regex-tw

# 拉取最新程式碼（如果用 Git）
git pull

# 更新後端依賴（如果需要）
cd server
npm install --production
cd ..

# 重新建置前端
cd client
npm run build
cd ..

# 重啟 PM2
pm2 restart poe-regex-api
```

## 10. 監控與維護

### 查看系統資源

```bash
# CPU 和記憶體使用（如果沒有 htop，先安裝）
sudo dnf install -y htop
htop

# 或使用內建的 top
top

# PM2 監控
pm2 monit

# Nginx 存取日誌
sudo tail -f /var/log/nginx/access.log

# Nginx 錯誤日誌
sudo tail -f /var/log/nginx/error.log
```

### 記憶體優化

由於 VPS 只有 1GB RAM，建議：
- PM2 使用單一實例（已在 ecosystem.config.js 設定）
- 如果記憶體不足，可以調整 `max_memory_restart` 為更小的值（例如 '400M'）
