import { useState } from 'react'

interface URLInputProps {
  url: string
  onChange: (url: string) => void
  onSubmit: () => void
  isLoading: boolean
}

function URLInput({ url, onChange, onSubmit, isLoading }: URLInputProps) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text)
    } catch (error) {
      console.error('粘贴失败:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onSubmit()
    }
  }

  return (
    <div className="url-input">
      <div className="input-group">
        <input
          type="text"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="粘贴视频 URL..."
          disabled={isLoading}
        />
        <button className="paste-btn" onClick={handlePaste}>
          📋
        </button>
      </div>
      <button 
        className="submit-btn"
        onClick={onSubmit}
        disabled={!url.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            解析中...
          </>
        ) : (
          <>
            🔍 解析视频
          </>
        )}
      </button>
    </div>
  )
}

export default URLInput
