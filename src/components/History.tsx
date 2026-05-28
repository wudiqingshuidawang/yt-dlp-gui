import type { HistoryItem } from '../types'

interface HistoryProps {
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onDelete: (id: string, downloadType: string) => void
  onClear: () => void
  onClose: () => void
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'video': return '📹 视频'
    case 'audio': return '🎵 音频'
    case 'subtitle': return '📝 字幕'
    default: return type
  }
}

export default function History({ history, onSelect, onDelete, onClear, onClose }: HistoryProps) {
  if (history.length === 0) {
    return (
      <div className="history">
        <div className="history-header">
          <h3>下载历史</h3>
          <button className="text-btn" onClick={onClose}>← 返回</button>
        </div>
        <div className="history-empty">
          <span className="empty-icon">📋</span>
          <p>还没有下载记录</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history">
      <div className="history-header">
        <h3>下载历史 ({history.length})</h3>
        <div className="history-actions">
          <button className="text-btn danger" onClick={onClear}>清空历史</button>
          <button className="text-btn" onClick={onClose}>← 返回</button>
        </div>
      </div>
      <div className="history-list">
        {history.map((item) => (
          <div key={`${item.id}-${item.downloadType}-${item.completedAt}`} className="history-item">
            <div className="history-thumbnail">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.title} />
              ) : (
                <div className="thumbnail-placeholder">▶</div>
              )}
            </div>
            <div className="history-info" onClick={() => onSelect(item)}>
              <div className="history-title">{item.title}</div>
              <div className="history-meta">
                <span className="history-type">{getTypeLabel(item.downloadType)}</span>
                <span className="history-format">{item.format.ext.toUpperCase()}</span>
                <span className="history-time">{formatTime(item.completedAt)}</span>
              </div>
            </div>
            <button
              className="history-delete"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id, item.downloadType)
              }}
              title="删除"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
