# FiboFinance

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Self-hosted](https://img.shields.io/badge/self--hosted-first-brightgreen)

[English](./README.md) | [简体中文](./README_ZH.md)

斐波纳财（FiboFinance）是一个轻量的自部署资产记录应用：记资产、看趋势、看配置，支持 AI 分析。

## 亮点

- 自部署、数据安全、密码保护
- 支持分组管理
- 多币种支持、自定义汇率（白银、黄金等按克记录，自动转换为人民币）
- 支持趋势图、配置饼图、历史记录
- 支持 AI 分析

## 部署

Vercel 一键部署

[![Vercel 一键部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/emiyaaaaa/fibofinance)

创建 Neon 数据库
![部署截图](./public/database.png)

链接数据库
![部署截图](./public/connect-database.png)

配置 AI 分析（可选）
![部署截图](./public/settings-env.png)

因为数据库初始化这步放在了构建过程中，所以如果没有连接数据就部署可能会失败，需要连接上数据库后重新部署。

## 本地开发

.env.local 配置

```bash
DATABASE_URL="postgres://..."
OPENAI_API_KEY="" # 可选
OPENAI_MODEL="" # 可选
OPENAI_BASE_URL="" # 可选
```

启动

```bash
npm install

npm run dev
```

## 许可证

[MIT](./LICENSE)
