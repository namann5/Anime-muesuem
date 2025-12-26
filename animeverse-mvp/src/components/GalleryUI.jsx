import React from 'react'
import '../styles/gallery.css'

export default function GalleryUI({
  onFileLoad,
  clips = [],
  playing = false,
  onPlayPause,
  onSelectClip,
  onPresetChange,
  onBackgroundToggle,
  envBackground = false,
  characters = [],
  onSelectCharacter,
  onAddCharacter,
  isAdmin = false,
  onLogout
}) {
  const handleBgToggle = () => onBackgroundToggle && onBackgroundToggle(!envBackground)

  return (
    <div className="gallery-ui-overlay" role="toolbar" aria-label="Gallery controls">
      {/* Character Library Selector */}
      <div style={{ marginRight: 12 }}>
        <select
          onChange={(e) => {
            const char = characters.find(c => c.id === e.target.value);
            if (char && onSelectCharacter) onSelectCharacter(char);
          }}
          defaultValue=""
          style={{ padding: '4px 8px', borderRadius: 4, background: '#2a2a2a', color: 'white', border: '1px solid #444' }}
        >
          <option value="" disabled>Select Character</option>
          {characters.map(char => (
            <option key={char.id} value={char.id}>{char.name}</option>
          ))}
        </select>
      </div>

      {/* Add Character / Admin Login Button */}
      {onAddCharacter && (
        <button
          className="btn"
          onClick={onAddCharacter}
          title={isAdmin ? "Upload new character" : "Admin login required"}
          style={{
            background: isAdmin ? 'linear-gradient(90deg, #ff6ea6, #ff9acb)' : 'rgba(255, 110, 166, 0.2)',
            border: isAdmin ? 'none' : '1px solid rgba(255, 110, 166, 0.5)'
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 16, height: 16, marginRight: 6 }}>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {isAdmin ? 'Add Character' : 'Admin Login'}
        </button>
      )}

      {/* Admin Badge & Logout */}
      {isAdmin && onLogout && (
        <button
          className="btn"
          onClick={onLogout}
          title="Logout from admin mode"
          style={{ background: 'rgba(255, 0, 0, 0.2)', border: '1px solid rgba(255, 0, 0, 0.5)' }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 16, height: 16, marginRight: 6 }}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          Logout
        </button>
      )}

      <label className="file-label" aria-hidden="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 9l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Load File
        <input
          type="file"
          accept=".glb,.gltf"
          onChange={e => onFileLoad(e.target.files[0])}
        />
      </label>

      <button className="btn" onClick={onPlayPause} aria-pressed={playing}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M5 3v18l15-9z" />}
        </svg>
        {playing ? 'Pause' : 'Play'}
      </button>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: '#9aa0a6', marginRight: 6 }}>Clips:</span>
        <select aria-label="Animation clips" onChange={e => onSelectClip(parseInt(e.target.value, 10))}>
          <option value={-1}>Auto</option>
          {clips.map((c, i) => (
            <option value={i} key={c.name || i}>{c.name || `clip ${i}`}</option>
          ))}
        </select>
      </div>

      <div className="preset-group" style={{ marginLeft: 12 }}>
        <button className="btn" onClick={() => onPresetChange && onPresetChange('studio')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" /></svg>
          Studio
        </button>
        <button className="btn" onClick={() => onPresetChange && onPresetChange('city')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" /></svg>
          City
        </button>
        <button className="btn" onClick={() => onPresetChange && onPresetChange('none')}>
          None
        </button>
        <button className="btn" onClick={handleBgToggle} aria-pressed={envBackground} title="Toggle environment background">
          {envBackground ? 'BG On' : 'BG Off'}
        </button>
      </div>
    </div>
  )
}
