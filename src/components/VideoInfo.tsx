import type { VideoInfo as VideoInfoType, Format, DownloadMode } from '../types'

interface VideoInfoProps {
  video: VideoInfoType
  selectedFormat: Format | null
  audioFormat: string
  audioQuality: number
  selectedSubtitles: string[]
  embedSubtitles: boolean
  activeTab: DownloadMode
  onFormatSelect: (format: Format) => void
  onAudioFormatChange: (format: string) => void
  onAudioQualityChange: (quality: number) => void
  onSubtitleToggle: (lang: string) => void
  onEmbedSubtitlesChange: (embed: boolean) => void
  onTabChange: (tab: DownloadMode) => void
  onDownload: () => void
}

const AUDIO_FORMATS = ['mp3', 'wav', 'flac', 'aac', 'ogg']

function VideoInfo({
  video,
  selectedFormat,
  audioFormat,
  audioQuality,
  selectedSubtitles,
  embedSubtitles,
  activeTab,
  onFormatSelect,
  onAudioFormatChange,
  onAudioQualityChange,
  onSubtitleToggle,
  onEmbedSubtitlesChange,
  onTabChange,
  onDownload,
}: VideoInfoProps) {
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const formatBitrate = (kbps: number) => {
    if (kbps === 0) return ''
    if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} Mbps`
    return `${Math.round(kbps)} kbps`
  }

  const canDownload = () => {
    if (activeTab === 'video') return selectedFormat !== null
    if (activeTab === 'audio') return true
    if (activeTab === 'subtitle') return selectedSubtitles.length > 0
    return false
  }

  return (
    <div className="video-info">
      <div className="video-header">
        <div className="video-thumbnail">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt={video.title} />
          ) : (
            <div className="thumbnail-placeholder">▶</div>
          )}
        </div>
        <div className="video-details">
          <h2 className="video-title">{video.title}</h2>
          <p className="video-duration">Duration: {formatDuration(video.duration)}</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => onTabChange('video')}
        >
          Video
        </button>
        <button
          className={`tab ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => onTabChange('audio')}
        >
          Audio
        </button>
        <button
          className={`tab ${activeTab === 'subtitle' ? 'active' : ''}`}
          onClick={() => onTabChange('subtitle')}
        >
          Subtitles
        </button>
      </div>

      {activeTab === 'video' && (
        <div className="format-selection">
          <h3>Select Format</h3>
          <div className="format-list">
            {video.formats.map((format) => (
              <button
                key={format.format_id}
                className={`format-item ${selectedFormat?.format_id === format.format_id ? 'selected' : ''}`}
                onClick={() => onFormatSelect(format)}
              >
                <span className="format-quality">{format.quality}</span>
                <span className="format-resolution">{format.resolution}</span>
                {format.vcodec && format.vcodec !== 'unknown' && (
                  <span className="format-codec">{format.vcodec}</span>
                )}
                {format.bitrate > 0 && (
                  <span className="format-bitrate">{formatBitrate(format.bitrate)}</span>
                )}
                <span className="format-size">{formatFileSize(format.filesize)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audio' && (
        <div className="audio-options">
          <div className="option-group">
            <label>Audio Format</label>
            <div className="audio-format-list">
              {AUDIO_FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  className={`format-chip ${audioFormat === fmt ? 'selected' : ''}`}
                  onClick={() => onAudioFormatChange(fmt)}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label>Quality: {audioQuality === 0 ? 'Best' : audioQuality}</label>
            <input
              type="range"
              min="0"
              max="9"
              value={audioQuality}
              onChange={(e) => onAudioQualityChange(Number(e.target.value))}
              className="quality-slider"
            />
            <div className="slider-labels">
              <span>Best</span>
              <span>Worst</span>
            </div>
          </div>

          {video.audio_formats.length > 0 && (
            <div className="option-group">
              <label>Available Audio Streams</label>
              <div className="audio-stream-list">
                {video.audio_formats.map((fmt) => (
                  <div key={fmt.format_id} className="audio-stream-item">
                    <span className="audio-stream-codec">{fmt.acodec}</span>
                    <span className="audio-stream-ext">{fmt.ext}</span>
                    <span className="audio-stream-bitrate">{formatBitrate(fmt.bitrate)}</span>
                    <span className="audio-stream-size">{formatFileSize(fmt.filesize)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'subtitle' && (
        <div className="subtitle-options">
          {video.subtitles.length === 0 ? (
            <p className="no-subtitles">No subtitles available for this video</p>
          ) : (
            <>
              <div className="option-group">
                <label>Select Languages</label>
                <div className="subtitle-list">
                  {video.subtitles.map((sub) => (
                    <label key={sub.lang} className="subtitle-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedSubtitles.includes(sub.lang)}
                        onChange={() => onSubtitleToggle(sub.lang)}
                      />
                      <span className="subtitle-name">{sub.name}</span>
                      <span className="subtitle-lang">{sub.lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={embedSubtitles}
                    onChange={(e) => onEmbedSubtitlesChange(e.target.checked)}
                  />
                  Embed in video file
                </label>
              </div>
            </>
          )}
        </div>
      )}

      <button
        className="download-btn"
        onClick={onDownload}
        disabled={!canDownload()}
      >
        {activeTab === 'video' && 'Download Video'}
        {activeTab === 'audio' && 'Download Audio'}
        {activeTab === 'subtitle' && 'Download Subtitles'}
      </button>
    </div>
  )
}

export default VideoInfo
