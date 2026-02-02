# ZenVocab - 极简单词流

基于 AI 的极简单词学习工具

## 功能特性

### ✅ Phase 1 - 核心功能
- TXT 单词导入与解析
- IndexedDB 本地存储
- 单词列表展示
- 勾选完成交互
- AI 生成例句和助记（阿里云千问）
- Web Speech API 语音播放

### ✅ Phase 2 - 体验升级
- 圆形进度环 Dashboard
- 复习功能（查看已学单词，可"忘记"恢复）
- 智能分组加载（每次 20 个单词）
- 文件上传支持（从 TXT 文件导入）

### ✅ Phase 3 - 完善功能
- **数据导出/导入** - JSON 格式备份，防止数据丢失
- **夜间模式** - 深色/浅色主题切换
- **PWA 支持** - 可添加到手机主屏幕，像原生 App 使用
- **设置页面** - 统一管理所有配置

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 打开浏览器
访问 [http://localhost:3000](http://localhost:3000)

## 使用说明

### 导入单词
1. 点击"导入单词"按钮
2. 选择方式：
   - **从 TXT 文件导入**：点击上传按钮，选择 .txt 文件
   - **手动粘贴**：直接在文本框粘贴单词（每行一个）
3. 点击"确认导入"

### 学习单词
1. 点击"开始学习"进入学习页面
2. 点击单词查看 AI 生成的例句和助记
3. 点击喇叭图标播放发音
4. 勾选 Checkbox 标记为已掌握
5. 每次显示 20 个单词，完成后自动加载下一批

### 复习功能
1. 点击"复习已学单词"查看所有已掌握的单词
2. 点击"忘记了"将单词恢复到学习列表

### 数据备份
1. 点击右上角设置图标 ⚙️
2. 选择"导出备份"下载 JSON 文件
3. 可通过"导入备份"恢复数据

### 夜间模式
1. 进入设置页面
2. 点击"切换"按钮开启/关闭深色模式

### PWA 安装（可选）
#### iOS (Safari)
1. 点击分享按钮
2. 选择"添加到主屏幕"

#### Android (Chrome)
1. 点击浏览器菜单
2. 选择"安装应用"或"添加到主屏幕"

**注意**：首次使用 PWA 功能需要先生成图标文件，详见 `public/ICON_SETUP.md`

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **数据库**: IndexedDB (Dexie.js)
- **AI**: 阿里云百炼大模型
- **语音**: Web Speech API
- **PWA**: Service Worker + Manifest

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 点击 Deploy
4. 完成！你会得到一个 `xxx.vercel.app` 域名

## 项目结构

```
zenvocab/
├── app/                    # Next.js 页面
│   ├── page.tsx           # 首页 Dashboard
│   ├── learn/             # 学习页面
│   ├── review/            # 复习页面
│   └── settings/          # 设置页面
├── components/            # UI 组件
│   ├── ui/               # 基础 UI 组件
│   └── pwa-installer.tsx # PWA 注册器
├── lib/
│   ├── db.ts             # IndexedDB 配置
│   ├── ai.ts             # AI 接口
│   ├── backup.ts         # 数据导出/导入
│   └── use-theme.ts      # 主题切换 Hook
├── public/
│   ├── manifest.json     # PWA Manifest
│   └── sw.js            # Service Worker
└── package.json
```

## 常见问题

### Q: 数据存储在哪里？
A: 所有数据存储在浏览器的 IndexedDB 中，完全本地化，不需要服务器。

### Q: 清除浏览器缓存会丢失数据吗？
A: 会！建议定期使用"导出备份"功能保存数据。

### Q: AI 生成失败怎么办？
A: 检查网络连接，确保 API Key 正确。如果仍然失败，可以手动重试。

### Q: 支持多设备同步吗？
A: 当前版本不支持云同步，但可以通过导出/导入备份在设备间转移数据。

## License

MIT

---

**Enjoy Learning! 🚀**
