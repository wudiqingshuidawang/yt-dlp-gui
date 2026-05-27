import { useState } from 'react'
import { open } from '@tauri-apps/api/dialog'

interface SettingsProps {
  downloadPath: string
  filenameTemplate: string
  onDownloadPathChange: (path: string) => void
  onFilenameTemplateChange: (template: string) => void
  onClose: () => void
}

function Settings({
  downloadPath,
  filenameTemplate,
  onDownloadPathChange,
  onFilenameTemplateChange,
  onClose,
}: SettingsProps) {
  const [localPath, setLocalPath] = useState(downloadPath)
  const [localTemplate, setLocalTemplate] = useState(filenameTemplate)

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
