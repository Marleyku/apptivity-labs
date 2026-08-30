import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { domToJpeg } from 'modern-screenshot';
import { useFeedback } from '../context/FeedbackContext.jsx';

const CATEGORIES = [
  { id: 'bug', label: 'Bug' },
  { id: 'idea', label: 'Idea' },
  { id: 'praise', label: 'Praise' },
  { id: 'general', label: 'General' },
];

const TOOLS = [
  { id: 'pen', label: 'Pen' },
  { id: 'highlight', label: 'Highlight' },
  { id: 'eraser', label: 'Eraser' },
];

const ZOOM_MIN = 0.75;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;

function screenshotFilter(node) {
  if (!(node instanceof Element)) return true;
  if (node.getAttribute?.('data-feedback-mask') != null) return false;
  if (node.closest?.('[data-feedback-widget]')) return false;
  return true;
}

/** @param {'visible' | 'full'} mode */
async function captureScreenshot(mode) {
  const root = document.getElementById('root') || document.body;
  const scale = Math.min(1, 1280 / Math.max(window.innerWidth, 1));
  try {
    if (mode === 'visible') {
      const w = Math.max(1, Math.round(window.innerWidth));
      const h = Math.max(1, Math.round(window.innerHeight));
      const sx = window.scrollX || window.pageXOffset || 0;
      const sy = window.scrollY || window.pageYOffset || 0;
      return await domToJpeg(document.documentElement, {
        quality: 0.72,
        scale,
        width: w,
        height: h,
        filter: screenshotFilter,
        style: {
          transform: `translate(${-sx}px, ${-sy}px)`,
          transformOrigin: 'top left',
        },
      });
    }
    return await domToJpeg(root, {
      quality: 0.72,
      scale,
      filter: screenshotFilter,
    });
  } catch (err) {
    console.warn('[feedback] screenshot failed', err);
    return null;
  }
}

export function FeedbackModal() {
  const { open, closeFeedback } = useFeedback();
  const location = useLocation();
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPt = useRef(null);

  const [category, setCategory] = useState('bug');
  const [message, setMessage] = useState('');
  const [tool, setTool] = useState('pen');
  const [captureMode, setCaptureMode] = useState(null);
  const [baseImage, setBaseImage] = useState(null);
  const [viewZoom, setViewZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [reference, setReference] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    setSent(false);
    setReference(null);
    setError('');
    setMessage('');
    setCategory('bug');
    setTool('pen');
    setBaseImage(null);
    setCaptureMode(null);
    setViewZoom(1);
    setCapturing(false);
    setBusy(false);
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open || !captureMode) return undefined;
    if (captureMode === 'none') {
      setBaseImage(null);
      setCapturing(false);
      setViewZoom(1);
      return undefined;
    }
    let cancelled = false;
    setCapturing(true);
    setBaseImage(null);
    setViewZoom(1);
    setError('');

    (async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const dataUrl = await captureScreenshot(captureMode);
      if (cancelled) return;
      setBaseImage(dataUrl);
      setCapturing(false);
      if (!dataUrl) setError('Screenshot unavailable — you can still send a message.');
    })();

    return () => {
      cancelled = true;
    };
  }, [open, captureMode]);

  useEffect(() => {
    if (!open || !baseImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const maxW = Math.min(img.width, 900);
      const scale = maxW / img.width;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = baseImage;
  }, [open, baseImage]);

  function pointerPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawingRef.current = true;
    lastPt.current = pointerPos(e);
  }

  function moveDraw(e) {
    if (!drawingRef.current || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pt = pointerPos(e);
    const prev = lastPt.current || pt;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pt.x, pt.y);
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 18;
    } else if (tool === 'highlight') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255, 214, 10, 0.45)';
      ctx.lineWidth = 14;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 3;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    lastPt.current = pt;
  }

  function endDraw() {
    drawingRef.current = false;
    lastPt.current = null;
  }

  function clearMarkup() {
    if (!baseImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = baseImage;
  }

  function bumpZoom(delta) {
    setViewZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 100) / 100)));
  }

  async function submit() {
    setError('');
    if (category === 'bug' && !message.trim()) {
      setError('Please describe the bug.');
      return;
    }
    if (!message.trim() && !canvasRef.current && !baseImage) {
      setError('Add a message or wait for the screenshot.');
      return;
    }
    setBusy(true);
    try {
      let screenshotDataUrl = null;
      if (canvasRef.current && canvasRef.current.width > 0) {
        screenshotDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.75);
      } else if (baseImage) {
        screenshotDataUrl = baseImage;
      }
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          screenshotDataUrl,
          route: `${location.pathname}${location.search || ''}`,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          site: 'apptivity.online',
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || `Could not send feedback (${res.status})`);
      }
      setReference(result?.reference || result?.linearIdentifier || result?.id || null);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send feedback.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const choosingCapture = !captureMode;

  return (
    <div
      data-feedback-widget
      className="feedback-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
      onClick={closeFeedback}
    >
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <div>
            <h2 id="feedback-title">Send feedback</h2>
            <p className="feedback-muted">
              {choosingCapture
                ? 'Choose what to capture, then mark it up.'
                : 'Mark up the screenshot, then tell us what to know.'}
            </p>
          </div>
          <button type="button" className="feedback-text-btn" onClick={closeFeedback}>
            Close
          </button>
        </div>

        {sent ? (
          <div className="feedback-success">
            <p className="feedback-success-title">Thanks — we got it.</p>
            {reference && (
              <div className="feedback-reference">
                <p className="feedback-muted">Your reference</p>
                <p className="feedback-reference-id">{reference}</p>
                <p className="feedback-muted">Keep this if you follow up about this report.</p>
              </div>
            )}
            <button type="button" className="feedback-primary" onClick={closeFeedback}>
              Done
            </button>
          </div>
        ) : choosingCapture ? (
          <div className="feedback-stack">
            <p className="feedback-muted">Screenshot scope</p>
            <button type="button" className="feedback-primary" onClick={() => setCaptureMode('visible')}>
              Visible screen
            </button>
            <button type="button" className="feedback-secondary" onClick={() => setCaptureMode('full')}>
              Entire page
            </button>
            <button type="button" className="feedback-text-btn" onClick={() => setCaptureMode('none')}>
              Continue without screenshot
            </button>
            <p className="feedback-muted small">
              Visible screen = what you see now. Entire page = full scrollable content.
            </p>
          </div>
        ) : (
          <div className="feedback-stack">
            <div className="feedback-chips">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={category === c.id ? 'feedback-chip is-active' : 'feedback-chip'}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="feedback-row">
              <p className="feedback-muted small">
                Capture:{' '}
                {captureMode === 'full'
                  ? 'Entire page'
                  : captureMode === 'none'
                    ? 'None'
                    : 'Visible screen'}
              </p>
              <button
                type="button"
                className="feedback-text-btn"
                onClick={() => {
                  setCaptureMode(null);
                  setBaseImage(null);
                  setError('');
                }}
                disabled={capturing || busy}
              >
                Change capture
              </button>
            </div>

            <div className="feedback-canvas-wrap">
              {capturing && <p className="feedback-muted center">Capturing screen…</p>}
              {!capturing && !baseImage && (
                <p className="feedback-muted center">No screenshot — you can still send a message.</p>
              )}
              {baseImage && (
                <div className="feedback-canvas-scroll">
                  <canvas
                    ref={canvasRef}
                    className="feedback-canvas"
                    style={{ width: `${viewZoom * 100}%`, height: 'auto' }}
                    onMouseDown={startDraw}
                    onMouseMove={moveDraw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={moveDraw}
                    onTouchEnd={endDraw}
                  />
                </div>
              )}
            </div>

            {baseImage && (
              <div className="feedback-tools">
                {TOOLS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={tool === t.id ? 'feedback-chip is-active' : 'feedback-chip'}
                    onClick={() => setTool(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
                <button type="button" className="feedback-text-btn" onClick={clearMarkup}>
                  Clear marks
                </button>
                <div className="feedback-zoom">
                  <button
                    type="button"
                    className="feedback-zoom-btn"
                    aria-label="Zoom out"
                    disabled={viewZoom <= ZOOM_MIN}
                    onClick={() => bumpZoom(-ZOOM_STEP)}
                  >
                    −
                  </button>
                  <span>{Math.round(viewZoom * 100)}%</span>
                  <button
                    type="button"
                    className="feedback-zoom-btn"
                    aria-label="Zoom in"
                    disabled={viewZoom >= ZOOM_MAX}
                    onClick={() => bumpZoom(ZOOM_STEP)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <label className="feedback-label">
              <span className="feedback-muted">
                Message{category === 'bug' ? ' (required)' : ' (optional)'}
              </span>
              <textarea
                data-feedback-mask
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={4000}
                placeholder={
                  category === 'bug'
                    ? 'What went wrong? What did you expect?'
                    : 'What should we know?'
                }
              />
            </label>

            {error && <p className="feedback-error">{error}</p>}

            <button
              type="button"
              className="feedback-primary"
              disabled={busy || capturing || (category === 'bug' && !message.trim())}
              onClick={() => void submit()}
            >
              {busy ? 'Sending…' : 'Send feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
