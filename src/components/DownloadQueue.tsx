import type { DownloadItem } from '../types'

interface DownloadQueueProps {
  downloads: DownloadItem[]
  maxConcurrent: number
  onPause: (downloadId: string) => void
  onResume: (downloadId: string) => void
  onCancel: (downloadId: string) => void
  onRemove: (downloadId: string) => void
  onClearCompleted: () => void
}

function DownloadQueue({
  downloads,
  maxConcurrent,
  onPause,
  onResume,
  onCancel,
  onRemove,
  onClearCompleted,
}: DownloadQueueProps) {
  const activeDownloads = downloads.filter((d) => d.status === 'downloading')
  const queuedDownloads = downloads.filter((d) => d.status === 'pending')
  const completedDownloads = downloads.filter((d) => d.status === 'completed')
  const errorDownloads = downloads.filter((d) => d.status === 'error')

  const formatSpeed = (speed: string) => {
    if (!speed) return '--'
    return speed
  }

  const formatEta = (eta: string) => {
    if (!eta) return '--'
    return eta
  }

  return (
    <div className="download-queue">
      {/* Queue stats */}
      <div className="queue-stats">
        <div className="queue-stat">
          <span className="stat-label">下载中</span>
          <span className="stat-value">{activeDownloads.length}/{maxConcurrent}</span>
        </div>
        <div className="queue-stat">
          <span className="stat-label">队列中</span>
          <span className="stat-value">{queuedDownloads.length}</span>
        </div>
        <div className="queue-stat">
          <span className="stat-label">已完成</span>
          <span className="stat-value">{completedDownloads.length}</span>
        </div>
        <div className="queue-stat">
          <span className="stat-label">失败</span>
          <span className="stat-value">{errorDownloads.length}</span>
        </div>
      </div>

      {/* Active downloads */}
      {activeDownloads.length > 0 && (
        <div className="queue-section">
          <h4>正在下载</h4>
          {activeDownloads.map((item, index) => (
            <div key={item.downloadId} className="queue-item active">
              <div className="queue-item-info">
                <span className="queue-position">#{index + 1}</span>
                <span className="queue-title">{item.title}</span>
              </div>
              <div className="queue-item-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="progress-text">{item.progress.toFixed(1)}%</span>
              </div>
              <div className="queue-item-stats">
                <span className="speed">{formatSpeed(item.speed)}</span>
                <span className="eta">{formatEta(item.eta)}</span>
              </div>
              <div className="queue-item-actions">
                <button
                  className="btn-pause"
                  onClick={() => onPause(item.downloadId)}
                  title="暂停"
                >
                  ⏸
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => onCancel(item.downloadId)}
                  title="取消"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Queued downloads */}
      {queuedDownloads.length > 0 && (
        <div className="queue-section">
          <h4>等待中</h4>
          {queuedDownloads.map((item, index) => (
            <div key={item.downloadId} className="queue-item queued">
              <div className="queue-item-info">
                <span className="queue-position">#{activeDownloads.length + index + 1}</span>
                <span className="queue-title">{item.title}</span>
              </div>
              <div className="queue-item-actions">
                <button
                  className="btn-cancel"
                  onClick={() => onCancel(item.downloadId)}
                  title="取消"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed downloads */}
      {completedDownloads.length > 0 && (
        <div className="queue-section">
          <div className="queue-section-header">
            <h4>已完成</h4>
            <button className="text-btn" onClick={onClearCompleted}>
              清除全部
            </button>
          </div>
          {completedDownloads.map((item) => (
            <div key={item.downloadId} className="queue-item completed">
              <div className="queue-item-info">
                <span className="queue-title">{item.title}</span>
              </div>
              <div className="queue-item-actions">
                <button
                  className="btn-remove"
                  onClick={() => onRemove(item.downloadId)}
                  title="移除"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error downloads */}
      {errorDownloads.length > 0 && (
        <div className="queue-section">
          <h4>失败</h4>
          {errorDownloads.map((item) => (
            <div key={item.downloadId} className="queue-item error">
              <div className="queue-item-info">
                <span className="queue-title">{item.title}</span>
                <span className="queue-error">{item.error}</span>
              </div>
              <div className="queue-item-actions">
                <button
                  className="btn-retry"
                  onClick={() => onResume(item.downloadId)}
                  title="重试"
                >
                  🔄
                </button>
                <button
                  className="btn-remove"
                  onClick={() => onRemove(item.downloadId)}
                  title="移除"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DownloadQueue
