function LoadingSkeleton() {
  return (
    <div className="video-info skeleton-container">
      <div className="video-header">
        <div className="skeleton skeleton-thumbnail" />
        <div className="video-details">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-duration" />
        </div>
      </div>

      <div className="skeleton-tabs">
        <div className="skeleton skeleton-tab" />
        <div className="skeleton skeleton-tab" />
        <div className="skeleton skeleton-tab" />
      </div>

      <div className="skeleton-formats">
        <div className="skeleton skeleton-format-title" />
        <div className="skeleton-format-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton skeleton-format-card" />
          ))}
        </div>
      </div>

      <div className="skeleton skeleton-download-btn" />
    </div>
  )
}

export default LoadingSkeleton
