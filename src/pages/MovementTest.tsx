import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import TestLayout from '@/components/TestLayout';
import { useTest } from '@/context/TestContext';

// Movement speed in pixels per second
const MOVEMENT_SPEED = 220;

// Target movement settings
const TARGET_SPEED = 120;
const DIRECTION_CHANGE_INTERVAL = 1500; // 1.5 seconds

const TEST_DURATION = 30; // seconds

export default function MovementTest() {
  const navigate = useNavigate();
  const { setDexScore } = useTest(); // ⭐ ADDED: Import setDexScore
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // All game state as refs (no React state for game logic)
  const state = useRef({
    // Crosshair
    crosshairX: 0,
    crosshairY: 0,
    // Target
    targetX: 0,
    targetY: 0,
    targetVx: 0,
    targetVy: 0,
    // Status
    isOnTarget: false,
    // Tracking
    framesOnTarget: 0,
    totalFrames: 0,
    timeOnTarget: 0,
    // Timer
    timeLeft: TEST_DURATION,
    isRunning: false,
    testCompleted: false,
    // Score
    score: 0,
    accuracy: 0,
    // Direction change tracking
    timeSinceLastDirectionChange: 0,
    frameCounter: 0,
  }).current;

  // UI state (only for rendering buttons)
  const [uiState, setUiState] = useState({
    isRunning: false,
    testCompleted: false,
    timeLeft: TEST_DURATION,
    score: 0,
    accuracy: 0,
    totalFrames: 0,
  });

  // Key states
  const keysPressed = useRef({ w: false, a: false, s: false, d: false });
  
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number>();

  // Random direction
  const randomDirection = () => {
    const angle = Math.random() * Math.PI * 2;
    return {
      vx: Math.cos(angle) * TARGET_SPEED,
      vy: Math.sin(angle) * TARGET_SPEED,
    };
  };

  // Initialize target
  const initTarget = (canvasWidth: number, canvasHeight: number) => {
    const padding = 50;
    state.targetX = Math.random() * (canvasWidth - padding * 2) + padding;
    state.targetY = Math.random() * (canvasHeight - padding * 2) + padding;
    const dir = randomDirection();
    state.targetVx = dir.vx;
    state.targetVy = dir.vy;
  };

  // Draw everything
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.06)';
    ctx.lineWidth = 1;
    const step = 50;
    for (let x = step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center guide crosshair
    const cx = width / 2;
    const cy = height / 2;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
    ctx.lineWidth = 1;
    const chSize = 25;
    const gap = 10;
    ctx.beginPath();
    ctx.moveTo(cx, cy - gap);
    ctx.lineTo(cx, cy - gap - chSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + gap + chSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - gap, cy);
    ctx.lineTo(cx - gap - chSize, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + gap + chSize, cy);
    ctx.stroke();
    ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    // Vignette
    const grad = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.3,
      width / 2, height / 2, width * 0.8
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // ---- TARGET ----
    const targetRadius = 20;
    const ringRadius = 36;
    const pulseSize = 8 + Math.sin(Date.now() / 300) * 3;

    // Ring glow
    const ringGlowGrad = ctx.createRadialGradient(
      state.targetX, state.targetY, targetRadius,
      state.targetX, state.targetY, ringRadius + 10
    );
    ringGlowGrad.addColorStop(0, 'rgba(255, 200, 100, 0.05)');
    ringGlowGrad.addColorStop(0.7, 'rgba(255, 200, 100, 0.10)');
    ringGlowGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = ringGlowGrad;
    ctx.beginPath();
    ctx.arc(state.targetX, state.targetY, ringRadius + 10, 0, Math.PI * 2);
    ctx.fill();

    // Outer ring (dashed)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = state.isOnTarget
      ? 'rgba(68, 255, 136, 0.3)'
      : 'rgba(255, 200, 100, 0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(state.targetX, state.targetY, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Target body glow
    const glowGrad = ctx.createRadialGradient(
      state.targetX, state.targetY, 0,
      state.targetX, state.targetY, targetRadius + pulseSize + 20
    );
    glowGrad.addColorStop(0, 'rgba(255, 100, 50, 0.4)');
    glowGrad.addColorStop(0.5, 'rgba(255, 60, 20, 0.15)');
    glowGrad.addColorStop(1, 'rgba(255, 60, 20, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(state.targetX, state.targetY, targetRadius + pulseSize + 20, 0, Math.PI * 2);
    ctx.fill();

    // Target body
    const targetGrad = ctx.createRadialGradient(
      state.targetX - 6, state.targetY - 6, 0,
      state.targetX, state.targetY, targetRadius
    );
    targetGrad.addColorStop(0, '#ff8844');
    targetGrad.addColorStop(0.6, '#ff4422');
    targetGrad.addColorStop(1, '#cc2200');
    ctx.shadowColor = 'rgba(255, 68, 34, 0.6)';
    ctx.shadowBlur = 20 + pulseSize;
    ctx.beginPath();
    ctx.arc(state.targetX, state.targetY, targetRadius, 0, Math.PI * 2);
    ctx.fillStyle = targetGrad;
    ctx.fill();

    // Inner highlight
    ctx.shadowBlur = 0;
    const highlightGrad = ctx.createRadialGradient(
      state.targetX - 8, state.targetY - 8, 0,
      state.targetX - 8, state.targetY - 8, targetRadius * 0.5
    );
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.beginPath();
    ctx.arc(state.targetX, state.targetY, targetRadius, 0, Math.PI * 2);
    ctx.fillStyle = highlightGrad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(state.targetX, state.targetY, targetRadius, 0, Math.PI * 2);
    ctx.stroke();

    // ---- PLAYER CROSSHAIR ----
    const pX = state.crosshairX;
    const pY = state.crosshairY;
    const radius = 12;
    const armLen = 16;
    const armGap = 6;

    const color = state.isOnTarget ? '#44ff88' : '#ff4444';

    ctx.shadowColor = color;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(pX, pY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(pX, pY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.shadowBlur = 15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pX, pY - armGap);
    ctx.lineTo(pX, pY - armGap - armLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pX, pY + armGap);
    ctx.lineTo(pX, pY + armGap + armLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pX - armGap, pY);
    ctx.lineTo(pX - armGap - armLen, pY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pX + armGap, pY);
    ctx.lineTo(pX + armGap + armLen, pY);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // ---- HUD: TIMER ----
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const timerText = `${String(Math.floor(state.timeLeft / 60)).padStart(2, '0')}:${String(state.timeLeft % 60).padStart(2, '0')}`;
    const timerMetrics = ctx.measureText(timerText);
    const timerPillW = timerMetrics.width + 40;
    const timerPillH = 50;
    const timerPillX = (width - timerPillW) / 2;
    const timerPillY = 15;

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(timerPillX, timerPillY, timerPillW, timerPillH, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(timerPillX, timerPillY, timerPillW, timerPillH, 12);
    ctx.stroke();

    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(timerText, width / 2, timerPillY + 10);

    // ---- HUD: SCORE ----
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '14px Orbitron, sans-serif';
    ctx.fillText('SCORE', 25, 20);

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 28px Orbitron, sans-serif';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 15;
    ctx.fillText(`${state.score}`, 25, 40);

    // ---- TEST COMPLETE OVERLAY ----
    if (state.testCompleted) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 48px Orbitron, sans-serif';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 30;
      ctx.fillText('TEST COMPLETE', width / 2, height / 2 - 40);

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '24px Orbitron, sans-serif';
      ctx.fillText(`Score: ${state.score} / 60`, width / 2, height / 2 + 40);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '16px Orbitron, sans-serif';
      ctx.fillText('Click "Continue" to proceed', width / 2, height / 2 + 90);
    }

    // Status text
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      `Pos: (${Math.round(pX)}, ${Math.round(pY)}) | Status: ${state.isOnTarget ? 'ON TARGET 🟢' : 'OFF TARGET 🔴'} | Acc: ${state.accuracy}%`,
      12,
      height - 12
    );
  };

  // Update game logic
  const update = (deltaTime: number) => {
    if (!state.isRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // ---- Update Crosshair ----
    let dx = 0;
    let dy = 0;
    if (keysPressed.current.w) dy -= 1;
    if (keysPressed.current.s) dy += 1;
    if (keysPressed.current.a) dx -= 1;
    if (keysPressed.current.d) dx += 1;

    if (dx !== 0 || dy !== 0) {
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }
      const speed = MOVEMENT_SPEED * deltaTime;
      let newX = state.crosshairX + dx * speed;
      let newY = state.crosshairY + dy * speed;
      const padding = 20;
      newX = Math.max(padding, Math.min(canvas.width - padding, newX));
      newY = Math.max(padding, Math.min(canvas.height - padding, newY));
      state.crosshairX = newX;
      state.crosshairY = newY;
    }

    // ---- Update Target ----
    state.timeSinceLastDirectionChange += deltaTime * 1000;
    if (state.timeSinceLastDirectionChange > DIRECTION_CHANGE_INTERVAL) {
      const dir = randomDirection();
      state.targetVx = dir.vx;
      state.targetVy = dir.vy;
      state.timeSinceLastDirectionChange = 0;
    }

    let newTX = state.targetX + state.targetVx * deltaTime;
    let newTY = state.targetY + state.targetVy * deltaTime;
    const padding = 30;
    const ringRadius = 36;

    if (newTX < padding + ringRadius) {
      newTX = padding + ringRadius;
      state.targetVx = Math.abs(state.targetVx);
    } else if (newTX > canvas.width - padding - ringRadius) {
      newTX = canvas.width - padding - ringRadius;
      state.targetVx = -Math.abs(state.targetVx);
    }
    if (newTY < padding + ringRadius) {
      newTY = padding + ringRadius;
      state.targetVy = Math.abs(state.targetVy);
    } else if (newTY > canvas.height - padding - ringRadius) {
      newTY = canvas.height - padding - ringRadius;
      state.targetVy = -Math.abs(state.targetVy);
    }
    state.targetX = newTX;
    state.targetY = newTY;

    // ---- Check Overlap ----
    const ddx = state.crosshairX - state.targetX;
    const ddy = state.crosshairY - state.targetY;
    const distance = Math.sqrt(ddx * ddx + ddy * ddy);
    const isOverlapping = distance < ringRadius + 12;

    if (isOverlapping !== state.isOnTarget) {
      state.isOnTarget = isOverlapping;
      console.log(isOverlapping ? '🎯 ON TARGET! 🟢' : '🎯 OFF TARGET 🔴');
    }

    // ---- Update Tracking ----
    state.totalFrames++;
    if (isOverlapping) {
      state.framesOnTarget++;
      state.timeOnTarget += deltaTime;
    }

    state.frameCounter++;
    if (state.frameCounter >= 10) {
      state.accuracy = Math.round((state.framesOnTarget / state.totalFrames) * 100);
      state.frameCounter = 0;
    }

    state.score = Math.round(state.timeOnTarget * 2);

    // ---- Update UI State ----
    setUiState({
      isRunning: state.isRunning,
      testCompleted: state.testCompleted,
      timeLeft: state.timeLeft,
      score: state.score,
      accuracy: state.accuracy,
      totalFrames: state.totalFrames,
    });
  };

  // ---- START TEST ----
  const startTest = () => {
    if (state.isRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not ready');
      return;
    }

    // Reset state
    state.isRunning = true;
    state.testCompleted = false;
    state.timeLeft = TEST_DURATION;
    state.score = 0;
    state.accuracy = 0;
    state.timeOnTarget = 0;
    state.framesOnTarget = 0;
    state.totalFrames = 0;
    state.isOnTarget = false;
    state.crosshairX = canvas.width / 2;
    state.crosshairY = canvas.height / 2;
    initTarget(canvas.width, canvas.height);
    state.timeSinceLastDirectionChange = 0;
    state.frameCounter = 0;

    // Update UI
    setUiState({
      isRunning: true,
      testCompleted: false,
      timeLeft: TEST_DURATION,
      score: 0,
      accuracy: 0,
      totalFrames: 0,
    });

    // Start timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      state.timeLeft--;
      setUiState(prev => ({ ...prev, timeLeft: state.timeLeft }));
      if (state.timeLeft <= 0) {
        endTest();
      }
    }, 1000);
  };

  // ---- END TEST ----
  const endTest = () => {
    // 1. Stop the game
    state.isRunning = false;
    state.testCompleted = true;
    
    // 2. Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = undefined;
    }
    
    // 3. Calculate final score
    const finalScore = Math.round(state.timeOnTarget * 2);
    state.score = finalScore;
    
    // 4. ⭐ CRITICAL: Save score to Context
    setDexScore(finalScore);
    
    // 5. Update UI
    setUiState(prev => ({
      ...prev,
      isRunning: false,
      testCompleted: true,
      score: finalScore,
    }));
    
    console.log(`🏁 MovementTest complete! Score: ${finalScore}`);
  };

  // ---- RESIZE ----
  const resizeCanvas = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width;
    canvas.height = height;

    state.crosshairX = width / 2;
    state.crosshairY = height / 2;
    initTarget(width, height);
    state.timeSinceLastDirectionChange = 0;

    draw();
    console.log('✅ MovementTest canvas ready:', { width, height });
  };

  // ---- ANIMATION LOOP ----
  const animate = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    update(deltaTime);
    draw();

    animationRef.current = requestAnimationFrame(animate);
  };

  // ---- KEYBOARD ----
  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
      e.preventDefault();
      keysPressed.current[key as keyof typeof keysPressed.current] = true;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
      e.preventDefault();
      keysPressed.current[key as keyof typeof keysPressed.current] = false;
    }
  };

  // ---- SETUP ----
  useEffect(() => {
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <TestLayout step={2} onContinue={() => navigate('/play/keybind')}>
      <div className="flex w-full max-w-5xl flex-col items-center">
        <p className="mb-4 text-center text-sm text-text-secondary sm:text-base">
          WASD to track the moving target. Stay on it!
        </p>

        <div className="mb-4 flex gap-3">
          <button
            type="button"
            onClick={startTest}
            disabled={uiState.isRunning || uiState.testCompleted}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
              uiState.isRunning || uiState.testCompleted
                ? 'border border-border text-text-secondary cursor-not-allowed opacity-50'
                : 'border border-primary text-primary hover:bg-primary/10 hover:shadow-primary-glow'
            }`}
          >
            {uiState.isRunning ? 'Running...' : uiState.testCompleted ? 'Complete' : 'Start Test'}
          </button>
          <button
            type="button"
            onClick={() => {
              state.isRunning = false;
              state.testCompleted = false;
              state.timeLeft = TEST_DURATION;
              state.score = 0;
              state.accuracy = 0;
              state.timeOnTarget = 0;
              state.framesOnTarget = 0;
              state.totalFrames = 0;
              state.isOnTarget = false;
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = undefined;
              }
              const canvas = canvasRef.current;
              if (canvas) {
                state.crosshairX = canvas.width / 2;
                state.crosshairY = canvas.height / 2;
                initTarget(canvas.width, canvas.height);
              }
              setUiState({
                isRunning: false,
                testCompleted: false,
                timeLeft: TEST_DURATION,
                score: 0,
                accuracy: 0,
                totalFrames: 0,
              });
            }}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-secondary transition-all duration-200 hover:bg-border/20 active:scale-[0.98]"
          >
            Reset
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative w-full rounded-2xl border border-primary bg-surface overflow-hidden"
          style={{
            aspectRatio: '16 / 9',
            maxHeight: '70vh',
            minHeight: '300px',
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full cursor-crosshair"
          />
        </div>

        <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface px-3 py-3 text-center">
            <p className="text-xs text-text-secondary">Speed</p>
            <p className="mt-1 font-heading text-lg font-semibold text-white">
              {uiState.totalFrames > 0 ? `${Math.round(TARGET_SPEED)}px/s` : '--'}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-3 py-3 text-center">
            <p className="text-xs text-text-secondary">Accuracy</p>
            <p className={`mt-1 font-heading text-lg font-semibold ${
              uiState.accuracy >= 70 ? 'text-green-400' :
              uiState.accuracy >= 40 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {uiState.totalFrames > 0 ? `${uiState.accuracy}%` : '--'}
            </p>
          </div>
        </div>

        {uiState.testCompleted && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/play/keybind')}
              className="rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-glow hover:shadow-primary-glow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </TestLayout>
  );
}