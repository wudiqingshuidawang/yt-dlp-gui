import { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import URLInput from './components/URLInput'
import VideoInfo from './components/VideoInfo'
import DownloadList from './components/DownloadList'
import Settings from './components/Settings'
import type { VideoInfo as VideoInfoType, Format, DownloadItem, DownloadProgressEvent, DownloadMode, DownloadType } from './types'

function App() {
  const [url, setUrl] = useState('')
  const [video, setVideo] = useState<VideoInfoType | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null)
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadPath, setDownloadPath] = useState('~/Downloads')
  const [filenameTemplate, setFilenameTemplate] = useState('%(title)s.%(ext)s')
  const downloadCounter = useRef(0)

  // Tab state
  const [activeTab, setActiveTab] = useState<DownloadMode>('video')
  const [audioFormat, setAudioFormat] = useState('mp3')
  const [audioQuality, setAudioQuality] = useState(0)
  const [selectedSubtitles, setSelectedSubtitles] = useState<string[]>([])
  const [embedSubtitles, setEmbedSubtitles] = useState(false)

  useEffect(() => {
    const unlisten = listen<DownloadProgressEvent>('download-progress', (event) => {
      const { download_id, progress, speed, eta, status, error: err, file_path, downloaded_size, total_size } = event.payload

      setDownloads((prev) =>
        prev.map((d) => {
          if (d.downloadId !== download_id) return d
          if (status === 'completed') {
            return { ...d, status: 'completed', progress: 100, speed: '', eta: '', filePath: file_path }
          }
          if (status === 'error') {
            return { ...d, status: 'error', error: err || 'Unknown error', speed: '', eta: '' }
          }
          if (status === 'cancelled') {
            return { ...d, status: 'cancelled', speed: '', eta: '' }
          }
          if (status === 'merging') {
            return { ...d, status: 'downloading', progress: 99, speed: 'Merging...', eta: '' }
          }
          return { ...d, status: 'downloading', progress, speed, eta, downloadedSize: downloaded_size, totalSize: total_size }
        })
      )
    })

    return () => {
      unlisten.then((fn) => fn())
    }
  }, [])

  const handleURLSubmit = async () => {
    if (!url.trim()) return
    setIsLoading(true)
    setError(null)
    setVideo(null)
    setSelectedFormat(null)
    setSelectedSubtitles([])

    try {
      const info = await invoke<VideoInfoType>('get_video_info', { url: url.trim() })
      setVideo(info)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormatSelect = (format: Format) => {
    setSelectedFormat(format)
  }

  const handleSubtitleToggle = (lang: string) => {
    setSelectedSubtitles((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    )
  }

  const handleDownload = async () => {
    if (!video) return

    let downloadType: DownloadType
    let formatForItem: Format

    if (activeTab === 'video') {
      if (!selectedFormat) return
      downloadType = { type: 'video', format_id: selectedFormat.format_id }
      formatForItem = selectedFormat
    } else if (activeTab === 'audio') {
      downloadType = { type: 'audio', audio_format: audioFormat, audio_quality: audioQuality }
      formatForItem = {
        format_id: 'audio',
        ext: audioFormat,
        resolution: 'audio only',
        filesize: 0,
        quality: audioFormat.toUpperCase(),
        vcodec: 'none',
        acodec: audioFormat,
        bitrate: 0,
      }
    } else {
      if (selectedSubtitles.length === 0) return
      downloadType = { type: 'subtitle', languages: selectedSubtitles, embed: embedSubtitles }
      formatForItem = {
        format_id: 'subtitle',
        ext: 'srt',
        resolution: 'N/A',
        filesize: 0,
        quality: 'Subtitles',
        vcodec: 'none',
        acodec: 'none',
        bitrate: 0,
      }
    }

    downloadCounter.current += 1
    const downloadId = `dl-${Date.now()}-${downloadCounter.current}`

    const item: DownloadItem = {
      id: video.id,
      downloadId,
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration,
      formats: video.formats,
      selectedFormat: formatForItem,
      url: url.trim(),
      downloadType: activeTab,
      status: 'pending',
      progress: 0,
      speed: '',
      eta: '',
    }

    setDownloads((prev) => [...prev, item])
    setVideo(null)
    setSelectedFormat(null)
    setSelectedSubtitles([])
    setUrl('')

    try {
      await invoke('download', {
        url: item.url,
        downloadType,
        outputDir: downloadPath,
        filenameTemplate,
        downloadId,
      })
    } catch (err) {
      setDownloads((prev) =>
        prev.map((d) =>
          d.downloadId === downloadId
            ? { ...d, status: 'error', error: String(err) }
            : d
        )
      )
    }
  }

  const handleCancel = async (downloadId: string) => {
    try {
      await invoke('cancel_download', { downloadId })
    } catch (err) {
      console.error('Cancel failed:', err)
    }
  }

  const handleOpenFile = async (path: string) => {
    try {
      await invoke('open_path', { path })
    } catch (err) {
      console.error('Open failed:', err)
    }
  }

  const handleOpenFolder = async (path: string) => {
    try {
      const folder = path.substring(0, path.lastIndexOf('/'))
      await invoke('open_path', { path: folder || downloadPath })
    } catch (err) {
      console.error('Open folder failed:', err)
    }
  }

  const handleRetry = async (item: DownloadItem) => {
    downloadCounter.current += 1
    const downloadId = `dl-${Date.now()}-${downloadCounter.current}`

    setDownloads((prev) =>
      prev.map((d) =>
        d.id === item.id && d.status === 'error'
          ? { ...d, downloadId, status: 'pending', progress: 0, error: undefined, speed: '', eta: '' }
          : d
      )
    )

    let downloadType: DownloadType
    if (item.downloadType === 'video') {
      downloadType = { type: 'video', format_id: item.selectedFormat.format_id }
    } else if (item.downloadType === 'audio') {
      downloadType = { type: 'audio', audio_format: item.selectedFormat.ext, audio_quality: 0 }
    } else {
      downloadType = { type: 'subtitle', languages: selectedSubtitles, embed: embedSubtitles }
    }

    try {
      await invoke('download', {
        url: item.url,
        downloadType,
        outputDir: downloadPath,
        filenameTemplate,
        downloadId,
      })
    } catch (err) {
      setDownloads((prev) =>
        prev.map((d) =>
          d.downloadId === downloadId
            ? { ...d, status: 'error', error: String(err) }
            : d
        )
      )
    }
  }

  const handleRemove = (downloadId: string) => {
    setDownloads((prev) => prev.filter((d) => d.downloadId !== downloadId))
  }

  const handleClearCompleted = () => {
    setDownloads((prev) => prev.filter((d) => d.status !== 'completed'))
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <span className="icon">▶</span>
          <h1>YT-DLP GUI</h1>
        </div>
        <button className="settings-btn" onClick={() => setShowSettings(true)}>
          ⚙
        </button>
      </header>

      <main className="main">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <URLInput
          url={url}
          onChange={setUrl}
          onSubmit={handleURLSubmit}
          isLoading={isLoading}
        />

        {video && (
          <VideoInfo
            video={video}
            selectedFormat={selectedFormat}
            audioFormat={audioFormat}
            audioQuality={audioQuality}
            selectedSubtitles={selectedSubtitles}
            embedSubtitles={embedSubtitles}
            activeTab={activeTab}
            onFormatSelect={handleFormatSelect}
            onAudioFormatChange={setAudioFormat}
            onAudioQualityChange={setAudioQuality}
            onSubtitleToggle={handleSubtitleToggle}
            onEmbedSubtitlesChange={setEmbedSubtitles}
            onTabChange={setActiveTab}
            onDownload={handleDownload}
          />
        )}

        {downloads.length > 0 && (
          <DownloadList
            downloads={downloads}
            onCancel={handleCancel}
            onOpenFile={handleOpenFile}
            onOpenFolder={handleOpenFolder}
            onRetry={handleRetry}
            onRemove={handleRemove}
            onClearCompleted={handleClearCompleted}
          />
        )}
      </main>

      {showSettings && (
        <Settings
          downloadPath={downloadPath}
          filenameTemplate={filenameTemplate}
          onDownloadPathChange={setDownloadPath}
          onFilenameTemplateChange={setFilenameTemplate}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default App
