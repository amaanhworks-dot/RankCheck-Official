import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import TestLayout from '@/components/TestLayout';
import { useTest } from '@/context/TestContext';
import { playSound } from '@/utils/sound'; // ⭐ ADDED

// Extend Window interface for debugging
declare global {
  interface Window {
    testSpawn?: () => void;
    testState?: () => void;
  }
}

type Target = {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'static' | 'moving' | 'ace';
  vx?: number;
  vy?: number;
  trail?: { x: number; y: number }[];
  spawnTime: number;
  isAlive: boolean;
  isAce?: boolean;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
};

type FloatingText = {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  color: string;
};

// Difficulty curve configuration (60 seconds)
type DifficultyLevel = {
  spawnInterval: number;
  targetSize: number;
  label: string;
};

const DIFFICULTY_CURVE: DifficultyLevel[] = [
  { spawnInterval: 1.5, targetSize: 22, label: 'EASY' },
  { spawnInterval: 1.2, targetSize: 18, label: 'MEDIUM' },
  { spawnInterval: 1.0, targetSize: 15, label: 'HARD' },
  { spawnInterval: 0.8, targetSize: 12, label: 'INTENSE' },
  { spawnInterval: 0.6, targetSize: 10, label: 'CHAOS' },
  { spawnInterval: 0.5, targetSize: 8, label: 'HELL' },
];

const LEVEL_DURATION = 10;
const TEST_DURATION = 60;

export default function AimTest() {
  const navigate = useNavigate();
  const { setAimScore } = useTest();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // React State (for UI updates)
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [hits, setHits] = useState(0);
  const [shots, setShots] = useState(0);
  const [isOnTarget, setIsOnTarget] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [aceCount, setAceCount] = useState(0);
  const [speedUpText, setSpeedUpText] = useState('');
  const [speedUpTimer, setSpeedUpTimer] = useState(0);

  // --- REFS FOR RENDERING (Animation loop owns these) ---
  const targetsRef = useRef<Target[]>([]);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(TEST_DURATION);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const hitsRef = useRef(0);
  const shotsRef = useRef(0);
  const isOnTargetRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const aceCountRef = useRef(0);
  const speedUpTextRef = useRef('');
  const speedUpTimerRef = useRef(0);
  const testCompletedRef = useRef(false);

  const animationRef = useRef<number>();
  const isRunningRef = useRef(false);
  const timerIntervalRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef(0);
  const aceTimerRef = useRef(0);
  const difficultyRef = useRef(0);
  const elapsedTimeRef = useRef(0);

  // --- FROZEN STATS FOR END STATE (REF + STATE) ---
  const finalStatsRef = useRef({
    score: 0,
    hits: 0,
    misses: 0,
    accuracy: 0,
    maxCombo: 0,
    aceCount: 0,
  });
  const [finalStats, setFinalStats] = useState({
    score: 0,
    hits: 0,
    misses: 0,
    accuracy: 0,
    maxCombo: 0,
    aceCount: 0,
  });

  // Sync refs with state
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);
  useEffect(() => {
    maxComboRef.current = maxCombo;
  }, [maxCombo]);
  useEffect(() => {
    hitsRef.current = hits;
  }, [hits]);
  useEffect(() => {
    shotsRef.current = shots;
  }, [shots]);
  useEffect(() => {
    isOnTargetRef.current = isOnTarget;
  }, [isOnTarget]);
  useEffect(() => {
    aceCountRef.current = aceCount;
  }, [aceCount]);
  useEffect(() => {
    speedUpTextRef.current = speedUpText;
  }, [speedUpText]);
  useEffect(() => {
    speedUpTimerRef.current = speedUpTimer;
  }, [speedUpTimer]);
  useEffect(() => {
    testCompletedRef.current = testCompleted;
  }, [testCompleted]);

  // Get current difficulty level
  const getDifficultyLevel = (time: number): number => {
    return Math.min(Math.floor(time / LEVEL_DURATION), DIFFICULTY_CURVE.length - 1);
  };

  // --- TARGET GENERATION ---
  const generateTarget = (currentTargets: Target[]): Target | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const maxAttempts = 50;
    let attempts = 0;

    const rand = Math.random();
    let type: 'static' | 'moving' | 'ace' = 'static';
    let isAce = false;

    if (aceTimerRef.current >= 10 && aceCountRef.current < 6) {
      type = 'ace';
      isAce = true;
      aceTimerRef.current = 0;
    } else if (rand < 0.30) {
      type = 'moving';
    } else {
      type = 'static';
    }

    const level = getDifficultyLevel(elapsedTimeRef.current);
    const config = DIFFICULTY_CURVE[level];
    const radius = config.targetSize;

    let x: number, y: number;
    let vx = 0,
      vy = 0;

    if (type === 'moving') {
      const edge = Math.floor(Math.random() * 4);
      const speed = 60 + Math.random() * 40;
      switch (edge) {
        case 0:
          x = Math.random() * (width - padding * 2) + padding;
          y = padding;
          break;
        case 1:
          x = Math.random() * (width - padding * 2) + padding;
          y = height - padding;
          break;
        case 2:
          x = padding;
          y = Math.random() * (height - padding * 2) + padding;
          break;
        default:
          x = width - padding;
          y = Math.random() * (height - padding * 2) + padding;
      }
      const dx = width / 2 - x;
      const dy = height / 2 - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        vx = (dx / dist) * speed * (0.5 + Math.random() * 0.5);
        vy = (dy / dist) * speed * (0.5 + Math.random() * 0.5);
      }
    } else {
      x = Math.random() * (width - padding * 2) + padding;
      y = Math.random() * (height - padding * 2) + padding;
    }

    while (attempts < maxAttempts) {
      let overlaps = false;
      for (const existing of currentTargets) {
        const dx = existing.x - x;
        const dy = existing.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = existing.radius + radius + 15;
        if (distance < minDistance) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        const target: Target = {
          id: Date.now() + Math.random(),
          x,
          y,
          radius,
          type,
          spawnTime: Date.now(),
          isAlive: true,
          isAce,
          trail: type === 'moving' ? [{ x, y }] : [],
        };
        if (type === 'moving') {
          target.vx = vx;
          target.vy = vy;
        }
        return target;
      }
      if (type === 'moving') {
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
          case 0:
            x = Math.random() * (width - padding * 2) + padding;
            y = padding;
            break;
          case 1:
            x = Math.random() * (width - padding * 2) + padding;
            y = height - padding;
            break;
          case 2:
            x = padding;
            y = Math.random() * (height - padding * 2) + padding;
            break;
          default:
            x = width - padding;
            y = Math.random() * (height - padding * 2) + padding;
        }
        const dx = width / 2 - x;
        const dy = height / 2 - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          vx = (dx / dist) * (60 + Math.random() * 40) * (0.5 + Math.random() * 0.5);
          vy = (dy / dist) * (60 + Math.random() * 40) * (0.5 + Math.random() * 0.5);
        }
      } else {
        x = Math.random() * (width - padding * 2) + padding;
        y = Math.random() * (height - padding * 2) + padding;
      }
      attempts++;
    }
    return null;
  };

  // --- SPAWN TARGET ---
  const spawnTarget = () => {
    if (!isRunningRef.current) return;
    const newTarget = generateTarget(targetsRef.current);
    if (newTarget) {
      if (newTarget.isAce) {
        aceCountRef.current += 1;
        setAceCount(aceCountRef.current);
      }
      targetsRef.current = [...targetsRef.current, newTarget];
    }
  };

  // --- ADD FLOATING TEXT ---
  const addFloatingText = (x: number, y: number, text: string, color: string = '#c084fc') => {
    floatingTextsRef.current = [
      ...floatingTextsRef.current,
      {
        id: Date.now() + Math.random(),
        x,
        y,
        text,
        life: 1,
        maxLife: 1,
        color,
      },
    ];
    setFloatingTexts(floatingTextsRef.current);
  };

  // --- DRAW CANVAS ---
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const currentTargets = targetsRef.current;
    const currentScore = scoreRef.current;
    const currentTimeLeft = timeLeftRef.current;
    const currentCombo = comboRef.current;
    const currentHits = hitsRef.current;
    const currentShots = shotsRef.current;
    const currentIsOnTarget = isOnTargetRef.current;
    const currentSpeedUpTimer = speedUpTimerRef.current;
    const currentSpeedUpText = speedUpTextRef.current;
    const currentAceCount = aceCountRef.current;
    const currentFloatingTexts = floatingTextsRef.current;
    const isComplete = testCompletedRef.current;

    // --- Use ref for final stats when complete ---
    const displayStats = isComplete ? finalStatsRef.current : finalStats;

    // Background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Speed up pulse (only when running)
    if (currentSpeedUpTimer > 0 && !isComplete) {
      const alpha = currentSpeedUpTimer / 30 * 0.15;
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.2,
        width / 2, height / 2, height * 0.8
      );
      gradient.addColorStop(0, `rgba(168, 85, 247, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(168, 85, 247, ${alpha})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(168, 85, 247, ${Math.min(1, currentSpeedUpTimer / 15)})`;
      ctx.font = 'bold 48px Orbitron, sans-serif';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 30;
      ctx.fillText(currentSpeedUpText, width / 2, height / 2);
      ctx.shadowBlur = 0;
    }

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

    // --- DRAW TARGETS (only if test is NOT complete) ---
    if (!isComplete) {
      currentTargets.forEach(target => {
        if (!target.isAlive) return;
        const { x, y, radius, type, isAce } = target;

        if (type === 'moving' && target.trail && target.trail.length > 1) {
          for (let i = 0; i < target.trail.length - 1; i++) {
            const alpha = (i / target.trail.length) * 0.2;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(target.trail[i].x, target.trail[i].y, radius * (i / target.trail.length), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }

        if (isAce) {
          const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius + 25);
          gradient.addColorStop(0, `rgba(255, 215, 0, ${pulse * 0.5})`);
          gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius + 25, 0, Math.PI * 2);
          ctx.fill();
        }

        let gradient: CanvasGradient;
        let shadowColor: string;
        if (isAce) {
          gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
          gradient.addColorStop(0, '#ffd700');
          gradient.addColorStop(0.6, '#f59e0b');
          gradient.addColorStop(1, '#b45309');
          shadowColor = 'rgba(255, 215, 0, 0.6)';
        } else {
          gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
          gradient.addColorStop(0, '#c084fc');
          gradient.addColorStop(0.5, '#a855f7');
          gradient.addColorStop(1, '#7c3aed');
          shadowColor = 'rgba(168, 85, 247, 0.5)';
        }

        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = isAce ? 30 : 15;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = isAce ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isAce ? 2 : 1.5;
        ctx.stroke();

        if (isAce) {
          ctx.fillStyle = '#ffd700';
          ctx.font = '16px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 15;
          ctx.fillText('⭐', x, y - radius - 8);
        }
        ctx.shadowBlur = 0;
      });
    }

    // --- DRAW PARTICLES ---
    particlesRef.current.forEach(particle => {
      const lifeRatio = Math.max(particle.life / particle.maxLife, 0);
      ctx.globalAlpha = lifeRatio;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(particle.radius * lifeRatio, 0.5), 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;

    // --- DRAW FLOATING TEXTS ---
    currentFloatingTexts.forEach(ft => {
      const lifeRatio = ft.life / ft.maxLife;
      ctx.globalAlpha = lifeRatio;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 32px Orbitron, sans-serif';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 20;
      ctx.fillText(ft.text, ft.x, ft.y - (1 - lifeRatio) * 60);
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;

    // --- CROSSHAIR ---
    const cx = width / 2;
    const cy = height / 2;
    const crosshairSize = 20;
    const gap = 8;
    const color = currentIsOnTarget && !isComplete ? '#44ff88' : '#ff4444';

    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy - gap);
    ctx.lineTo(cx, cy - gap - crosshairSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + gap + crosshairSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - gap, cy);
    ctx.lineTo(cx - gap - crosshairSize, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + gap + crosshairSize, cy);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // --- HUD (only when running) ---
    if (!isComplete) {
      // Score
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '12px Orbitron, sans-serif';
      ctx.fillText('SCORE', 25, 20);
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 32px Orbitron, sans-serif';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 15;
      ctx.fillText(`${currentScore}`, 25, 40);

      const level = getDifficultyLevel(elapsedTimeRef.current);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '10px Orbitron, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(DIFFICULTY_CURVE[level].label, 25, 78);

      // Timer
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const timerText = `${String(Math.floor(currentTimeLeft / 60)).padStart(2, '0')}:${String(currentTimeLeft % 60).padStart(2, '0')}`;
      const timerMetrics = ctx.measureText(timerText);
      const timerPillW = timerMetrics.width + 40;
      const timerPillH = 50;
      const timerPillX = (width - timerPillW) / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(timerPillX, 15, timerPillW, timerPillH, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(timerPillX, 15, timerPillW, timerPillH, 12);
      ctx.stroke();

      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(timerText, width / 2, 25);

      // Combo
      ctx.shadowBlur = 0;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '12px Orbitron, sans-serif';
      ctx.fillText('COMBO', width - 25, 20);

      if (currentCombo > 0) {
        let multiplier = 'x2';
        if (currentCombo >= 10) multiplier = 'x5';
        else if (currentCombo >= 6) multiplier = 'x3';
        else if (currentCombo >= 3) multiplier = 'x2';

        ctx.fillStyle = currentCombo >= 6 ? '#fbbf24' : currentCombo >= 3 ? '#c084fc' : '#ffffff';
        ctx.font = 'bold 28px Orbitron, sans-serif';
        ctx.shadowColor = currentCombo >= 6 ? '#fbbf24' : '#a855f7';
        ctx.shadowBlur = 20;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`🔥 ${multiplier}`, width - 25, 40);
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = 'bold 28px Orbitron, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('--', width - 25, 40);
      }

      // Ace counter
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.font = '10px Orbitron, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`⭐ ${currentAceCount}/6`, width - 25, 72);

      // Hits/Shots
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '14px Orbitron, sans-serif';
      ctx.fillText(`${currentHits} / ${currentShots}`, width / 2, height - 25);
    }

    // --- TEST COMPLETE OVERLAY ---
    if (isComplete) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Title
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 48px Orbitron, sans-serif';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 30;
      ctx.fillText('TEST COMPLETE', width / 2, height / 2 - 140);

      ctx.shadowBlur = 0;

      // Stats from frozen ref
      const stats = [
        { label: 'Final Score', value: `${displayStats.score}`, highlight: true },
        { label: 'Total Hits', value: `${displayStats.hits}` },
        { label: 'Total Misses', value: `${displayStats.misses}` },
        { label: 'Accuracy', value: `${displayStats.accuracy}%` },
        { label: 'Highest Combo', value: `${displayStats.maxCombo}x` },
        { label: 'Ace Targets Hit', value: `${displayStats.aceCount}/6` },
      ];

      stats.forEach((stat, index) => {
        const yPos = height / 2 - 90 + index * 45;
        if (stat.highlight) {
          ctx.fillStyle = '#c084fc';
          ctx.font = 'bold 28px Orbitron, sans-serif';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '20px Orbitron, sans-serif';
        }
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${stat.label}:`, width / 2 - 20, yPos);
        ctx.textAlign = 'left';
        ctx.fillText(stat.value, width / 2 + 20, yPos);
      });

      // Continue hint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '14px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('Click a button below', width / 2, height - 40);
    }
  };

  // --- CAPTURE FINAL STATS ---
  const captureFinalStats = () => {
    // ⭐ Play end sound
    playSound('end');

    const rawScore = scoreRef.current;
    const finalScore = Math.round(rawScore * 1.2);
    // Normalize the final score for display
    const normalizedScore = Math.min(Math.round((finalScore / 1000) * 100), 100);
    
    const finalHits = hitsRef.current;
    const finalShots = shotsRef.current;
    const finalMisses = Math.max(0, finalShots - finalHits);
    const finalAccuracy = Math.round((finalHits / Math.max(finalShots, 1)) * 100);
    const finalMaxCombo = maxComboRef.current;
    const finalAceCount = aceCountRef.current;

    // Update ref synchronously
    finalStatsRef.current = {
      score: normalizedScore,
      hits: finalHits,
      misses: finalMisses,
      accuracy: finalAccuracy,
      maxCombo: finalMaxCombo,
      aceCount: finalAceCount,
    };

    // Update state for React re-render
    setFinalStats({ ...finalStatsRef.current });

    // Save the RAW score to Context (not normalized)
    scoreRef.current = finalScore;
    setAimScore(finalScore);

    console.log(`🏁 AimTest complete! Raw Score: ${finalScore}, Normalized: ${normalizedScore}`);
    console.log(`   Hits: ${finalHits}, Shots: ${finalShots}, Misses: ${finalMisses}`);
    console.log(`   Accuracy: ${finalAccuracy}%, Max Combo: ${finalMaxCombo}x`);
    console.log(`   Ace Targets: ${finalAceCount}/6`);
  };

  // --- ANIMATION LOOP ---
  const animate = (timestamp: number) => {
    if (!isRunningRef.current) return;

    const delta = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    const level = getDifficultyLevel(elapsedTimeRef.current);
    const config = DIFFICULTY_CURVE[level];
    spawnTimerRef.current += delta;

    if (spawnTimerRef.current >= config.spawnInterval) {
      spawnTimerRef.current = 0;
      spawnTarget();
    }

    aceTimerRef.current += delta;

    if (speedUpTimerRef.current > 0) {
      speedUpTimerRef.current -= 1;
      setSpeedUpTimer(speedUpTimerRef.current);
    }

    // Update targets
    const updatedTargets = targetsRef.current
      .map(target => {
        if (!target.isAlive) return target;

        if (target.type === 'moving' && target.vx !== undefined && target.vy !== undefined) {
          const newX = target.x + target.vx * delta;
          const newY = target.y + target.vy * delta;
          const canvas = canvasRef.current;
          if (canvas) {
            const padding = 20;
            if (newX < padding || newX > canvas.width - padding) target.vx *= -1;
            if (newY < padding || newY > canvas.height - padding) target.vy *= -1;
          }
          target.x = Math.max(20, Math.min(canvasRef.current?.width || 800, newX));
          target.y = Math.max(20, Math.min(canvasRef.current?.height || 400, newY));
          if (!target.trail) target.trail = [];
          target.trail.push({ x: target.x, y: target.y });
          if (target.trail.length > 8) target.trail.shift();
        }

        const lifeTime = (Date.now() - target.spawnTime) / 1000;
        if (target.type === 'ace' && lifeTime > 0.9) {
          target.isAlive = false;
          if (isRunningRef.current) {
            scoreRef.current -= 10;
            setScore(scoreRef.current);
          }
        } else if (target.type === 'static' && lifeTime > 1.0) {
          target.isAlive = false;
        }
        return target;
      })
      .filter(target => target.isAlive);

    targetsRef.current = updatedTargets;

    // Update particles
    const updatedParticles = particlesRef.current
      .map(p => ({
        ...p,
        x: p.x + p.vx * delta,
        y: p.y + p.vy * delta,
        vy: p.vy + 0.08 * delta * 60,
        life: p.life - 0.015 * delta * 60,
      }))
      .filter(p => p.life > 0);
    particlesRef.current = updatedParticles;
    setParticles(updatedParticles);

    // Update floating texts
    const updatedFloatingTexts = floatingTextsRef.current
      .map(ft => ({
        ...ft,
        life: ft.life - 0.015 * delta * 60,
        y: ft.y - delta * 80,
      }))
      .filter(ft => ft.life > 0);
    floatingTextsRef.current = updatedFloatingTexts;
    setFloatingTexts(updatedFloatingTexts);

    drawCanvas();
    animationRef.current = requestAnimationFrame(animate);
  };

  // --- PARTICLE EXPLOSION ---
  const createExplosion = (x: number, y: number, count: number = 40, isAce: boolean = false) => {
    // ⭐ Play sound based on hit type
    if (isAce) {
      playSound('ace');
    } else {
      playSound('hit');
    }

    const colors = isAce
      ? ['#ffd700', '#f59e0b', '#ffffff', '#fbbf24']
      : ['#c084fc', '#a855f7', '#ffffff', '#e879f9', '#8b5cf6'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x: x + (Math.random() - 0.5) * 5,
        y: y + (Math.random() - 0.5) * 5,
        vx: Math.cos(angle) * speed * (Math.random() * 0.6 + 0.4),
        vy: Math.sin(angle) * speed * (Math.random() * 0.6 + 0.4) - 2,
        radius: Math.random() * 4 + 2,
        color: color,
        life: 1,
        maxLife: 1,
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
    setParticles(particlesRef.current);
  };

  // --- HANDLE CANVAS CLICK ---
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Completely block clicks when test is complete
    if (testCompletedRef.current) return;
    if (!isRunningRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    shotsRef.current += 1;
    setShots(shotsRef.current);

    let hit = false;
    const currentTargets = targetsRef.current;

    for (let i = currentTargets.length - 1; i >= 0; i--) {
      const target = currentTargets[i];
      if (!target.isAlive) continue;

      const dx = target.x - mouseX;
      const dy = target.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= target.radius) {
        hit = true;
        const isAce = target.isAce || false;

        targetsRef.current = currentTargets.filter(t => t.id !== target.id);

        let points = 0;
        switch (target.type) {
          case 'static':
            points = 10;
            break;
          case 'moving':
            points = 15;
            break;
          case 'ace':
            points = 25;
            break;
        }

        const newCombo = comboRef.current + 1;
        comboRef.current = newCombo;
        setCombo(newCombo);
        if (newCombo > maxComboRef.current) {
          maxComboRef.current = newCombo;
          setMaxCombo(newCombo);
        }

        // ⭐ Combo sound
        if (newCombo === 3 || newCombo === 6 || newCombo === 10) {
          playSound('combo');
        }

        let multiplier = 1;
        let comboText = '';
        if (newCombo >= 10) {
          multiplier = 5;
          comboText = '🔥 x5!';
        } else if (newCombo >= 6) {
          multiplier = 3;
          comboText = '🔥 x3!';
        } else if (newCombo >= 3) {
          multiplier = 2;
          comboText = '🔥 x2!';
        }

        const totalPoints = points * multiplier;
        scoreRef.current += totalPoints;
        setScore(scoreRef.current);
        hitsRef.current += 1;
        setHits(hitsRef.current);
        isOnTargetRef.current = true;
        setIsOnTarget(true);
        setTimeout(() => {
          isOnTargetRef.current = false;
          setIsOnTarget(false);
        }, 100);

        createExplosion(target.x, target.y, isAce ? 60 : 40, isAce);

        if (comboText) {
          addFloatingText(target.x, target.y - 30, comboText, '#fbbf24');
        }

        break;
      }
    }

    if (!hit) {
      // ⭐ Miss sound
      playSound('miss');
      
      scoreRef.current -= 5;
      setScore(scoreRef.current);
      comboRef.current = 0;
      setCombo(0);
      createExplosion(mouseX, mouseY, 15, false);
      const grayParticles = particlesRef.current.map(p => ({
        ...p,
        color: 'rgba(150, 150, 150, 0.5)',
      }));
      particlesRef.current = grayParticles;
      setParticles(grayParticles);
      isOnTargetRef.current = false;
      setIsOnTarget(false);
    }
  };

  // --- START TEST ---
  const startTest = () => {
    if (isRunning) return;

    // ⭐ Start sound
    playSound('start');

    // Reset everything including finalStats
    finalStatsRef.current = {
      score: 0,
      hits: 0,
      misses: 0,
      accuracy: 0,
      maxCombo: 0,
      aceCount: 0,
    };
    setFinalStats({ ...finalStatsRef.current });
    testCompletedRef.current = false;
    setTestCompleted(false);

    isRunningRef.current = true;
    setIsRunning(true);
    setTimeLeft(TEST_DURATION);
    timeLeftRef.current = TEST_DURATION;
    scoreRef.current = 0;
    setScore(0);
    comboRef.current = 0;
    setCombo(0);
    maxComboRef.current = 0;
    setMaxCombo(0);
    hitsRef.current = 0;
    setHits(0);
    shotsRef.current = 0;
    setShots(0);
    targetsRef.current = [];
    particlesRef.current = [];
    setParticles([]);
    floatingTextsRef.current = [];
    setFloatingTexts([]);
    aceCountRef.current = 0;
    setAceCount(0);
    elapsedTimeRef.current = 0;
    spawnTimerRef.current = 0;
    aceTimerRef.current = 0;
    difficultyRef.current = 0;
    speedUpTimerRef.current = 0;
    setSpeedUpTimer(0);
    setSpeedUpText('');
    lastTimeRef.current = 0;

    timerIntervalRef.current = window.setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      elapsedTimeRef.current += 1;

      const newLevel = getDifficultyLevel(elapsedTimeRef.current);
      if (newLevel > difficultyRef.current) {
        difficultyRef.current = newLevel;
        const label = DIFFICULTY_CURVE[newLevel].label;
        speedUpTextRef.current = `⚡ ${label}`;
        setSpeedUpText(speedUpTextRef.current);
        speedUpTimerRef.current = 30;
        setSpeedUpTimer(30);
      }

      if (timeLeftRef.current <= 0) {
        // --- HARD STOP ---
        // 1. Kill the game loop immediately
        isRunningRef.current = false;
        setIsRunning(false);

        // 2. Clear all intervals
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = undefined;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }

        // 3. Capture final stats (frozen)
        captureFinalStats();

        // 4. Update both ref and state for overlay
        testCompletedRef.current = true;
        setTestCompleted(true);

        // 5. Draw the final overlay (reads from refs)
        drawCanvas();

        console.log('🏁 Test ended - overlay should appear');
      }
    }, 1000);

    animationRef.current = requestAnimationFrame(animate);
  };

  // --- RESIZE ---
  const resizeCanvas = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    setCanvasSize({ width, height });
    drawCanvas();
  };

  // --- SETUP ---
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (canvasSize.width > 0) {
      drawCanvas();
    }
  }, [canvasSize]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // --- MANUAL TEST FUNCTIONS ---
  useEffect(() => {
    window.testSpawn = () => {
      console.log('🧪 Manual spawn test triggered');
      const canvas = canvasRef.current;
      if (!canvas) {
        console.log('❌ Canvas not available');
        return;
      }
      console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
      console.log(`isRunning: ${isRunning}, isRunningRef: ${isRunningRef.current}`);
      console.log(`Current targets: ${targetsRef.current.length}`);
      spawnTarget();
      console.log('✅ Manual spawn attempted');
    };

    window.testState = () => {
      console.log('📊 Current state:');
      console.log(`  isRunning: ${isRunning}`);
      console.log(`  isRunningRef: ${isRunningRef.current}`);
      console.log(`  Targets: ${targetsRef.current.length}`);
      console.log(`  Time left: ${timeLeftRef.current}`);
      console.log(`  Score: ${scoreRef.current}`);
      console.log(`  Combo: ${comboRef.current}`);
    };

    return () => {
      delete window.testSpawn;
      delete window.testState;
    };
  }, [isRunning]);

  return (
    <TestLayout step={1} onContinue={() => navigate('/play/movement')}>
      <div className="flex w-full max-w-4xl flex-col items-center">
        <p className="mb-4 text-center text-sm text-text-secondary sm:text-base">
          Click the targets. Accuracy matters.
        </p>

        <div className="mb-4 flex gap-3">
          <button
            type="button"
            onClick={startTest}
            disabled={isRunning}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
              isRunning
                ? 'border border-border text-text-secondary cursor-not-allowed opacity-50'
                : 'border border-primary text-primary hover:bg-primary/10 hover:shadow-primary-glow'
            }`}
          >
            {isRunning ? 'Running...' : 'Start Test'}
          </button>
          <button
            type="button"
            onClick={() => {
              isRunningRef.current = false;
              setIsRunning(false);
              testCompletedRef.current = false;
              setTestCompleted(false);
              setTimeLeft(TEST_DURATION);
              timeLeftRef.current = TEST_DURATION;
              scoreRef.current = 0;
              setScore(0);
              comboRef.current = 0;
              setCombo(0);
              maxComboRef.current = 0;
              setMaxCombo(0);
              hitsRef.current = 0;
              setHits(0);
              shotsRef.current = 0;
              setShots(0);
              targetsRef.current = [];
              particlesRef.current = [];
              setParticles([]);
              floatingTextsRef.current = [];
              setFloatingTexts([]);
              aceCountRef.current = 0;
              setAceCount(0);
              elapsedTimeRef.current = 0;
              speedUpTimerRef.current = 0;
              setSpeedUpTimer(0);
              setSpeedUpText('');
              finalStatsRef.current = {
                score: 0,
                hits: 0,
                misses: 0,
                accuracy: 0,
                maxCombo: 0,
                aceCount: 0,
              };
              setFinalStats({ ...finalStatsRef.current });
              if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
              if (animationRef.current) cancelAnimationFrame(animationRef.current);
              timerIntervalRef.current = undefined;
              animationRef.current = undefined;
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
            minHeight: '350px',
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full cursor-crosshair"
            onClick={handleCanvasClick}
          />
        </div>

        {/* Continue and Retake buttons - only appears when test is complete */}
        {testCompletedRef.current && (
          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/play/movement')}
              className="rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-glow hover:shadow-primary-glow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue →
            </button>
            <button
              type="button"
              onClick={() => {
                // Reset everything and stay on this page
                isRunningRef.current = false;
                setIsRunning(false);
                testCompletedRef.current = false;
                setTestCompleted(false);
                setTimeLeft(TEST_DURATION);
                timeLeftRef.current = TEST_DURATION;
                scoreRef.current = 0;
                setScore(0);
                comboRef.current = 0;
                setCombo(0);
                maxComboRef.current = 0;
                setMaxCombo(0);
                hitsRef.current = 0;
                setHits(0);
                shotsRef.current = 0;
                setShots(0);
                targetsRef.current = [];
                particlesRef.current = [];
                setParticles([]);
                floatingTextsRef.current = [];
                setFloatingTexts([]);
                aceCountRef.current = 0;
                setAceCount(0);
                elapsedTimeRef.current = 0;
                speedUpTimerRef.current = 0;
                setSpeedUpTimer(0);
                setSpeedUpText('');
                finalStatsRef.current = {
                  score: 0,
                  hits: 0,
                  misses: 0,
                  accuracy: 0,
                  maxCombo: 0,
                  aceCount: 0,
                };
                setFinalStats({ ...finalStatsRef.current });
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                if (animationRef.current) cancelAnimationFrame(animationRef.current);
                timerIntervalRef.current = undefined;
                animationRef.current = undefined;
                drawCanvas();
              }}
              className="rounded-xl border border-primary px-8 py-3 text-base font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow hover:scale-[1.02] active:scale-[0.98]"
            >
              Retake
            </button>
          </div>
        )}
      </div>
    </TestLayout>
  );
}