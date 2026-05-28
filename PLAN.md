# SakuraFetch ✿ — 视频下载器

## 项目愿景
一个现代化的 yt-dlp GUI 界面，让视频下载变得简单直观。

## 核心功能

### 1. 视频下载
- 粘贴 URL 自动解析
- 选择视频质量
- 选择下载格式
- 显示进度条
- 下载速度/剩余时间

### 2. 批量下载
- 支持播放列表
- 支持多个 URL
- 批量选择质量

### 3. 下载管理
- 下载队列
- 暂停/继续
- 重试失败项
- 下载历史

### 4. 设置
- 默认下载路径
- 代理配置
- 文件名模板
- 字幕下载
- 封面下载

## 技术栈
- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Tauri (Rust)
- **下载引擎**: yt-dlp (外部命令)

## 目录结构

```
yt-dlp-gui/
├── src-tauri/           # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                 # React 前端
│   ├── App.tsx
│   ├── components/
│   │   ├── URLInput.tsx
│   │   ├── VideoInfo.tsx
│   │   ├── DownloadList.tsx
│   │   ├── Settings.tsx
│   │   └── ProgressBar.tsx
│   ├── hooks/
│   │   └── useDownloader.ts
│   └── lib/
│       └── api.ts
├── package.json
└── README.md
```

## 实现步骤

1. 创建 Tauri 项目
2. 实现后端下载逻辑
3. 实现前端 UI
4. 集成 yt-dlp
5. 打包发布

## 验证标准
- 能解析 YouTube 视频
- 能选择质量
- 能显示下载进度
- 能完成下载
- UI 美观易用
