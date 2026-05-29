import { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import type { VideoInfo, Format, DownloadMode, BatchVideoItem, BatchItemStatus } from '../types'

interface BatchDownloadProps {
  onDownloadAll: (items: BatchVideoItem[], mode: DownloadMode, format: Format | null, audioFormat: string, audioQuality: number) => void
  onClose: () => void
  isLoading: boolean
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function BatchDownload({ onDownloadAll, onClose, isLoading }: BatchDownloadProps) {
  const [urlText, setUrlText] = useState('')
  const [items, setItems] = useState<BatchVideoItem[]>([])
  const [parsingAll, setParsingAll] = useState(false)
  const [activeTab, setActiveTab] = useState<DownloadMode>('video')
  const [globalFormat, setGlobalFormat] = useState<Format | null>(null)
  const [audioFormat, setAudioFormat] = useState('mp3')
  const [audioQuality, setAudioQuality] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const parseUrls = async () => {
    const urls = urlText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'))

    if (urls.length === 0) return

    const newItems: BatchVideoItem[] = urls.map((url) => ({
      url,
      video: null,
      selectedFormat: null,
      status: 'pending' as BatchItemStatus,
      progress: 0,
    }))

    setItems(newItems)
    setParsingAll(true)
    setError(null)

    for (let i = 0; i < newItems.length; i++) {
      setItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'parsing' as BatchItemStatus } : item))
      )

      try {
        const info = await invoke<VideoInfo>('get_video_info', { url: newItems[i].url })
        setItems((prev) =>
          prev.map((item, idx) => {
            if (idx !== i) return item
            const bestFormat = info.formats.length > 0 ? info.formats[0] : null
            return { ...item, video: info, selectedFormat: bestFormat, status: 'ready' as BatchItemStatus }
          })
        )
      } catch (err) {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'error' as BatchItemStatus, error: String(err) } : item
          )
        )
      }
    }

    setParsingAll(false)
  }

  const updateItemFormat = (index: number, format: Format) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, selectedFormat: format } : item))
    )
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const retryItem = async (index: number) => {
    const item = items[index]
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, status: 'parsing' as BatchItemStatus, error: undefined } : it))
    )

    try {
      const info = await invoke<VideoInfo>('get_video_info', { url: item.url })
      setItems((prev) =>
        prev.map((it, idx) => {
          if (idx !== index) return it
          const bestFormat = info.formats.length > 0 ? info.formats[0] : null
          return { ...it, video: info, selectedFormat: bestFormat, status: 'ready' as BatchItemStatus }
        })
      )
    } catch (err) {
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === index ? { ...it, status: 'error' as BatchItemStatus, error: String(err) } : it
        )
      )
    }
  }

  const readyItems = items.filter((i) => i.status === 'ready')
  const handleDownloadAll = () => {
    const readyItems = items.filter((i) => i.status === 'ready')
    if (readyItems.length === 0) return
    onDownloadAll(readyItems, activeTab, globalFormat, audioFormat, audioQuality)
  }

  const allFormats = readyItems
    .flatMap((i) => i.video?.formats ?? [])
    .filter((f, idx, arr) => arr.findIndex((x) => x.format_id === f.format_id) === idx)
    .sort((a, b) => {
      const aRes = parseInt(a.resolution.split('x').pop() || '0')
      const bRes = parseInt(b.resolution.split('x').pop() || '0')
      return bRes - aRes
    })

  return (
    <div className="batch-download">
      <div className="batch-header">
        <h3>批量下载</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {items.length === 0 ? (
        <div className="batch-input-area">
          <textarea
            className="batch-textarea"
            placeholder={'粘贴视频链接，每行一个\n\nhttps://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=...'}
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            rows={10}
          />
          <button
            className="submit-btn"
            onClick={parseUrls}
            disabled={parsingAll || !urlText.trim()}
          >
            {parsingAll ? (
              <>
                <span className="spinner" /> 解析中...
              </>
            ) : (
              '解析全部'
            )}
          </button>
        </div>
      ) : (
        <div className="batch-content">
          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ${activeTab === 'video' ? 'active' : ''}`} onClick={() => setActiveTab('video')}>
              视频
            </button>
            <button className={`tab ${activeTab === 'audio' ? 'active' : ''}`} onClick={() => setActiveTab('audio')}>
              音频
            </button>
            <button className={`tab ${activeTab === 'subtitle' ? 'active' : ''}`} onClick={() => setActiveTab('subtitle')}>
              字幕
            </button>
          </div>

          {/* Global format selection for video tab */}
          {activeTab === 'video' && allFormats.length > 0 && (
            <div className="batch-global-format">
              <label>统一画质</label>
              <div className="format-list">
                {allFormats.slice(0, 6).map((f) => (
                  <div
                    key={f.format_id}
                    className={`format-item ${globalFormat?.format_id === f.format_id ? 'selected' : ''}`}
                    onClick={() => setGlobalFormat(f)}
                  >
                    <span className="format-quality">{f.quality}</span>
                    <span className="format-resolution">{f.resolution}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="batch-global-format">
              <label>音频格式</label>
              <div className="audio-format-list">
                {['mp3', 'm4a', 'wav', 'flac'].map((fmt) => (
                  <button
                    key={fmt}
                    className={`format-chip ${audioFormat === fmt ? 'selected' : ''}`}
                    onClick={() => setAudioFormat(fmt)}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="option-group" style={{ marginTop: '12px' }}>
                <label>音频质量</label>
                <input
                  type="range"
                  className="quality-slider"
                  min={0}
                  max={9}
                  value={audioQuality}
                  onChange={(e) => setAudioQuality(Number(e.target.value))}
                />
                <div className="slider-labels">
                  <span>低质量</span>
                  <span>高质量</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {/* Video list */}
          <div className="batch-items">
            {items.map((item, idx) => (
              <div key={idx} className={`batch-item batch-item-${item.status}`}>
                <div className="batch-item-main">
                  <div className="batch-item-info">
                    {item.video ? (
                      <>
                        {item.video.thumbnail && (
                          <div className="batch-item-thumb">
                            <img src={item.video.thumbnail} alt="" />
                          </div>
                        )}
                        <div className="batch-item-details">
                          <span className="batch-item-title">{item.video.title}</span>
                          <span className="batch-item-meta">
                            {item.video.duration > 0 && formatDuration(item.video.duration)}
                            {' '}
                            <span className="batch-item-url">{item.url}</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="batch-item-details">
                        <span className="batch-item-url-full">{item.url}</span>
                      </div>
                    )}
                  </div>

                  <div className="batch-item-actions">
                    {item.status === 'parsing' && (
                      <span className="batch-status parsing">
                        <span className="spinner small" /> 解析中
                      </span>
                    )}
                    {item.status === 'error' && (
                      <>
                        <span className="batch-status error" title={item.error}>失败</span>
                        <button className="action-btn retry" onClick={() => retryItem(idx)}>重试</button>
                      </>
                    )}
                    {item.status === 'pending' && (
                      <span className="batch-status pending">等待中</span>
                    )}
                    {item.status === 'ready' && item.video && activeTab === 'video' && (
                      <select
                        className="batch-format-select"
                        value={item.selectedFormat?.format_id || ''}
                        onChange={(e) => {
                          const fmt = item.video?.formats.find((f) => f.format_id === e.target.value)
                          if (fmt) updateItemFormat(idx, fmt)
                        }}
                      >
                        {item.video.formats.map((f) => (
                          <option key={f.format_id} value={f.format_id}>
                            {f.quality} ({f.resolution})
                          </option>
                        ))}
                      </select>
                    )}
                    {(item.status === 'ready' || item.status === 'error') && (
                      <button className="action-btn remove" onClick={() => removeItem(idx)}>✕</button>
                    )}
                  </div>
                </div>

                {item.status === 'error' && item.error && (
                  <div className="batch-item-error">{item.error}</div>
                )}
              </div>
            ))}
          </div>

          {/* Summary and download button */}
          <div className="batch-footer">
            <div className="batch-summary">
              共 {items.length} 个链接，{readyItems.length} 个就绪
              {items.filter((i) => i.status === 'error').length > 0 &&
                `，${items.filter((i) => i.status === 'error').length} 个失败`}
            </div>
            <div className="batch-footer-actions">
              <button
                className="submit-btn"
                onClick={() => {
                  setItems([])
                  setUrlText('')
                  setGlobalFormat(null)
                }}
              >
                重新输入
              </button>
              <button
                className="download-btn"
                onClick={handleDownloadAll}
                disabled={readyItems.length === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" /> 下载中...
                  </>
                ) : (
                  `全部下载 (${readyItems.length})`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
