# 在 Render 上部署后端完整教程

你已有 MongoDB 信息，按下面步骤即可把本项目的后端部署到 Render。

---

## 一、部署前准备

### 1. 代码要能被打包部署

- 把项目推送到 **GitHub**（如果还没推送，先在项目根目录执行 `git init`，在 GitHub 新建仓库后 `git remote add origin <你的仓库地址>`，再 `git add .`、`git commit`、`git push`）。
- 确认后端在仓库里的路径。本项目中后端在 **`backend`** 或 **`online-order1/backend`**（根据你仓库实际结构），下面步骤里会用到「根目录」和「子目录」说明。

### 2. 准备这些信息（你已有 MongoDB，其余可先按示例填）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| **MONGODB_URI** | MongoDB 连接字符串（你已有） | `mongodb+srv://用户名:密码@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority` |
| **JWT_SECRET** | 登录 token 加密用，任意长随机字符串 | 见下文「生成 JWT_SECRET」 |
| **FRONTEND_URL** | 前端网站地址（先可留空，前端部署后再填） | `https://你的前端.vercel.app` |

**生成 JWT_SECRET**（在本地终端执行一次即可）：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

把输出的那一串字符复制下来，后面在 Render 里填到 `JWT_SECRET`。

---

## 二、在 Render 创建 Web Service（后端）

### 1. 注册 / 登录 Render

- 打开：https://render.com  
- 用 **GitHub 账号** 登录（推荐，方便选仓库）。

### 2. 新建 Web Service

1. 登录后点击 **「New +」** → **「Web Service」**。  
2. 在 **「Connect a repository」** 里选择你这个项目的 **GitHub 仓库**（没有的话先点 “Configure account” 授权 Render 访问 GitHub）。  
3. 选好仓库后点 **「Connect」**。

### 3. 配置构建设置

按下面填（注意「根目录」要指向后端代码）：

| 配置项 | 值 |
|--------|-----|
| **Name** | 随便起名，如 `online-order-backend`（会变成 `https://online-order-backend.onrender.com`） |
| **Region** | 选离你或用户近的，如 Singapore |
| **Branch** | 一般是 `main` 或 `master` |
| **Root Directory** | **重要**：若后端在仓库的 `backend` 文件夹，填 **`backend`**；若在 `online-order1/backend`，填 **`online-order1/backend`**。留空表示仓库根目录就是后端。 |
| **Runtime** | **Node** |
| **Build Command** | `npm install`（或留空，Render 默认会执行 `npm install`） |
| **Start Command** | `npm start` 或 `node server.js`（本项目 `package.json` 里已有 `"start": "node server.js"`，用 `npm start` 即可） |

### 4. 选择免费方案

- **Instance Type** 选 **Free**（免费版冷启动稍慢，适合先跑通）。

### 5. 添加环境变量（重点）

在 **「Environment」** / **「Environment Variables」** 里点 **「Add Environment Variable」**，逐个添加：

1. **Key**: `MONGODB_URI`  
   **Value**: 你的 MongoDB 连接字符串（你已有的那个）。  
   - 注意：密码里若有 `@`、`#` 等特殊字符，需要做 URL 编码，或到 MongoDB Atlas 里把密码改成不含特殊字符。

2. **Key**: `JWT_SECRET`  
   **Value**: 上面用 `node -e "..."` 生成的那一串。

3. **Key**: `NODE_ENV`  
   **Value**: `production`

4. **Key**: `FRONTEND_URL`（可选，建议后面部署前端再填）  
   **Value**: 前端最终访问地址，例如 `https://你的项目.vercel.app`  
   - 不填的话后端会用默认的 `http://localhost:3001`，部署后前端跨域可能被拦，所以上线后建议填上。

**不要**在 Render 里设置 `PORT`，Render 会自动注入 `PORT`，你的代码里已经有 `const PORT = process.env.PORT || 3000`，这样即可。

### 6. 创建并等待部署

- 点击 **「Create Web Service」**。  
- Render 会拉代码、执行 `npm install`、然后 `npm start`。  
- 等日志里出现类似 “MongoDB 连接成功”“服务器运行在端口 xxxx”，就说明部署成功。

### 7. 拿到后端地址

- 在服务页面顶部会有一个地址，形如：  
  **`https://online-order-backend.onrender.com`**  
- 记下这个地址，后面前端要用（例如前端的 `REACT_APP_API_URL` 或 `VITE_API_URL` 就填这个）。

---

## 三、验证后端是否正常

1. **健康检查**  
   浏览器打开：  
   `https://你的服务名.onrender.com/api/health`  
   应返回 JSON：`{ "status": "ok", "message": "Server is running" }`。

2. **MongoDB 是否连通**  
   若健康检查正常且部署日志里有 “MongoDB 连接成功”，说明数据库也连上了。

3. **前端未部署时**  
   可以先不填 `FRONTEND_URL`，等前端部署到 Vercel 等之后，再在 Render 的 Environment 里加上 `FRONTEND_URL`，保存后 Render 会自动重新部署一次。

---

## 四、常见问题

### 1. 部署失败：找不到 `server.js`

- 多半是 **Root Directory** 没指到后端目录。  
- 确认仓库里 `server.js` 和 `package.json` 所在目录，把 **Root Directory** 改成那个目录（例如 `backend` 或 `online-order1/backend`）。

### 2. 日志里报 MongoDB 连接失败

- 检查 **MONGODB_URI** 是否完整、用户名密码是否正确。  
- 在 MongoDB Atlas → Network Access 里确认已 **Allow Access from Anywhere**（`0.0.0.0/0`），否则 Render 的 IP 可能被拒绝。

### 3. 前端请求后端报跨域 (CORS) 错误

- 在 Render 的 Environment 里添加 **FRONTEND_URL**，值为前端真实访问地址（如 `https://xxx.vercel.app`），不要带末尾斜杠。  
- 本后端已用 `process.env.FRONTEND_URL` 做 CORS，配置好并重新部署后即可。

### 4. 免费实例「冷启动」

- Render 免费版一段时间没人访问会休眠，第一次打开会慢几秒到几十秒，属正常现象。

---

## 五、环境变量小结（复制用）

在 Render 的 Environment 里建议至少要有：

```env
MONGODB_URI=你的MongoDB连接字符串
JWT_SECRET=用 node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 生成的一串
NODE_ENV=production
FRONTEND_URL=https://你的前端域名（前端部署后再填）
```

按上面步骤做完，后端就部署在 Render 上了；你已有 MongoDB，主要就是把 **MONGODB_URI** 和 **JWT_SECRET** 配好，并选对 **Root Directory** 和 **Start Command**。
