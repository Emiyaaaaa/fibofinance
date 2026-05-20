# 贡献指南

感谢你愿意为 FiboFinance 做贡献。这个项目是一个轻量的自部署资产记录应用，欢迎提交问题反馈、文档改进、Bug 修复和功能优化。

## 开始之前

- 提交 Issue 前，请先搜索是否已有相关问题或讨论。
- 修改功能前，建议先描述需求、使用场景和预期行为，方便确认实现方向。
- 不要提交真实的数据库连接串、API Key、密码或其他敏感信息。

## 本地开发

1. Fork 并克隆仓库。

2. 安装依赖：

```bash
npm install
```

3. 创建 `.env.local`，并按需配置环境变量：

```bash
DATABASE_URL="postgres://..."
OPENAI_API_KEY="" # 可选
OPENAI_MODEL="" # 可选
OPENAI_BASE_URL="" # 可选
```

4. 启动开发服务器：

```bash
npm run dev
```

## 常用命令

```bash
npm run dev
npm run lint
npm run lint:fix
npm run typecheck
npm run build
```

提交前请尽量运行 `npm run lint` 和 `npm run typecheck`。如果改动影响构建、路由、数据库同步或部署流程，也请运行 `npm run build`。

## 代码规范

- 使用 TypeScript 和 React/Next.js 的现有项目风格。
- 优先复用已有组件、工具函数和状态管理逻辑，避免引入不必要的新抽象。
- 文案改动请同步检查 `i18n/zh.json` 和 `i18n/en.json`。
- 涉及资产、分组、汇率、密码或 AI 分析的行为改动，请说明对现有数据和部署环境的影响。
- 保持格式化配置一致，不要随意调整 `.prettierrc.json`、`tsconfig.json` 或构建配置。

## 提交 Pull Request

PR 描述建议包含：

- 改动目的和主要内容。
- 关联的 Issue 或背景说明。
- 已执行的验证命令。
- 对部署、环境变量、数据库或用户数据的影响。
- UI 改动的截图或录屏。

请保持 PR 聚焦，避免把无关重构、格式化和功能改动混在一起。

## 报告问题

提交 Bug 时，请尽量提供：

- 复现步骤。
- 预期行为和实际行为。
- 浏览器、系统、部署平台和 Node.js/npm 版本。
- 相关截图、日志或错误信息。

如果问题涉及自部署环境，请隐藏数据库地址、API Key、域名中的敏感部分后再发布。

## 许可证

提交贡献即表示你同意贡献内容遵循本项目的 [MIT License](./LICENSE)。
