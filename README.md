# Personal AI

私人、單使用者的 AI 對話工作區，部署在 Cloudflare Workers 免費層。前端沿用原始專案的聊天介面（主題、文件、Artifacts、Prompt 庫、i18n），後端為單一密碼登入、OpenAI 相容供應商代理、工具呼叫代理（agent）與 D1 資料層。

## 功能

- 單一密碼登入（`APP_PASSWORD`）；可在介面中變更密碼（PBKDF2 雜湊存在 D1，取代 `APP_PASSWORD`）
- 多個 OpenAI 相容供應商（Base URL、API Key、模型），在「設定 → 供應商與模型」管理；**API Key 以 AES-GCM 加密存在 D1**，金鑰由 `AUTH_SECRET` 以 HKDF 衍生，永遠不會以明文回傳給瀏覽器（只顯示遮罩提示）
- 模型參數：temperature、top_p、max_tokens、reasoning_effort、最多代理步數；供應商拒絕某個參數時自動移除後重試一次
- Agent 工具呼叫循環：`web_search`、`fetch_url`、`calculate`、`current_time`、`document_search`、`remember` / `forget` / `recall`，專案中另有檔案工具與 `search_history`
- **專案 = 一個資料夾 + 一段永久對話**：側欄點專案名稱直接進入它唯一的對話（沒有子聊天）；右側面板（手機為上方分頁）有「對話／檔案／指示／設定」。訊息逐則存 D1、往上捲動分頁載入、以輪詢在裝置間同步；可「壓縮」（立即產生摘要）或「清空對話」（檔案與記憶保留）
- **專案檔案**：純文字資料夾樹（單檔 1 MB、每專案 2,000 項），介面可新增／重新命名／移動／刪除／編輯；模型可用 `list_files`、`read_file`（行號區間）、`write_file`、`edit_file`（唯一比對）、`append_file`、`move_file`、`delete_file`、`make_dir`、`search_files`（SQL 子字串搜尋，支援中文、在 SQL 中排序）；檔案異動以 `fs_op` 事件即時刷新
- **專案上下文**：專案指示＋檔案樹（只有路徑）＋專案記憶＋全域記憶＋滾動摘要（較舊訊息超過門檻時自動以 1 次額外模型呼叫重寫，計入預算）＋字數預算內的最近訊息
- **網頁**：`web_search` 後端依序為 Tavily → Jina → DuckDuckGo（免金鑰、盡力而為，可能被擋）；`fetch_url` 有 Jina 金鑰時走 r.jina.ai Reader，否則直接抓取並轉文字。「搜尋」開關代表「回答前先搜尋」，工具本身一律可用
- 長期記憶存在 D1（全域或專案範圍），可在「設定 → 記憶」檢視、編輯、刪除
- 一般對話、文件與介面偏好透過 D1 跨裝置同步（以伺服器序號為游標）
- 「清除所有資料」：刪除 D1 與本機資料（保留變更過的密碼）
- Pollinations 免費圖片生成，經 Worker 代理
- 無 Google Fonts、無追蹤腳本、`robots.txt` 全面禁止索引

## 平台限制與設計（Workers Free / D1 Free）

| 限制 | 對應設計 |
| --- | --- |
| 每個請求 CPU 10 ms（不含 I/O 等待） | 不在 Worker 中做大型 JSON 解析或索引；代理步驟呼叫模型時不逐 token 解析，結果以 SSE 事件送出；同步分頁 200 筆 |
| 每個請求 50 個外部子請求 | 每次聊天最多 40 個（每次模型呼叫 1 個、工具每次 fetch 與每次轉址各 1 個）；用完時工具回報錯誤，模型被要求直接作答 |
| D1 每次呼叫 50 個查詢（`batch` 算 1 個） | 所有資料存取經過計數的 `Db` 包裝；聊天開始時以一個 batch 讀入設定、供應商、金鑰與記憶；上限約 40 |
| D1 單列 2 MB、SQL 100 KB、100 個綁定參數、LIKE 樣式 ≤ 50 bytes | 專案檔案單檔 1 MB（以 UTF-8 bytes 計）、同步單項 900 KB、每次推送最多 40 項；搜尋一律用 `instr()` 而非 `LIKE` |
| D1 500 MB／資料庫 | 每專案最多 2,000 個檔案與資料夾、最多 100 個專案；只存文字 |
| 無 eval、無子行程 | 不提供程式執行；所有工具都是純 HTTP 或 D1 |

## 環境變數

只有兩個 Secret：

| 名稱 | 說明 |
| --- | --- |
| `APP_PASSWORD` | 初始登入密碼（在介面變更後由 D1 中的雜湊取代） |
| `AUTH_SECRET` | 至少 32 字元隨機字串；簽署工作階段，並衍生加密 D1 中金鑰的 AES 金鑰 |

> **注意：** 更換 `AUTH_SECRET` 後，D1 中已加密的 API Key 無法解密，介面會顯示「請重新輸入」，所有工作階段也會失效。
>
> 舊版的 `GROQ_API_KEY`、`GROQ_MODEL`、`TAVILY_API_KEY` 已移除，不再讀取。請在介面中新增供應商與 Tavily 金鑰。

## 部署（Wrangler CLI）

D1 是**必要**的。

```bash
npm install
npx wrangler login

# 1. 建立 D1，將輸出的 database_id 填入 wrangler.toml 的 [[d1_databases]]
npx wrangler d1 create personal-ai

# 2. 套用資料表（可省略：Worker 第一次收到請求時會自動建立/升級；所有遷移都可重複執行）
#    migrations/0002_data_layer.sql、0003_projects.sql
npx wrangler d1 migrations apply personal-ai --remote

# 3. 設定 Secrets
npx wrangler secret put APP_PASSWORD
npx wrangler secret put AUTH_SECRET     # openssl rand -base64 32

# 4. 建置前端並部署
npm run deploy
```

部署後開啟 `https://<worker>.workers.dev`，會導向 `/login`。登入後到「設定 → 供應商與模型」新增第一個供應商。

### Cloudflare Dashboard（Workers Builds）

1. Workers & Pages → Create → Workers → Connect to Git，選擇這個 repo
2. Build command：`npm ci && npm run build:web`；Deploy command：`npx wrangler deploy`
3. Storage & Databases → D1 → Create，名稱 `personal-ai`；把 Database ID 填入 `wrangler.toml` 後 commit
4. （可選）在 D1 Console 依序執行 `migrations/*.sql`；不執行時 Worker 會自動建立
5. Worker → Settings → Variables and Secrets：新增 `APP_PASSWORD`、`AUTH_SECRET`

若 D1 未綁定，登入後畫面頂端會顯示錯誤，`/api/me` 回報 `d1.ok: false`，聊天會回傳 503 `d1_required`。

### 從舊版升級

1. 依上方步驟綁定 D1（舊版的 `sync_items` 資料會自動複製到 `sync_items_v2`）
2. 刪除舊的 `GROQ_API_KEY`、`GROQ_MODEL`、`TAVILY_API_KEY` Secrets（可選，已不再讀取）
3. 第一次開啟新版時，瀏覽器中舊的供應商設定（含金鑰）、「記住我」的筆記、自訂指示與語氣會自動搬到 D1，然後從 localStorage 移除
4. 舊版「專案」（只存在瀏覽器）**不會**搬遷：原本屬於專案的對話會以一般對話留在主列表；新的專案改存 D1

### 自訂網域

先在 Cloudflare 綁定網域，再設定 `[vars] APP_ORIGIN = "https://你的網域"`。Cookie 使用 `__Host-session`，換網域不需要改程式。

### 本機開發

```bash
cp .dev.vars.example .dev.vars   # 填入 APP_PASSWORD、AUTH_SECRET
npm run dev                      # 使用本機 D1（自動建立資料表）
```

## 安全邊界

- 所有 `/api/*`（除 health/config/login）都需要工作階段；非 GET 請求檢查同源 `Origin`
- 登入失敗 5 次鎖定 5 分鐘（單一 isolate 記憶體）
- 金鑰：AES-GCM 加密存 D1，名稱綁定為 AAD；API 只回傳遮罩提示
- SSRF：供應商 URL 與 `fetch_url` 只允許 HTTPS，封鎖私有、迴路、鏈路本地、CGNAT、保留網段、IPv4 映射的 IPv6 與雲端 metadata 主機；`fetch_url` 最多 3 次轉址、220 KB、20 秒，只讀文字類型
- 模型清單、來源連結等外部字串一律以 `textContent` 或跳脫後顯示；Markdown 經過白名單淨化
- 不提供註冊、Email、OAuth、公開分享、匯出、程式執行；不使用 R2

## 測試

```bash
npm test         # node:test，D1 以 node:sqlite 模擬
npm run check    # 建置 + wrangler deploy --dry-run
```

## 授權

MIT。原始專案 attribution 見 `LICENSE` 與 `NOTICE`。
