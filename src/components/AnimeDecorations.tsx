function AnimeDecorations() {
  const petals = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${2 + (i * 4.8) % 96}%`,
    size: 5 + (i % 5) * 2,
    duration: 12 + (i % 7) * 2,
    delay: i * 0.8,
    color: i % 5 === 0 ? '#FFB7C5' : i % 5 === 1 ? '#D4B5FF' : i % 5 === 2 ? '#FFD4E0' : i % 5 === 3 ? '#B5DEFF' : '#E0C3FC',
    rotate: i * 20,
  }))

  const sparkles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${1 + (i * 4.2) % 98}%`,
    top: `${2 + (i * 4.1) % 96}%`,
    size: 2 + (i % 4) * 2,
    duration: 1.2 + (i % 6) * 0.5,
    delay: i * 0.25,
  }))

  const shapes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${3 + (i * 8.5) % 92}%`,
    top: `${5 + (i * 8.8) % 88}%`,
    size: 4 + (i % 4) * 3,
    color: ['#FFB7C5', '#D4B5FF', '#87CEEB', '#FFD4E0', '#E0C3FC', '#B5DEFF', '#FFC8DD', '#A2D2FF', '#CDB4DB', '#FFE5EC', '#F0C6D3', '#B8D4E3'][i],
    duration: 8 + i * 1.2,
    delay: i * 0.9,
    shape: i % 3,
  }))

  // Character gallery data — staggered polaroid cards around the viewport edges
  const characters = [
    {
      src: '/characters/rem.png',
      name: 'Rem',
      size: 'hero',
      style: { top: '4%', left: '3%', transform: 'rotate(-6deg)' },
      glow: '#6BA3FF',
      delay: '0s',
    },
    {
      src: '/characters/inori.png',
      name: 'Inori',
      size: 'large',
      style: { top: '3%', right: '3%', transform: 'rotate(5deg)' },
      glow: '#FF6B9D',
      delay: '0.4s',
    },
    {
      src: '/characters/asuna.jpg',
      name: 'Asuna',
      size: 'medium',
      style: { top: '38%', left: '2%', transform: 'rotate(3deg)' },
      glow: '#FF9E44',
      delay: '0.8s',
    },
    {
      src: '/characters/mikasa.jpg',
      name: 'Mikasa',
      size: 'medium',
      style: { top: '40%', right: '2%', transform: 'rotate(-4deg)' },
      glow: '#7A9B7A',
      delay: '1.0s',
    },
    {
      src: '/characters/emilia.png',
      name: 'Emilia',
      size: 'large',
      style: { bottom: '4%', left: '4%', transform: 'rotate(4deg)' },
      glow: '#C0B8FF',
      delay: '1.2s',
    },
    {
      src: '/characters/hinata.jpg',
      name: 'Hinata',
      size: 'small',
      style: { bottom: '6%', right: '5%', transform: 'rotate(-3deg)' },
      glow: '#B8A0D0',
      delay: '1.5s',
    },
    {
      src: '/characters/ram.jpg',
      name: 'Ram',
      size: 'small',
      style: { bottom: '38%', left: '18%', transform: 'rotate(-5deg)' },
      glow: '#E8879B',
      delay: '1.8s',
    },
  ]

  return (
    <div className="anime-decorations">
      {/* Sakura petals */}
      {petals.map((p) => (
        <div
          key={`petal-${p.id}`}
          className="sakura-petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.3,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}

      {/* Sparkle stars */}
      {sparkles.map((s) => (
        <svg
          key={`sparkle-${s.id}`}
          className="sparkle-star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size * 3,
            height: s.size * 3,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2L13.5 9.5L20 8L14.5 12L20 16L13.5 14.5L12 22L10.5 14.5L4 16L9.5 12L4 8L10.5 9.5L12 2Z"
            fill="rgba(255, 183, 197, 0.6)"
            stroke="rgba(212, 181, 255, 0.4)"
            strokeWidth="0.5"
          />
        </svg>
      ))}

      {/* Decorative geometric shapes */}
      {shapes.map((s) => (
        <div
          key={`shape-${s.id}`}
          className="floating-shape"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: s.shape === 0 ? s.color : 'transparent',
            borderColor: s.color,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            ...(s.shape === 0
              ? { borderRadius: '50%' }
              : s.shape === 1
              ? { transform: 'rotate(45deg)', borderRadius: '2px' }
              : {
                  width: 0,
                  height: 0,
                  background: 'transparent',
                  borderLeft: `${s.size / 2}px solid transparent`,
                  borderRight: `${s.size / 2}px solid transparent`,
                  borderBottom: `${s.size}px solid ${s.color}`,
                }),
          }}
        />
      ))}

      {/* Anime character polaroid gallery */}
      {characters.map((char) => (
        <div
          key={char.name}
          className={`anime-character character-${char.size}`}
          style={{ ...char.style, '--glow-color': char.glow, '--bob-delay': char.delay } as unknown as React.CSSProperties}
        >
          <div className="character-card">
            <div className="character-glow" />
            <img src={char.src} alt={char.name} loading="lazy" />
            <div className="character-name-label">{char.name}</div>
          </div>
        </div>
      ))}

      {/* Anime cat silhouette - bottom right corner */}
      <div className="anime-cat">
        <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="70" rx="28" ry="22" fill="rgba(74, 63, 107, 0.08)" />
          <circle cx="60" cy="42" r="20" fill="rgba(74, 63, 107, 0.08)" />
          <path d="M42 30L36 10L52 24Z" fill="rgba(74, 63, 107, 0.08)" />
          <path d="M78 30L84 10L68 24Z" fill="rgba(74, 63, 107, 0.08)" />
          <path d="M44 28L40 14L50 24Z" fill="rgba(255, 183, 197, 0.15)" />
          <path d="M76 28L80 14L70 24Z" fill="rgba(255, 183, 197, 0.15)" />
          <ellipse cx="52" cy="40" rx="4" ry="4.5" fill="rgba(74, 63, 107, 0.15)" />
          <circle cx="53" cy="39" r="1.5" fill="rgba(255, 255, 255, 0.4)" />
          <ellipse cx="68" cy="40" rx="4" ry="4.5" fill="rgba(74, 63, 107, 0.15)" />
          <circle cx="69" cy="39" r="1.5" fill="rgba(255, 255, 255, 0.4)" />
          <path d="M58 46L60 48L62 46Z" fill="rgba(255, 183, 197, 0.3)" />
          <path d="M55 49Q60 53 65 49" stroke="rgba(74, 63, 107, 0.12)" strokeWidth="1" fill="none" />
          <line x1="30" y1="42" x2="48" y2="44" stroke="rgba(74, 63, 107, 0.1)" strokeWidth="0.8" />
          <line x1="30" y1="47" x2="48" y2="47" stroke="rgba(74, 63, 107, 0.1)" strokeWidth="0.8" />
          <line x1="32" y1="52" x2="48" y2="49" stroke="rgba(74, 63, 107, 0.1)" strokeWidth="0.8" />
          <line x1="90" y1="42" x2="72" y2="44" stroke="rgba(74, 63, 107, 0.1)" strokeWidth="0.8" />
          <line x1="90" y1="47" x2="72" y2="47" stroke="rgba(74, 63, 107, 0.1)" strokeWidth="0.8" />
          <line x1="88" y1="52" x2="72" y2="49" stroke="rgba(74, 63, 107, 0.1)" strokeWidth="0.8" />
          <path d="M88 75Q100 60 95 45Q92 38 98 35" stroke="rgba(74, 63, 107, 0.1)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="45" cy="88" rx="8" ry="5" fill="rgba(74, 63, 107, 0.06)" />
          <ellipse cx="75" cy="88" rx="8" ry="5" fill="rgba(74, 63, 107, 0.06)" />
        </svg>
      </div>
    </div>
  )
}

export default AnimeDecorations
