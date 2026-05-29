import { useState } from 'react'
import { open } from '@tauri-apps/api/dialog'

interface SettingsProps {
  downloadPath: string
  filenameTemplate: string
  theme: 'light' | 'dark'
  maxConcurrent: number
  proxy: string
  defaultAudioFormat: string
  onDownloadPathChange: (path: string) => void
  onFilenameTemplateChange: (template: string) => void
  onThemeChange: (theme: 'light' | 'dark') => void
  onMaxConcurrentChange: (max: number) => void
  onProxyChange: (proxy: string) => void
  onDefaultAudioFormatChange: (format: string) => void
  onSave?: () => void
  onClose: () => void
}

const AUDIO_FORMATS = ['mp3', 'wav', 'flac', 'aac', 'ogg']

function Settings({
  downloadPath,
  filenameTemplate,
  theme,
  maxConcurrent,
  proxy,
  defaultAudioFormat,
  onDownloadPathChange,
  onFilenameTemplateChange,
  onThemeChange,
  onMaxConcurrentChange,
  onProxyChange,
  onDefaultAudioFormatChange,
  onSave,
  onClose,
}: SettingsProps) {
  const [localPath, setLocalPath] = useState(downloadPath)
  const [localTemplate, setLocalTemplate] = useState(filenameTemplate)
  const [localProxy, setLocalProxy] = useState(proxy)

  const handleSelectPath = async () => {
    try {
      const selected = await open({ directory: true })
      if (selected) {
        setLocalPath(selected as string)
      }
    } catch (error) {
      console.error('Failed to select path:', error)
    }
  }

  const handleSave = () => {
    onDownloadPathChange(localPath)
    onFilenameTemplateChange(localTemplate)
    onProxyChange(localProxy)
    onSave?.()
    onClose()
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          {/* Appearance */}
          <div className="settings-section">
            <h4 className="settings-section-title">Appearance</h4>
            <div className="setting-group">
              <label>Theme</label>
              <div className="theme-toggle-group">
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => onThemeChange('light')}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Light
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => onThemeChange('dark')}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 9.5a5.5 5.5 0 01-7-7A5.5 5.5 0 1013.5 9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Downloads */}
          <div className="settings-section">
            <h4 className="settings-section-title">Downloads</h4>
            <div className="setting-group">
              <label>Download Path</label>
              <div className="path-input">
                <input
                  type="text"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  placeholder="Select download path..."
                />
                <button className="browse-btn" onClick={handleSelectPath}>
                  Browse
                </button>
              </div>
            </div>

            <div className="setting-group">
              <label>Filename Template</label>
              <input
                type="text"
                value={localTemplate}
                onChange={(e) => setLocalTemplate(e.target.value)}
                placeholder="%(title)s.%(ext)s"
              />
              <p className="hint">Variables: %(title)s, %(ext)s, %(id)s, %(upload_date)s</p>
            </div>

            <div className="setting-group">
              <label>Max Concurrent Downloads</label>
              <div className="concurrent-selector">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={`concurrent-option ${maxConcurrent === n ? 'active' : ''}`}
                    onClick={() => onMaxConcurrentChange(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="Hint">Higher values may be faster but use more bandwidth</p>
            </div>

            <div className="setting-group">
              <label>Default Audio Format</label>
              <div className="audio-format-list compact">
                {AUDIO_FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    className={`format-chip ${defaultAudioFormat === fmt ? 'selected' : ''}`}
                    onClick={() => onDefaultAudioFormatChange(fmt)}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="settings-section">
            <h4 className="settings-section-title">Network</h4>
            <div className="setting-group">
              <label>Proxy</label>
              <input
                type="text"
                value={localProxy}
                onChange={(e) => setLocalProxy(e.target.value)}
                placeholder="socks5://127.0.0.1:1080 or http://proxy:8080"
              />
              <p className="hint">Leave empty to use system proxy settings</p>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default Settings
