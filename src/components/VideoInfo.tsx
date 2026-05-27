interface Format {
  format_id: string
  ext: string
  resolution: string
  filesize: number
  quality: string
}

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: number
  formats: Format[]
  selectedFormat?: Format
  status: 'pending' | 'downloading' | 'completed' | 'error'
  progress: number
  speed: string
  eta: string
}

interface VideoInfoProps {
  video: Video
  onFormatSelect: (format: Format) => void
  onDownload: () => void
}

function VideoInfo({ video, onFormatSelect, onDownload }: VideoInfoProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  return (
    <div className="video-info">
      <div className="video-header">
        <div className="video-thumbnail">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt={video.title} />
          ) : (
            <div className="thumbnail-placeholder">🎬</div>
          )}
        </div>
        <div className="video-details">
          <h2 className="video-title">{video.title}</h2>
          <p className="video-duration">时长: {formatDuration(video.duration)}</p>
        </div>
      </div>

      <div className="format-selection">
        <h3>选择格式</h3>
        <div className="format-list">
          {video.formats.map((format) => (
            <button
              key={format.format_id}
              className={`format-item ${video.selectedFormat?.format_id === format.format_id ? 'selected' : ''}`}
              onClick={() => onFormatSelect(format)}
            >
              <span className="format-quality">{format.quality}</span>
              <span className="format-resolution">{format.resolution}</span>
              <span className="format-size">{formatFileSize(format.filesize)}</span>
            </button>
          ))}
        </div>
      </div>

      <button 
        className="download-btn"
        onClick={onDownload}
        disabled={!video.selectedFormat}
      >
        ⬇️ 下载
      </button>
    </div>
  )
}

export default VideoInfo
