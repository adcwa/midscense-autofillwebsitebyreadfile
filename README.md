# 表格填写服务演示 (TableDemo) + Midscene Agent 

这是一个演示项目，包含两个部分：
1. 表格填写服务 (TableDemo) - 一个简单的 Web 应用，用于管理用户信息，数据存储在浏览器的 localStorage 中
2. Puppeteer + Midscene Agent - 从 CSV 文件读取用户数据，使用 AI 代理自动填写到表格中

## 环境要求

- Node.js v16+
- npm, yarn 或 pnpm 包管理器

## 安装依赖

```bash
# 使用 npm
npm install

# 或者使用 yarn
yarn

# 或者使用 pnpm
pnpm install
```

### 添加额外的依赖

这个项目除了基本的 midscene 和 puppeteer 依赖外，还需要以下依赖：

```bash
npm install express csv-parser dotenv
# 或
yarn add express csv-parser dotenv
# 或
pnpm add express csv-parser dotenv
```

## 运行演示

```bash
# 使用 npm
npx tsx puppeteer-fill-table.ts

# 或者使用 yarn
yarn tsx puppeteer-fill-table.ts

# 或者使用 pnpm
pnpm tsx puppeteer-fill-table.ts
```

## 功能说明

1. 首先，程序会创建一个样例 CSV 文件 `users.csv`，包含示例用户数据
2. 然后启动表格填写服务，在 http://localhost:3000
3. 最后，启动 Puppeteer + Midscene Agent，自动打开浏览器，从 CSV 文件读取数据并填写到表格中

## 代码描述

- `puppeteer-fill-table.ts` - 包含整个应用的代码，包括表格服务和自动填写代理
- 表格服务使用 Express 创建，前端页面使用纯 HTML/CSS/JavaScript
- 自动填写部分使用 Puppeteer 和 Midscene Web Agent 实现

https://midscenejs.com/zh/integrate-with-puppeteer.html


npm install @midscene/web puppeteer tsx --save-dev


npx tsx puppeteer-example.ts



https://chromewebstore.google.com/detail/midscenejs/gbldofcpkknbggpkmbdaefngejllnief






