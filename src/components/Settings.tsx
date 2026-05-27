import { useState } from 'react'

interface SettingsProps {
  onClose: () => void
}

function Settings({ onClose }: SettingsProps) {
  const [downloadPath, setDownloadPath] = useState('~/Downloads')
  const [proxy, setProxy] = useState('')
  const [filenameTemplate, setFilenameTemplate] = useState('%(title)s.%(ext)s')
  const [downloadSubtitles, setDownloadSubtitles] = useState(false)
  const [downloadThumbnail, setDownloadThumbnail] = useState(false)

  const handleSave = () => {
    // TODO: 保存设置到 Tauri 后端
    onClose()
  }

  const handleSelectPath = async () => {
    // TODO: 调用 Tauri 文件选择器
    try {
      // const selected = await open({ directory: true })
      // if (selected) {
      //   setDownloadPath(selected as string)
      // }
    } catch (error) {
      console.error('选择路径失败:', error)
    }
  }

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>⚙️ 设置</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label>下载路径</label>
            <div className="path-input">
              <input
                type="text"
                value={downloadPath}
                onChange={(e) => setDownloadPath(e.target.value)}
                placeholder="选择下载路径..."
              />
              <button className="browse-btn" onClick={handleSelectPath}>
                📁 浏览
              </button>
            </div>
          </div>

          <div className="setting-group">
            <label>代理设置</label>
            <input
              type="text"
              value={proxy}
              onChange={(e) => setProxy(e.target.value)}
              placeholder="http://127.0.0.1:7897"
            />
            <p className="hint">留空使用系统代理</p>
          </div>

          <div className="setting-group">
            <label>文件名模板</label>
            <input
              type="text"
              value={filenameTemplate}
              onChange={(e) => setFilenameTemplate(e.target.value)}
              placeholder="%(title)s.%(ext)s"
            />
            <p className="hint">可用变量: %(title)s, %(ext)s, %(id)s, %(upload_date)s</p>
          </div>

          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={downloadSubtitles}
                onChange={(e) => setDownloadSubtitles(e.target.checked)}
              />
              下载字幕
            </label>
          </div>

          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={downloadThumbnail}
                onChange={(e) => setDownloadThumbnail(e.target.checked)}
              />
              下载封面
            </label>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose}>取消</button>
          <button className="save-btn" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}

export default Settings
