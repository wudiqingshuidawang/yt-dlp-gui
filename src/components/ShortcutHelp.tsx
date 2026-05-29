import { modKey } from '../hooks/useKeyboardShortcuts'

interface ShortcutHelpProps {
  onClose: () => void
}

const shortcuts = [
  { keys: [modKey(), 'V'], description: '聚焦 URL 输入框' },
  { keys: [modKey(), 'Enter'], description: '解析视频' },
  { keys: [modKey(), 'H'], description: '切换下载历史' },
  { keys: [modKey(), ','], description: '打开设置' },
  { keys: ['Esc'], description: '关闭弹窗' },
  { keys: ['?'], description: '显示快捷键帮助' },
]

export default function ShortcutHelp({ onClose }: ShortcutHelpProps) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal shortcut-help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>键盘快捷键</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="settings-content">
          <div className="shortcut-list">
            {shortcuts.map((s, i) => (
              <div key={i} className="shortcut-row">
                <span className="shortcut-desc">{s.description}</span>
                <span className="shortcut-keys">
                  {s.keys.map((k, j) => (
                    <span key={j}>
                      {j > 0 && <span className="shortcut-plus">+</span>}
                      <kbd>{k}</kbd>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
