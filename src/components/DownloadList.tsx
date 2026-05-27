interface Video {
  id: string
  title: string
  thumbnail: string
  duration: number
  formats: any[]
  selectedFormat?: any
  status: 'pending' | 'downloading' | 'completed' | 'error'
  progress: number
  speed: string
  eta: string
}

interface DownloadListProps {
  downloads: Video[]
}

function DownloadList({ downloads }: DownloadListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'downloading':
        return '⬇️'
      case 'completed':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '❓'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中'
      case 'downloading':
        return '下载中'
      case 'completed':
        return '已完成'
      case 'error':
        return '失败'
      default:
        return '未知'
    }
  }

  return (
    <div className="download-list">
      <h3>下载队列</h3>
      <div className="download-items">
        {downloads.map((item) => (
          <div key={item.id} className={`download-item ${item.status}`}>
            <div className="download-info">
              <span className="download-icon">{getStatusIcon(item.status)}</span>
              <div className="download-details">
                <span className="download-title">{item.title}</span>
                <span className="download-status">{getStatusText(item.status)}</span>
              </div>
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
                  <span>{item.progress}%</span>
                  {item.speed && <span>{item.speed}</span>}
                  {item.eta && <span>剩余 {item.eta}</span>}
                </div>
              </div>
            )}

            {item.status === 'completed' && (
              <div className="download-actions">
                <button className="action-btn">📁 打开文件</button>
                <button className="action-btn">📂 打开文件夹</button>
              </div>
            )}

            {item.status === 'error' && (
              <div className="download-actions">
                <button className="action-btn retry">🔄 重试</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DownloadList
