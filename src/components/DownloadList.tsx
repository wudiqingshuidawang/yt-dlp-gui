import type { DownloadItem } from '../types'

interface DownloadListProps {
  downloads: DownloadItem[]
  onCancel: (downloadId: string) => void
  onOpenFile: (path: string) => void
  onOpenFolder: (path: string) => void
  onRetry: (item: DownloadItem) => void
  onRemove: (downloadId: string) => void
  onClearCompleted: () => void
  compact?: boolean
}

function DownloadList({
  downloads,
  onCancel,
  onOpenFile,
  onOpenFolder,
  onRetry,
  onRemove,
  onClearCompleted,
  compact = false,
}: DownloadListProps) {
  const getStatusIcon = (status: DownloadItem['status']) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'downloading': return '⬇'
      case 'completed': return '✓'
      case 'error': return '✕'
      case 'cancelled': return '⊘'
      default: return '?'
    }
  }

  const getStatusText = (status: DownloadItem['status']) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'downloading': return 'Downloading'
      case 'completed': return 'Completed'
      case 'error': return 'Failed'
      case 'cancelled': return 'Cancelled'
      default: return 'Unknown'
    }
  }

  const getTypeBadge = (type: DownloadItem['downloadType']) => {
    switch (type) {
      case 'video': return 'Video'
      case 'audio': return 'Audio'
      case 'subtitle': return 'Sub'
      default: return '?'
    }
  }

  const hasCompleted = downloads.some((d) => d.status === 'completed')

  return (
    <div className={`download-list ${compact ? 'compact' : ''}`}>
      <div className="download-list-header">
        <h3>Downloads</h3>
        {hasCompleted && (
          <button className="clear-btn" onClick={onClearCompleted}>
            Clear Completed
          </button>
        )}
      </div>
      <div className="download-items">
        {downloads.map((item) => (
          <div key={item.downloadId} className={`download-item ${item.status}`}>
            <div className="download-info">
              <span className="download-icon">{getStatusIcon(item.status)}</span>
              <div className="download-details">
                <span className="download-title">
                  <span className={`download-type-badge ${item.downloadType}`}>{getTypeBadge(item.downloadType)}</span>
                  {item.title}
                </span>
                <span className="download-status">
                  {getStatusText(item.status)}
                  {item.status === 'downloading' && item.speed && ` - ${item.speed}`}
                </span>
                {item.error && (
                  <span className="download-error">{item.error}</span>
                )}
              </div>
              {item.status === 'downloading' && (
                <button
                  className="action-btn cancel"
                  onClick={() => onCancel(item.downloadId)}
                  title="Cancel download"
                >
                  Cancel
                </button>
              )}
              {(item.status === 'completed' || item.status === 'error' || item.status === 'cancelled') && (
                <button
                  className="action-btn remove"
                  onClick={() => onRemove(item.downloadId)}
                  title="Remove from list"
                >
                  ✕
                </button>
              )}
            </div>

            {item.status === 'downloading' && (
              <div className="download-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <div className="progress-info">
                  <span>{item.progress.toFixed(1)}%</span>
                  {item.speed && <span>{item.speed}</span>}
                  {item.eta && <span>ETA {item.eta}</span>}
                </div>
                {item.downloadedSize && item.totalSize && (
                  <div className="progress-size">
                    {item.downloadedSize} / {item.totalSize}
                  </div>
                )}
              </div>
            )}

            {item.status === 'completed' && (
              <div className="download-actions">
                {item.filePath && (
                  <>
                    <button
                      className="action-btn"
                      onClick={() => onOpenFile(item.filePath!)}
                    >
                      Open File
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => onOpenFolder(item.filePath!)}
                    >
                      Open Folder
                    </button>
                  </>
                )}
              </div>
            )}

            {item.status === 'error' && (
              <div className="download-actions">
                <button
                  className="action-btn retry"
                  onClick={() => onRetry(item)}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DownloadList
