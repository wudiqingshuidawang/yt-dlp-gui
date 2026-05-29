import type { DownloadItem } from '../types'
import Tooltip from './Tooltip'

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
      case 'pending':
        return (
          <svg className="status-icon status-pending" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" opacity="0.6">
              <animateTransform attributeName="transform" type="rotate" values="0 10 10;360 10 10" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.5" />
          </svg>
        )
      case 'downloading':
        return (
          <svg className="status-icon status-downloading" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v10M10 13l-4-4M10 13l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 15h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="status-icon status-completed" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M6.5 10l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case 'error':
        return (
          <svg className="status-icon status-error" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
      case 'cancelled':
        return (
          <svg className="status-icon status-cancelled" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M7 10h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
      default:
        return <span className="status-icon">?</span>
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
                <Tooltip text="Cancel download">
                  <button
                    className="action-btn cancel"
                    onClick={() => onCancel(item.downloadId)}
                  >
                    Cancel
                  </button>
                </Tooltip>
              )}
              {(item.status === 'completed' || item.status === 'error' || item.status === 'cancelled') && (
                <Tooltip text="Remove from list">
                  <button
                    className="action-btn remove"
                    onClick={() => onRemove(item.downloadId)}
                  >
                    ✕
                  </button>
                </Tooltip>
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
                    <Tooltip text="Open the downloaded file">
                      <button
                        className="action-btn"
                        onClick={() => onOpenFile(item.filePath!)}
                      >
                        Open File
                      </button>
                    </Tooltip>
                    <Tooltip text="Open containing folder">
                      <button
                        className="action-btn"
                        onClick={() => onOpenFolder(item.filePath!)}
                      >
                        Open Folder
                      </button>
                    </Tooltip>
                  </>
                )}
              </div>
            )}

            {item.status === 'error' && (
              <div className="download-actions">
                <Tooltip text="Retry this download">
                  <button
                    className="action-btn retry"
                    onClick={() => onRetry(item)}
                  >
                    Retry
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DownloadList
