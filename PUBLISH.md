# SakuraFetch 发布指南

## 📦 构建发布版本

```bash
cd ~/Documents/Project/yt-dlp-gui

# 构建生产版本
npm run tauri build
```

构建完成后，产物在 `src-tauri/target/release/bundle/` 目录：
- macOS: `dmg/` 和 `macos/` 文件夹
- Windows: `msi/` 文件夹  
- Linux: `appimage/` 和 `deb/` 文件夹

## 🚀 发布到 GitHub

### 1. 创建 GitHub 仓库

```bash
# 初始化 git（如果还没有）
git init
git add .
git commit -m "Initial commit: SakuraFetch v1.0.0"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/sakura-fetch.git
git push -u origin main
```

### 2. 创建 Release

```bash
# 打 tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 3. 上传构建产物

在 GitHub 仓库页面：
1. 点击 "Releases" → "Create a new release"
2. 选择刚创建的 tag (v1.0.0)
3. 填写发布说明
4. 上传 `src-tauri/target/release/bundle/` 中的文件：
   - `dmg/SakuraFetch_1.0.0_aarch64.dmg` (macOS)
   - `msi/SakuraFetch_1.0.0_x64_en-US.msi` (Windows)
   - `appimage/sakura-fetch_1.0.0_amd64.AppImage` (Linux)

## 📋 发布清单

- [ ] 更新版本号 (`src-tauri/tauri.conf.json`)
- [ ] 测试所有功能正常
- [ ] 构建所有平台版本
- [ ] 编写发布说明
- [ ] 创建 GitHub Release
- [ ] 上传构建产物
- [ ] 更新 README 安装链接

## 🎯 发布说明模板

```markdown
# SakuraFetch v1.0.0

## 🌟 新特性
- 动漫风格界面设计
- 支持多种视频平台下载
- 音频格式转换功能
- 字幕下载与嵌入

## 📦 下载
- **macOS**: `SakuraFetch_1.0.0_aarch64.dmg`
- **Windows**: `SakuraFetch_1.0.0_x64_en-US.msi`
- **Linux**: `sakura-fetch_1.0.0_amd64.AppImage`

## 🛠️ 依赖
需要安装 [yt-dlp](https://github.com/yt-dlp/yt-dlp)

## 📝 更新日志
- 初始版本发布
- 樱花主题界面
- 多平台视频下载支持
```

## 🔧 自动化构建（可选）

使用 GitHub Actions 自动构建：

```yaml
# .github/workflows/build.yml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install Rust
      uses: dtolnay/rust-toolchain@stable
      
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run tauri build
      
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: release-${{ matrix.os }}
        path: src-tauri/target/release/bundle/*
```

## 📢 推广渠道

1. **GitHub** - 主要发布平台
2. **Reddit** - r/opensource, r/selfhosted
3. **Hacker News** - Show HN
4. **V2EX** - 分享创造节点
5. **知乎** - 开源项目推荐
6. **Bilibili** - 演示视频

## 🎨 宣传素材

- 应用截图（多平台）
- 功能演示 GIF
- 动漫风格宣传图
- 简短介绍视频
