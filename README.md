# 🎬 YT-DLP GUI

一个现代化的 yt-dlp GUI 界面，让视频下载变得简单直观。

## ✨ 功能特点

- 🎯 **简单易用** - 粘贴 URL 即可解析
- 🎨 **现代界面** - 美观的渐变色 UI
- ⚡ **多种格式** - 支持不同质量和格式
- 📊 **下载进度** - 实时显示下载状态
- ⚙️ **灵活配置** - 代理、路径、文件名模板
- 🔄 **批量下载** - 支持播放列表

## 📦 安装

### 前置要求

1. 安装 [yt-dlp](https://github.com/yt-dlp/yt-dlp)
   ```bash
   brew install yt-dlp
   ```

2. 安装 [Node.js](https://nodejs.org/)

3. 安装 [Rust](https://rustup.rs/)

### 开发模式

```bash
# 克隆项目
git clone https://github.com/wudiqingshuidawang/yt-dlp-gui.git
cd yt-dlp-gui

# 安装依赖
npm install

# 启动开发服务器
npm run tauri dev
```

### 构建应用

```bash
# 构建生产版本
npm run tauri build
```

## 🚀 使用方法

1. 启动应用
2. 粘贴视频 URL
3. 点击"解析视频"
4. 选择格式和质量
5. 点击"下载"

## 📁 项目结构

```
yt-dlp-gui/
├── src-tauri/           # Tauri 后端 (Rust)
│   ├── src/
│   │   └── main.rs     # 后端逻辑
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                 # React 前端
│   ├── App.tsx         # 主应用
│   ├── components/     # UI 组件
│   │   ├── URLInput.tsx
│   │   ├── VideoInfo.tsx
│   │   ├── DownloadList.tsx
│   │   └── Settings.tsx
│   └── styles.css      # 样式
├── package.json
└── README.md
```

## 🛠️ 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Tauri (Rust)
- **下载引擎**: yt-dlp

## ⚙️ 配置

### 代理设置

在设置页面配置代理：
```
http://127.0.0.1:7897
```

### 文件名模板

可用变量：
- `%(title)s` - 视频标题
- `%(ext)s` - 文件扩展名
- `%(id)s` - 视频 ID
- `%(upload_date)s` - 上传日期

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

⭐ 如果觉得有用，请给个 Star！
