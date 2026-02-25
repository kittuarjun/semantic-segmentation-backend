import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Segmentation failed');

      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 selection:bg-primary-500/30">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">
            Semantic Segmentation
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Upload an image to identify objects using our advanced DINOv2-powered segmentation engine.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Upload Section */}
          <section className="glass rounded-3xl p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary-500/20 text-primary-400">01</span>
              Upload Image
            </h2>

            <div
              className={`border-2 border-dashed rounded-2xl p-8 transition-all text-center ${previewUrl ? 'border-primary-500/50 bg-primary-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-white/5'
                }`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-2xl mb-4" />
                ) : (
                  <div className="py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-400">Click or drag image to upload</p>
                  </div>
                )}
                <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG, WEBP</p>
              </label>
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${!selectedFile || loading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : 'Run Segmentation'}
            </button>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                Error: {error}
              </div>
            )}
          </section>

          {/* Result Section */}
          <section className="glass rounded-3xl p-8 flex flex-col gap-6 min-h-[500px]">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">02</span>
              Segmentation Result
            </h2>

            <div className="flex-1 flex items-center justify-center border border-slate-700/50 rounded-2xl bg-black/20 overflow-hidden min-h-[300px]">
              {resultUrl ? (
                <img src={resultUrl} alt="Result" className="w-full h-full object-contain shadow-2xl animate-in fade-in zoom-in duration-500" />
              ) : (
                <div className="text-center p-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 max-w-[200px] mx-auto">Result will appear here after processing</p>
                </div>
              )}
            </div>

            {resultUrl && (
              <div className="flex gap-4">
                <a
                  href={resultUrl}
                  download="segmented-image.png"
                  className="flex-1 text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
                >
                  Download Result
                </a>
              </div>
            )}
          </section>
        </main>

        <footer className="mt-16 text-center text-slate-500 text-sm">
          <p>© 2026 Semantic Segmentation Hack Edition</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
