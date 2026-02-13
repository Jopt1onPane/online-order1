# Vercel 前端部署 + 前后端与数据库环境变量联动说明

## 一、整体联动关系（先搞清谁连谁）

```
┌─────────────────┐         REACT_APP_API_URL          ┌─────────────────┐         MONGODB_URI          ┌─────────────────┐
│   前端 (Vercel)   │  ─────────── 请求 API ────────────►  │  后端 (Render)   │  ─────────── 连接 ──────────►  │  MongoDB Atlas   │
│  用户看到的页面   │  ◄─────────── 返回数据 ────────────  │  Node.js API     │  ◄────────── 读写数据 ───────  │  数据库          │
└─────────────────┘                                      └─────────────────┘                                └─────────────────┘
                                    ▲
                                    │ FRONTEND_URL（后端用这个做 CORS，允许前端域名访问）
```

- **数据库**：只和后端连接，不需要在前端或 Vercel 填任何数据库信息。
- **前端**：只认「后端地址」，通过环境变量 `REACT_APP_API_URL` 指向 Render。
- **后端**：连数据库用 `MONGODB_URI`，允许哪个前端访问用 `FRONTEND_URL`（填 Vercel 的域名）。

---

## 二、在 Vercel 上部署前端

### 1. 准备代码

- 确保项目已推送到 **GitHub**。
- 前端代码在本项目中位于 **`frontend`** 或 **`online-order1/frontend`**（根据你仓库结构）。

### 2. 登录 Vercel 并导入项目

1. 打开：https://vercel.com ，用 **GitHub** 登录。
2. 点击 **「Add New…」** → **「Project」**。
3. 在列表里找到并选择你这个项目的 **仓库**，点 **「Import」**。

### 3. 配置构建设置（重要）

在导入时的配置页填：

| 配置项 | 值 |
|--------|-----|
| **Framework Preset** | Create React App（一般会自动识别） |
| **Root Directory** | 点 **「Edit」**，填前端的目录。若前端在 `frontend` 就填 **`frontend`**，在 `online-order1/frontend` 就填 **`online-order1/frontend`**。 |
| **Build Command** | `npm run build`（默认即可） |
| **Output Directory** | `build`（Create React App 默认输出目录） |
| **Install Command** | `npm install`（默认即可） |

然后先不要点 Deploy，先配环境变量。

### 4. 配置前端环境变量（让前端连到你的后端）

在同一个配置页找到 **「Environment Variables」**：

| Name | Value |
|------|--------|
| **REACT_APP_API_URL** | 你的 **Render 后端地址**，不要带末尾斜杠。例如：`https://online-order-backend.onrender.com` |

- 填好后确认环境选的是 **Production**（以及需要的话 Preview）。
- 然后点击 **「Deploy」**，等构建完成。

### 5. 拿到前端地址

- 部署成功后，Vercel 会给你一个地址，例如：  
  **`https://你的项目名.vercel.app`**
- **记下这个地址**，下一步要在 Render 后端里填。

---

## 三、后端环境变量（Render）— 让后端连数据库并允许前端访问

在 **Render** 你的 Web Service → **Environment** 里确保有：

| Key | Value | 说明 |
|-----|--------|------|
| **MONGODB_URI** | 你的 MongoDB 连接字符串 | 后端连数据库，你已有 |
| **JWT_SECRET** | 随机长字符串 | 登录 token 加密 |
| **NODE_ENV** | `production` | 生产环境 |
| **FRONTEND_URL** | **你的 Vercel 前端地址**，如 `https://你的项目名.vercel.app` | 用于 CORS，允许该前端域名访问后端 API |

- **FRONTEND_URL** 必须和前端实际访问的域名一致（不要带末尾 `/`）。
- 修改环境变量后，Render 会重新部署，等部署完成再测。

---

## 四、环境变量总表（谁在哪填）

| 部署在哪里 | 环境变量 | 填什么 | 作用 |
|------------|----------|--------|------|
| **Vercel（前端）** | `REACT_APP_API_URL` | Render 后端地址，如 `https://xxx.onrender.com` | 前端请求 API 的根地址 |
| **Render（后端）** | `MONGODB_URI` | MongoDB Atlas 连接字符串 | 后端连接数据库 |
| **Render（后端）** | `JWT_SECRET` | 随机字符串 | 登录 token 签名 |
| **Render（后端）** | `FRONTEND_URL` | Vercel 前端地址，如 `https://xxx.vercel.app` | CORS 允许的前端来源 |
| **Render（后端）** | `NODE_ENV` | `production` | 生产环境标识 |

**数据库**：不需要在 Vercel 或用户浏览器里配置任何东西，只有后端通过 `MONGODB_URI` 连接。

---

## 五、联动检查清单

按顺序做一遍即可：

1. **MongoDB Atlas**  
   - 网络访问已允许 `0.0.0.0/0`（或包含 Render IP）。  
   - 已有连接字符串（用于 `MONGODB_URI`）。

2. **Render 后端**  
   - `MONGODB_URI`、`JWT_SECRET`、`NODE_ENV` 已填。  
   - 先不填 `FRONTEND_URL` 也能跑，但前端上线后必须填 Vercel 的地址。  
   - 访问 `https://你的后端.onrender.com/api/health` 返回 `{"status":"ok",...}`。

3. **Vercel 前端**  
   - Root Directory 指到 `frontend`（或 `online-order1/frontend`）。  
   - 环境变量 `REACT_APP_API_URL` = 你的 Render 后端地址（无末尾斜杠）。  
   - 部署成功后可访问 `https://你的项目.vercel.app`。

4. **前后端打通**  
   - 在 Render 的 Environment 里把 **FRONTEND_URL** 设为 `https://你的项目.vercel.app`。  
   - 保存后等 Render 重新部署完成。  
   - 再在前端页面登录、点餐、下单，确认没有 CORS 报错。

---

## 六、常见问题

**Q：前端报跨域 (CORS) 错误？**  
- 检查 Render 的 **FRONTEND_URL** 是否等于你浏览器地址栏里的前端域名（协议 + 域名，无路径、无末尾斜杠）。

**Q：前端一直请求 localhost？**  
- 说明构建时没有读到 `REACT_APP_API_URL`。在 Vercel 的 Environment Variables 里确认变量名是 **REACT_APP_API_URL**，改完后重新 Deploy 一次（环境变量在 build 时注入）。

**Q：数据库要在前端或 Vercel 配吗？**  
- 不用。数据库只和后端连，只要在 **Render** 配好 **MONGODB_URI** 即可。

按上面步骤：Vercel 部署前端并设好 `REACT_APP_API_URL`，Render 设好 `MONGODB_URI` 和 `FRONTEND_URL`，前后端和数据库的联动就通过环境变量完成了。
