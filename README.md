# Pack My Bags

移动端优先的旅行打包清单工具。根据目的地、天数和补充信息，通过 Claude API 智能生成分类行李清单，数据保存在浏览器 localStorage。

## 功能

- **行程页**：查看已保存行程，展示打包进度
- **打包页**：新建行程 → AI 生成清单 → 勾选打包 → 保存
- **本地存储**：无需登录，数据存在 localStorage
- **Claude API**：服务端调用，API Key 不暴露在前端

## 本地开发

```bash
npm install
cp .env.example .env.local
# 在 .env.local 中填入 ANTHROPIC_API_KEY
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 部署到 Vercel

1. 将仓库推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在 Environment Variables 中添加 `ANTHROPIC_API_KEY`
4. 部署

## 技术栈

- Next.js 16 + React 19
- Tailwind CSS 4
- Anthropic Claude API (`claude-sonnet-4-20250514`)
- lucide-react
