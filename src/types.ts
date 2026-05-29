export interface Format {
  format_id: string
  ext: string
  resolution: string
  filesize: number
  quality: string
  vcodec: string
  acodec: string
  bitrate: number
}

export interface SubtitleInfo {
  lang: string
  name: string
}

export interface VideoInfo {
  id: string
  title: string
  thumbnail: string
  duration: number
  formats: Format[]
  audio_formats: Format[]
  subtitles: SubtitleInfo[]
}

export type DownloadType =
  | { type: 'video'; format_id: string }
  | { type: 'audio'; audio_format: string; audio_quality: number }
  | { type: 'subtitle'; languages: string[]; embed: boolean }

export type DownloadMode = 'video' | 'audio' | 'subtitle'

export interface DownloadItem {
  id: string
  downloadId: string
  title: string
  thumbnail: string
  duration: number
  formats: Format[]
  selectedFormat: Format
  url: string
  downloadType: DownloadMode
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'cancelled'
  progress: number
  speed: string
  eta: string
  filePath?: string
  error?: string
  downloadedSize?: string
  totalSize?: string
}

export interface DownloadProgressEvent {
  download_id: string
  progress: number
  speed: string
  eta: string
  status: string
  error?: string
  file_path?: string
  downloaded_size?: string
  total_size?: string
}

export interface HistoryItem {
  id: string
  title: string
  thumbnail: string
  url: string
  downloadType: DownloadMode
  format: Format
  filePath?: string
  completedAt: number
}

export type BatchItemStatus = 'pending' | 'parsing' | 'ready' | 'downloading' | 'completed' | 'error'

export interface BatchVideoItem {
  url: string
  video: VideoInfo | null
  selectedFormat: Format | null
  status: BatchItemStatus
  error?: string
  progress: number
  downloadId?: string
}
