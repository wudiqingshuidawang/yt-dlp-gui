import { useState } from 'react'
import URLInput from './components/URLInput'
import VideoInfo from './components/VideoInfo'
import DownloadList from './components/DownloadList'
import Settings from './components/Settings'

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

interface Format {
  format_id: string
  ext: string
  resolution: string
  filesize: number
  quality: string
}

function App() {
  const [url, setUrl] = useState('')
  const [video, setVideo] = useState<Video | null>(null)
  const [downloads, setDownloads] = useState<Video[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleURLSubmit = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    try {
      // TODO: 调用 Tauri 后端获取视频信息
      const videoInfo: Video = {
        id: 'test',
        title: '测试视频',
        thumbnail: '',
        duration: 120,
        formats: [
          { format_id: '1', ext: 'mp4', resolution: '1080p', filesize: 100000000, quality: '高清' },
          { format_id: '2', ext: 'mp4', resolution: '720p', filesize: 50000000, quality: '标清' },
          { format_id: '3', ext: 'mp3', resolution: 'audio', filesize: 5000000, quality: '音频' },
        ],
        status: 'pending',
        progress: 0,
        speed: '',
        eta: '',
      }
      setVideo(videoInfo)
    } catch (error) {
      console.error('获取视频信息失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!video || !video.selectedFormat) return

    const downloadItem: Video = {
      ...video,
      status: 'downloading',
      progress: 0,
    }

    setDownloads(prev => [...prev, downloadItem])
    setVideo(null)
    setUrl('')

    // TODO: 调用 Tauri 后端开始下载
  }

  const handleFormatSelect = (format: Format) => {
    if (!video) return
    setVideo({ ...video, selectedFormat: format })
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <span className="icon">🎬</span>
          <h1>YT-DLP GUI</h1>
        </div>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️
        </button>
      </header>

      <main className="main">
        <URLInput 
          url={url}
          onChange={setUrl}
          onSubmit={handleURLSubmit}
          isLoading={isLoading}
        />

        {video && (
          <VideoInfo 
            video={video}
            onFormatSelect={handleFormatSelect}
            onDownload={handleDownload}
          />
        )}

        {downloads.length > 0 && (
          <DownloadList downloads={downloads} />
        )}
      </main>

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

export default App
