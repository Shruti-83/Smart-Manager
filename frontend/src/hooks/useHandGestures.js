import { useRef, useCallback, useState } from 'react';

const DWELL_TIME = 1500;
const DWELL_RADIUS = 0.04;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function loadMediaPipe() {
  const base = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands';
  const camBase = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils';
  await loadScript(`${base}/hands.js`);
  await loadScript(`${camBase}/camera_utils.js`);
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

function drawHand(canvas, lm, gesture, dwellProgress = 0) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;
  const x = (lx) => (1 - lx) * W;
  const y = (ly) => ly * H;

  const color = gesture === 'pinch' ? '#FF4D4D'
              : gesture === 'fist'  ? '#FFA500'
              : gesture === 'open'  ? '#00E5FF'
              : '#A78BFA'; // point

  // skeleton
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.85;
  for (const [a, b] of CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(x(lm[a].x), y(lm[a].y));
    ctx.lineTo(x(lm[b].x), y(lm[b].y));
    ctx.stroke();
  }

  // dots
  for (let i = 0; i < lm.length; i++) {
    const isFingerTip = [4, 8, 12, 16, 20].includes(i);
    ctx.beginPath();
    ctx.arc(x(lm[i].x), y(lm[i].y), isFingerTip ? 6 : 3, 0, Math.PI * 2);
    ctx.fillStyle = isFingerTip ? color : '#ffffff';
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // pinch crosshair
  if (gesture === 'pinch') {
    const mx = x((lm[4].x + lm[8].x) / 2);
    const my = y((lm[4].y + lm[8].y) / 2);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#FF4D4D';
    ctx.lineWidth = 2;
    const s = 10;
    ctx.beginPath(); ctx.moveTo(mx - s, my); ctx.lineTo(mx + s, my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, my - s); ctx.lineTo(mx, my + s); ctx.stroke();
    ctx.beginPath();
    ctx.arc(mx, my, s, 0, Math.PI * 2);
    ctx.globalAlpha = 0.4;
    ctx.stroke();
  }

  // dwell progress ring around index fingertip
  if (gesture === 'point' && dwellProgress > 0) {
    const fx = x(lm[8].x);
    const fy = y(lm[8].y);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#A78BFA';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(fx, fy, 18, -Math.PI / 2, -Math.PI / 2 + dwellProgress * Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

export function useHandGestures(scrollRef, onClickAt, options = {}, onLeftEdge) {
  const { sensitivity = 400, smoothing = 0.55, pinchThreshold = 0.06 } = options;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const prevYRef = useRef(null);
  const prevXRef = useRef(null);
  const smoothDeltaRef = useRef(0);
  const wasPinchingRef = useRef(false);
  const pinchCooldownRef = useRef(false);
  const leftEdgeCooldownRef = useRef(false);
  const cameraRef = useRef(null);

  // dwell refs — INSIDE the hook
  const dwellRef = useRef(null);
  const dwellPosRef = useRef(null);
  const dwellStartRef = useRef(null);         // for progress ring
  const dwellProgressRef = useRef(0);

  const [gesture, setGesture] = useState('none');
  const [active, setActive] = useState(false);

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const detectGesture = (lm) => {
    if (dist(lm[4], lm[8]) < pinchThreshold) return 'pinch';
    const tips  = [8, 12, 16, 20];
    const bases = [5,  9, 13, 17];
    const wrist = lm[0];
    const ext = tips.filter((t, i) => {
      return dist(lm[t], wrist) > dist(lm[bases[i]], wrist) * 1.2;
    }).length;
    if (ext === 0) return 'fist';
    return ext >= 2 ? 'open' : 'point';
  };

  const onResults = useCallback((results) => {
    if (!results.multiHandLandmarks?.length) {
      if (canvasRef.current) {
        canvasRef.current.getContext('2d')
          .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      prevYRef.current = null;
      prevXRef.current = null;
      clearTimeout(dwellRef.current);
      dwellPosRef.current = null;
      dwellStartRef.current = null;
      setGesture('none');
      return;
    }

    const lm = results.multiHandLandmarks[0];
    const g = detectGesture(lm);
    setGesture(g);

    // single tipX/tipY declaration for entire function
    const tipX = 1 - lm[8].x;   // mirrored X
    const tipY = lm[8].y;

    // update dwell progress for drawing
    if (g === 'point' && dwellStartRef.current) {
      dwellProgressRef.current = Math.min(1, (Date.now() - dwellStartRef.current) / DWELL_TIME);
    } else {
      dwellProgressRef.current = 0;
    }

    if (canvasRef.current) drawHand(canvasRef.current, lm, g, dwellProgressRef.current);

    // — DWELL CLICK (point + hold still) —
    if (g === 'point') {
      if (dwellPosRef.current) {
        const moved = Math.hypot(tipX - dwellPosRef.current.x, tipY - dwellPosRef.current.y);
        if (moved > DWELL_RADIUS) {
          // moved too much — reset
          clearTimeout(dwellRef.current);
          dwellPosRef.current = { x: tipX, y: tipY };
          dwellStartRef.current = Date.now();
          dwellRef.current = setTimeout(() => {
            onClickAt?.(tipX, tipY);
            dwellPosRef.current = null;
            dwellStartRef.current = null;
          }, DWELL_TIME);
        }
        // else: still hovering, let timer run
      } else {
        dwellPosRef.current = { x: tipX, y: tipY };
        dwellStartRef.current = Date.now();
        dwellRef.current = setTimeout(() => {
          onClickAt?.(tipX, tipY);
          dwellPosRef.current = null;
          dwellStartRef.current = null;
        }, DWELL_TIME);
      }
    } else {
      // any non-point gesture cancels dwell
      clearTimeout(dwellRef.current);
      dwellPosRef.current = null;
      dwellStartRef.current = null;
    }

    // — PINCH CLICK —
    if (g === 'pinch') {
      const midX = (lm[4].x + lm[8].x) / 2;
      const midY = (lm[4].y + lm[8].y) / 2;
      if (!wasPinchingRef.current && !pinchCooldownRef.current) {
        onClickAt?.(1 - midX, midY);
        pinchCooldownRef.current = true;
        setTimeout(() => { pinchCooldownRef.current = false; }, 700);
      }
      wasPinchingRef.current = true;
      prevYRef.current = null;
      prevXRef.current = null;
      smoothDeltaRef.current = 0;
      return;
    }

    wasPinchingRef.current = false;

    // — FIST = PAUSE —
    if (g === 'fist') {
      prevYRef.current = null;
      prevXRef.current = null;
      return;
    }

    // — LEFT EDGE ZONE —
    if (tipX < 0.15 && !leftEdgeCooldownRef.current) {
      onLeftEdge?.();
      leftEdgeCooldownRef.current = true;
      setTimeout(() => { leftEdgeCooldownRef.current = false; }, 2000);
    }

    // — SCROLL —
    if (prevYRef.current !== null) {
      const raw = tipY - prevYRef.current;
      smoothDeltaRef.current = smoothing * smoothDeltaRef.current + (1 - smoothing) * raw;
      if (Math.abs(smoothDeltaRef.current) > 0.003) {
        if (scrollRef?.current) {
          scrollRef.current.scrollTop += smoothDeltaRef.current * sensitivity;
        } else {
          window.scrollBy(0, smoothDeltaRef.current * sensitivity);
        }
      }
    }
    prevYRef.current = tipY;
    prevXRef.current = tipX;
  }, [scrollRef, onClickAt, onLeftEdge, sensitivity, smoothing, pinchThreshold]);

  const start = useCallback(async () => {
    if (!videoRef.current) return;
    const { Hands, Camera } = await loadMediaPipe();
    const hands = new Hands({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
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
      onFrame: async () => await hands.send({ image: videoRef.current }),
      width: 640, height: 480,
    });
    cameraRef.current.start();
    setActive(true);
  }, [onResults]);

  const stop = useCallback(() => {
    cameraRef.current?.stop();
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    clearTimeout(dwellRef.current);
    if (canvasRef.current) {
      canvasRef.current.getContext('2d')
        .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setActive(false);
  }, []);

  return { videoRef, canvasRef, gesture, active, start, stop };
}