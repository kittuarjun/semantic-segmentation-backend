import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #020617 0%, #0c1a2e 50%, #020617 100%)',
    padding: '2rem',
    fontFamily: "'Inter', system-ui, sans-serif",
    color: 'white',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: '900',
    background: 'linear-gradient(90deg, #38bdf8, #34d399)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 1rem 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.1rem',
    maxWidth: '500px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.5rem',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    margin: 0,
  },
  badge: (color) => ({
    padding: '0.25rem 0.6rem',
    borderRadius: '0.5rem',
    background: `${color}22`,
    color: color,
    fontSize: '0.85rem',
    fontWeight: '700',
  }),
  dropZone: (hasFile) => ({
    border: `2px dashed ${hasFile ? '#38bdf8' : '#334155'}`,
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: hasFile ? 'rgba(56,189,248,0.05)' : 'transparent',
  }),
  preview: {
    maxHeight: '200px',
    borderRadius: '0.75rem',
    marginBottom: '0.75rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
  dropText: {
    color: '#64748b',
    fontSize: '0.95rem',
    margin: '0.5rem 0 0 0',
  },
  button: (disabled) => ({
    width: '100%',
    padding: '1rem',
    borderRadius: '0.875rem',
    border: 'none',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled
      ? '#1e293b'
      : 'linear-gradient(90deg, #0284c7, #0ea5e9)',
    color: disabled ? '#475569' : 'white',
    transition: 'all 0.2s',
    boxShadow: disabled ? 'none' : '0 4px 20px rgba(14,165,233,0.3)',
  }),
  error: {
    padding: '0.875rem',
    borderRadius: '0.75rem',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#f87171',
    fontSize: '0.9rem',
  },
  resultBox: {
    flex: 1,
    minHeight: '280px',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '1rem',
    background: 'rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  resultImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  emptyIcon: {
    textAlign: 'center',
  },
  emptyText: {
    color: '#475569',
    marginTop: '0.75rem',
    fontSize: '0.9rem',
  },
  downloadBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    background: '#1e293b',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'background 0.2s',
  },
  footer: {
    textAlign: 'center',
    marginTop: '3rem',
    color: '#334155',
    fontSize: '0.85rem',
  },
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResultUrl(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', selectedFile)
    try {
      const response = await fetch(`${API_URL}/predict`, { method: 'POST', body: formData })
      if (!response.ok) throw new Error(`Server error: ${response.status}`)
      const blob = await response.blob()
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Semantic Segmentation</h1>
          <p style={styles.subtitle}>
            Upload an image to identify and segment objects using our DINOv2-powered AI engine.
          </p>
        </header>

        <div style={styles.grid}>
          {/* Upload Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={styles.badge('#38bdf8')}>01</span>
              Upload Image
            </h2>

            <label htmlFor="file-upload" style={styles.dropZone(!!previewUrl)}>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" style={styles.preview} />
                  <p style={styles.dropText}>Click to change image</p>
                </>
              ) : (
                <>
                  <svg width="48" height="48" fill="none" stroke="#475569" viewBox="0 0 24 24" style={{ margin: '0 auto 0.75rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p style={styles.dropText}>Click to upload an image</p>
                  <p style={{ ...styles.dropText, fontSize: '0.8rem', marginTop: '0.25rem' }}>JPG, PNG, WEBP supported</p>
                </>
              )}
            </label>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              style={styles.button(!selectedFile || loading)}
            >
              {loading ? '⏳ Processing...' : '▶ Run Segmentation'}
            </button>

            {error && <div style={styles.error}>⚠️ {error}</div>}
          </div>

          {/* Result Card */}
          <div style={{ ...styles.card, minHeight: '480px' }}>
            <h2 style={styles.cardTitle}>
              <span style={styles.badge('#34d399')}>02</span>
              Segmentation Result
            </h2>

            <div style={styles.resultBox}>
              {resultUrl ? (
                <img src={resultUrl} alt="Segmentation result" style={styles.resultImg} />
              ) : (
                <div style={styles.emptyIcon}>
                  <svg width="48" height="48" fill="none" stroke="#334155" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p style={styles.emptyText}>Result appears here</p>
                </div>
              )}
            </div>

            {resultUrl && (
              <a href={resultUrl} download="segmented.png" style={styles.downloadBtn}>
                ⬇ Download Result
              </a>
            )}
          </div>
        </div>

        <footer style={styles.footer}>
          <p>Semantic Segmentation · Hackathon 2026</p>
        </footer>
      </div>
    </div>
  )
}
