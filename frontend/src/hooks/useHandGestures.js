import { useRef, useCallback, useState } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────────
const STABILISER_FRAMES  = 5;     // consecutive frames before a gesture is accepted
const SCROLL_SPEED_MAX   = 20;    // px per tick at screen edge
const SCROLL_DEAD_ZONE   = 0.12;  // normalised — band around Y=0.5 with no scroll
const SCROLL_TICK_MS     = 16;    // ~60 fps
const LEFT_EDGE_X        = 0.15;  // normalised X — anything below this is "left edge"
const LEFT_EDGE_COOLDOWN = 2000;  // ms before left-edge fires again
const PINCH_THRESHOLD    = 0.055; // normalised distance between thumb+index tips
const PINCH_COOLDOWN     = 600;   // ms between clicks
const DWELL_MS           = 1400;  // ms hold-still to fire dwell click
const DWELL_RADIUS       = 0.035; // normalised — movement beyond this resets dwell
// ─────────────────────────────────────────────────────────────────────────────

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.crossOrigin = 'anonymous';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function loadMediaPipe() {
  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
  return { Hands: globalThis.Hands, Camera: globalThis.Camera };
}

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

const GESTURE_COLORS = {
  open:  '#00E5FF',
  point: '#A78BFA',
  pinch: '#FF4D4D',
  fist:  '#FFA500',
  none:  '#ffffff',
};

function drawHand(canvas, lm, gesture, dwellProgress) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;
  const px = lx => (1 - lx) * W;
  const py = ly => ly * H;
  const col = GESTURE_COLORS[gesture] ?? '#ffffff';

  // skeleton
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.globalAlpha = 0.8;
  for (const [a, b] of CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(px(lm[a].x), py(lm[a].y));
    ctx.lineTo(px(lm[b].x), py(lm[b].y));
    ctx.stroke();
  }

  // joints
  ctx.globalAlpha = 1;
  for (let i = 0; i < 21; i++) {
    const tip = [4,8,12,16,20].includes(i);
    ctx.beginPath();
    ctx.arc(px(lm[i].x), py(lm[i].y), tip ? 6 : 3, 0, Math.PI * 2);
    ctx.fillStyle = tip ? col : '#fff';
    ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // pinch crosshair
  if (gesture === 'pinch') {
    const mx = px((lm[4].x + lm[8].x) / 2);
    const my = py((lm[4].y + lm[8].y) / 2);
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(mx-10, my); ctx.lineTo(mx+10, my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, my-10); ctx.lineTo(mx, my+10); ctx.stroke();
    ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI*2);
    ctx.globalAlpha = 0.35; ctx.stroke();
  }

  // dwell ring
  if (gesture === 'point' && dwellProgress > 0) {
    const fx = px(lm[8].x), fy = py(lm[8].y);
    ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(fx, fy, 20, -Math.PI/2, -Math.PI/2 + dwellProgress * Math.PI * 2);
    ctx.stroke();
  }

  // scroll arrow
  if (gesture === 'point') {
    const off = lm[8].y - 0.5;
    if (Math.abs(off) > SCROLL_DEAD_ZONE) {
      const fx = px(lm[8].x), fy = py(lm[8].y);
      const d = off > 0 ? 1 : -1;
      ctx.globalAlpha = 0.8; ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(fx, fy + d*26); ctx.lineTo(fx, fy + d*42); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fx-6, fy + d*42 - d*8);
      ctx.lineTo(fx,   fy + d*42);
      ctx.lineTo(fx+6, fy + d*42 - d*8);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}

// ─── Gesture detection ────────────────────────────────────────────────────────
function detectRaw(lm) {
  const d = (a, b) => Math.hypot(a.x-b.x, a.y-b.y);

  // pinch: thumb tip (4) close to index tip (8)
  if (d(lm[4], lm[8]) < PINCH_THRESHOLD) return 'pinch';

  // count extended fingers (tips vs knuckles vs wrist distance)
  const tips  = [8, 12, 16, 20];
  const bases = [5,  9, 13, 17];
  const ext   = tips.filter((t, i) =>
    d(lm[t], lm[0]) > d(lm[bases[i]], lm[0]) * 1.2
  ).length;

  if (ext === 0) return 'fist';
  if (ext === 1) return 'point';   // only index extended
  return 'open';                   // 2+ fingers = open
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useHandGestures(scrollRef, onClickAt, _options = {}, onLeftEdge) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);

  // stabiliser
  const pendingRef = useRef({ gesture: 'none', count: 0 });
  const lockedRef  = useRef('none');   // last confirmed stable gesture

  // scroll
  const scrollTimer = useRef(null);
  const scrollSpeed = useRef(0);

  // pinch
  const pinchActive   = useRef(false);
  const pinchCooldown = useRef(false);

  // left edge
  const leftCooldown = useRef(false);

  // dwell
  const dwellTimer    = useRef(null);
  const dwellPos      = useRef(null);
  const dwellStart    = useRef(null);
  const dwellProgress = useRef(0);

  const [gesture, setGesture] = useState('none');
  const [active,  setActive ] = useState(false);

  // ── scroll helpers ──────────────────────────────────────────────────────────
  const stopScroll = useCallback(() => {
    clearInterval(scrollTimer.current);
    scrollTimer.current = null;
    scrollSpeed.current = 0;
  }, []);

  const ensureScrollLoop = useCallback(() => {
    if (scrollTimer.current) return;
    scrollTimer.current = setInterval(() => {
      const spd = scrollSpeed.current;
      if (spd === 0) return;
      if (scrollRef?.current) scrollRef.current.scrollTop += spd;
      else window.scrollBy(0, spd);
    }, SCROLL_TICK_MS);
  }, [scrollRef]);

  // ── dwell helpers ───────────────────────────────────────────────────────────
  const cancelDwell = useCallback(() => {
    clearTimeout(dwellTimer.current);
    dwellTimer.current = null;
    dwellPos.current   = null;
    dwellStart.current = null;
    dwellProgress.current = 0;
  }, []);

  // ── called when locked gesture changes — wipe previous gesture's side-effects
  const cleanupGesture = useCallback((g) => {
    if (g === 'point') { stopScroll(); cancelDwell(); }
    if (g === 'pinch') { pinchActive.current = false; }
    if (g === 'fist')  { /* nothing to clean */ }
    if (g === 'open')  { /* nothing to clean */ }
  }, [stopScroll, cancelDwell]);

  // ── main frame handler ──────────────────────────────────────────────────────
  const onResults = useCallback((results) => {
    if (!results.multiHandLandmarks?.length) {
      canvasRef.current?.getContext('2d')
        .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      stopScroll(); cancelDwell();
      pinchActive.current = false;
      pendingRef.current  = { gesture: 'none', count: 0 };
      lockedRef.current   = 'none';
      setGesture('none');
      return;
    }

    const lm  = results.multiHandLandmarks[0];
    const raw = detectRaw(lm);

    // ── stabiliser ────────────────────────────────────────────────────────────
    const p = pendingRef.current;
    if (raw === p.gesture) {
      p.count += 1;
    } else {
      pendingRef.current = { gesture: raw, count: 1 };
    }

    // only upgrade locked gesture when candidate has held for enough frames
    if (pendingRef.current.count >= STABILISER_FRAMES && raw !== lockedRef.current) {
      cleanupGesture(lockedRef.current);   // tear down old gesture
      lockedRef.current = raw;             // commit new gesture
    }

    const g = lockedRef.current;
    setGesture(g);

    // mirrored tip coords
    const tipX = 1 - lm[8].x;
    const tipY = lm[8].y;

    // dwell ring progress for canvas
    dwellProgress.current = (g === 'point' && dwellStart.current)
      ? Math.min(1, (Date.now() - dwellStart.current) / DWELL_MS)
      : 0;

    if (canvasRef.current) drawHand(canvasRef.current, lm, g, dwellProgress.current);

    // ════════════════════════════════════════════════════════════════════════
    //  GESTURE RULES — one block per gesture, hard return, zero shared state
    // ════════════════════════════════════════════════════════════════════════

    // ── ANY gesture reaching left edge → open panel ─────────────────────────
    // Checked first, before per-gesture logic, so it works with every gesture.
    if (tipX < LEFT_EDGE_X && !leftCooldown.current) {
      onLeftEdge?.();
      leftCooldown.current = true;
      setTimeout(() => { leftCooldown.current = false; }, LEFT_EDGE_COOLDOWN);
    }

    // ── OPEN HAND → stop scrolling, nothing else ────────────────────────────
    if (g === 'open') {
      stopScroll();
      cancelDwell();
      return;
    }

    // ── POINT FINGER → scroll by Y position ────────────────────────────────
    if (g === 'point') {
      // Y zone: 0=top, 1=bottom, 0.5=center
      // top half (tipY < 0.5-dead) → scroll up (negative)
      // bottom half (tipY > 0.5+dead) → scroll down (positive)
      const offset = tipY - 0.5;

      if (Math.abs(offset) <= SCROLL_DEAD_ZONE) {
        // dead zone — stop
        stopScroll();
      } else {
        const sign = offset > 0 ? 1 : -1;
        const mag  = (Math.abs(offset) - SCROLL_DEAD_ZONE) / (0.5 - SCROLL_DEAD_ZONE);
        scrollSpeed.current = sign * mag * SCROLL_SPEED_MAX;
        ensureScrollLoop();
      }

      // dwell click while pointing
      if (!dwellPos.current) {
        dwellPos.current   = { x: tipX, y: tipY };
        dwellStart.current = Date.now();
        dwellTimer.current = setTimeout(() => {
          onClickAt?.(tipX, tipY);
          cancelDwell();
        }, DWELL_MS);
      } else {
        const moved = Math.hypot(tipX - dwellPos.current.x, tipY - dwellPos.current.y);
        if (moved > DWELL_RADIUS) {
          clearTimeout(dwellTimer.current);
          dwellPos.current   = { x: tipX, y: tipY };
          dwellStart.current = Date.now();
          dwellTimer.current = setTimeout(() => {
            onClickAt?.(tipX, tipY);
            cancelDwell();
          }, DWELL_MS);
        }
      }
      return;
    }

    // ── PINCH → single click at thumb+index midpoint ────────────────────────
    if (g === 'pinch') {
      stopScroll();
      cancelDwell();

      if (!pinchActive.current && !pinchCooldown.current) {
        const midX = (lm[4].x + lm[8].x) / 2;
        const midY = (lm[4].y + lm[8].y) / 2;
        onClickAt?.(1 - midX, midY);
        pinchCooldown.current = true;
        setTimeout(() => { pinchCooldown.current = false; }, PINCH_COOLDOWN);
      }
      pinchActive.current = true;
      return;
    }

    // ── FIST → neutral pause ────────────────────────────────────────────────
    if (g === 'fist') {
      stopScroll();
      cancelDwell();
      return;
    }
  }, [
    onClickAt, onLeftEdge,
    stopScroll, ensureScrollLoop, cancelDwell, cleanupGesture,
  ]);

  // ── start / stop camera ───────────────────────────────────────────────────
  const start = useCallback(async () => {
    if (!videoRef.current) return;
    const { Hands, Camera } = await loadMediaPipe();
    const hands = new Hands({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    videoRef.current.srcObject = stream;
    cameraRef.current = new Camera(videoRef.current, {
      onFrame: async () => hands.send({ image: videoRef.current }),
      width: 640, height: 480,
    });
    cameraRef.current.start();
    setActive(true);
  }, [onResults]);

  const stop = useCallback(() => {
    cameraRef.current?.stop();
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    stopScroll(); cancelDwell();
    canvasRef.current?.getContext('2d')
      .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setActive(false);
  }, [stopScroll, cancelDwell]);

  return { videoRef, canvasRef, gesture, active, start, stop };
}