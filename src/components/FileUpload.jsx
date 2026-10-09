import { useEffect, useRef, useState } from 'react';
import { ACCEPT_ATTR } from '../utils/fileTypes';
import { formatBytes, truncateMiddle } from '../utils/format';
import './FileUpload.css';

function hasFiles(e) {
  return Array.from(e.dataTransfer?.types || []).includes('Files');
}

/** Drag-and-drop zone. Renders idle / dragging / loading / error states. */
export function Dropzone({ upload }) {
  const [dragging, setDragging] = useState(false);
  const { status, error, loadingName, accept, loadSample } = upload;
  const loading = status === 'loading';

  // If a file is dropped slightly outside the zone, don't let the browser navigate to it.
  useEffect(() => {
    const stop = (e) => hasFiles(e) && e.preventDefault();
    window.addEventListener('dragover', stop);
    window.addEventListener('drop', stop);
    return () => {
      window.removeEventListener('dragover', stop);
      window.removeEventListener('drop', stop);
    };
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="drop-wrap">
      <label
        className={`drop ${dragging ? 'is-dragging' : ''} ${loading ? 'is-loading' : ''} ${error ? 'has-error' : ''}`}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
        onDrop={onDrop}
      >
        <input
          id="file-input"
          className="sr-only"
          type="file"
          accept={ACCEPT_ATTR}
          disabled={loading}
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        {loading ? (
          <div className="drop__body" role="status">
            <div className="drop__layers" aria-hidden="true">
              {Array.from({ length: 9 }, (_, i) => (
                <i key={i} style={{ animationDelay: `${i * 90}ms` }} />
              ))}
            </div>
            <p className="drop__title">Reading your file…</p>
            <p className="drop__name">{truncateMiddle(loadingName, 30)}</p>
          </div>
        ) : (
          <div className="drop__body">
            <svg className="drop__icon" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M24 33V10M14 20l10-10 10 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 34v4a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2v-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="drop__title display">{dragging ? 'Let go to upload' : 'Drop your 3D file here'}</p>
            <p className="drop__or">or</p>
            <span className="drop__browse">Browse files</span>
            <p className="drop__formats">STL · 3MF · OBJ · STEP</p>
          </div>
        )}
      </label>

      {error && (
        <p className="drop__error" role="alert">
          <strong>{error.title}</strong> {error.hint}
        </p>
      )}

      {!loading && (
        <p className="drop__sample">
          No file handy?{' '}
          <button type="button" className="link-btn" onClick={loadSample}>
            Try a sample
          </button>
        </p>
      )}
    </div>
  );
}

/** Shown after a file is ready: name, size, replace and remove. */
export function FileChip({ upload }) {
  const { file, error, accept, remove } = upload;
  const inputRef = useRef(null);
  return (
    <div className="chip-wrap">
      <div className="chip">
        <span className="chip__tick" aria-hidden="true">✓</span>
        <div className="chip__text">
          <p className="chip__name" title={file.name}>{truncateMiddle(file.name, 32)}</p>
          <p className="chip__meta">
            {formatBytes(file.size)} · {file.ext.toUpperCase()} · ready, still on your device
          </p>
        </div>
        <div className="chip__actions">
          <button type="button" className="link-btn" onClick={() => inputRef.current?.click()}>
            Replace
          </button>
          <button type="button" className="link-btn" onClick={remove}>
            Remove
          </button>
        </div>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept={ACCEPT_ATTR}
          tabIndex={-1}
          aria-label="Replace file"
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {error && (
        <p className="drop__error" role="alert">
          <strong>{error.title}</strong> {error.hint}
        </p>
      )}
    </div>
  );
}
