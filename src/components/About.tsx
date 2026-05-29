interface AboutProps {
  onClose: () => void
}

function About({ onClose }: AboutProps) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>About SakuraFetch</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="about-content">
          <div className="about-logo">
            <span className="about-icon">▶</span>
            <h3>SakuraFetch</h3>
            <span className="about-version">v1.0.0</span>
          </div>

          <p className="about-description">
            A cute anime-style video downloader powered by yt-dlp.
            Download videos, audio, and subtitles from YouTube and 1000+ other sites.
          </p>

          <div className="about-divider" />

          <div className="about-section">
            <h4>Tech Stack</h4>
            <div className="about-tags">
              <span className="about-tag">Tauri v1.5</span>
              <span className="about-tag">React 18</span>
              <span className="about-tag">TypeScript</span>
              <span className="about-tag">Vite</span>
              <span className="about-tag">yt-dlp</span>
            </div>
          </div>

          <div className="about-section">
            <h4>Credits</h4>
            <div className="about-credits">
              <div className="about-credit-row">
                <span className="credit-label">Video engine</span>
                <span className="credit-value">yt-dlp</span>
              </div>
              <div className="about-credit-row">
                <span className="credit-label">UI framework</span>
                <span className="credit-value">Tauri + React</span>
              </div>
              <div className="about-credit-row">
                <span className="credit-label">Font</span>
                <span className="credit-value">Inter by Rasmus Andersson</span>
              </div>
            </div>
          </div>

          <div className="about-divider" />

          <div className="about-footer-links">
            <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noopener noreferrer" className="about-link">
              yt-dlp GitHub
            </a>
            <a href="https://tauri.app" target="_blank" rel="noopener noreferrer" className="about-link">
              Tauri
            </a>
          </div>

          <p className="about-copyright">
            Built with care. Enjoy your downloads!
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
