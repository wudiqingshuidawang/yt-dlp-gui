import { open, save } from '@tauri-apps/api/dialog'
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs'
import type { HistoryItem } from '../types'

interface ExportImportProps {
  history: HistoryItem[]
  onImportHistory: (history: HistoryItem[]) => void
  onClose: () => void
}

function ExportImport({
  history,
  onImportHistory,
  onClose,
}: ExportImportProps) {
  const handleExportHistory = async () => {
    try {
      const filePath = await save({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        defaultPath: 'sakurafetch-history.json',
      })

      if (filePath) {
        const data = JSON.stringify(history, null, 2)
        await writeTextFile(filePath, data)
        alert('历史记录导出成功！')
      }
    } catch (err) {
      alert('导出失败: ' + err)
    }
  }

  const handleExportSettings = async () => {
    try {
      const settings = {
        theme: localStorage.getItem('sakurafetch-theme') || 'light',
        maxConcurrent: localStorage.getItem('sakurafetch-max-concurrent') || '3',
        proxy: localStorage.getItem('sakurafetch-proxy') || '',
        defaultAudioFormat: localStorage.getItem('sakurafetch-audio-format') || 'mp3',
      }

      const filePath = await save({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        defaultPath: 'sakurafetch-settings.json',
      })

      if (filePath) {
        const data = JSON.stringify(settings, null, 2)
        await writeTextFile(filePath, data)
        alert('设置导出成功！')
      }
    } catch (err) {
      alert('导出失败: ' + err)
    }
  }

  const handleImportHistory = async () => {
    try {
      const filePath = await open({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        multiple: false,
      })

      if (filePath) {
        const data = await readTextFile(filePath as string)
        const imported = JSON.parse(data) as HistoryItem[]

        if (Array.isArray(imported)) {
          onImportHistory(imported)
          alert('历史记录导入成功！')
        } else {
          alert('无效的历史记录文件')
        }
      }
    } catch (err) {
      alert('导入失败: ' + err)
    }
  }

  const handleImportSettings = async () => {
    try {
      const filePath = await open({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        multiple: false,
      })

      if (filePath) {
        const data = await readTextFile(filePath as string)
        const settings = JSON.parse(data)

        if (settings.theme) localStorage.setItem('sakurafetch-theme', settings.theme)
        if (settings.maxConcurrent) localStorage.setItem('sakurafetch-max-concurrent', settings.maxConcurrent)
        if (settings.proxy) localStorage.setItem('sakurafetch-proxy', settings.proxy)
        if (settings.defaultAudioFormat) localStorage.setItem('sakurafetch-audio-format', settings.defaultAudioFormat)

        alert('设置导入成功！请重启应用以生效。')
      }
    } catch (err) {
      alert('导入失败: ' + err)
    }
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>导出/导入</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>导出数据</h3>
            <div className="settings-group">
              <button className="settings-btn" onClick={handleExportHistory}>
                📋 导出历史记录
              </button>
              <p className="settings-hint">导出下载历史到 JSON 文件</p>
            </div>
            <div className="settings-group">
              <button className="settings-btn" onClick={handleExportSettings}>
                ⚙️ 导出设置
              </button>
              <p className="settings-hint">导出应用设置到 JSON 文件</p>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-section">
            <h3>导入数据</h3>
            <div className="settings-group">
              <button className="settings-btn" onClick={handleImportHistory}>
                📥 导入历史记录
              </button>
              <p className="settings-hint">从 JSON 文件导入下载历史</p>
            </div>
            <div className="settings-group">
              <button className="settings-btn" onClick={handleImportSettings}>
                ⚙️ 导入设置
              </button>
              <p className="settings-hint">从 JSON 文件导入应用设置</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportImport
