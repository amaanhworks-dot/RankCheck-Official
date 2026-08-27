import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import TestLayout from '@/components/TestLayout';
import { useTest } from '@/context/TestContext';

// Key pool: 8 common keys + 3 rare keys
const COMMON_KEYS = ['Q', 'E', 'R', 'F', 'G', 'C', 'V', 'X'];
const RARE_KEYS = ['SHIFT', 'SPACE', 'TAB'];
const ALL_KEYS = [...COMMON_KEYS, ...RARE_KEYS];

const TEST_DURATION = 30;

// Key display mapping
const KEY_DISPLAY: Record<string, string> = {
  SHIFT: '⇧',
  SPACE: '␣',
  TAB: '⇥',
  Q: 'Q',
  E: 'E',
  R: 'R',
  F: 'F',
  G: 'G',
  C: 'C',
  V: 'V',
  X: 'X',
};

type Prompt = {
  keys: string[];
  isFalse: boolean;
  isBoss?: boolean;
};

type FeedbackType = 'idle' | 'correct' | 'wrong' | 'avoided' | 'penalty' | 'boss' | 'surge';

export default function KeybindTest() {
  const navigate = useNavigate();
  const { setReaxScore } = useTest();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Game state
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<FeedbackType>('idle');
  const [feedbackText, setFeedbackText] = useState('');
  const [isBossKey, setIsBossKey] = useState(false);
  const [isSurgeActive, setIsSurgeActive] = useState(false);
  const [surgeLevel, setSurgeLevel] = useState(0);

  // Prompt state
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);

  // Refs for game loop
  const timerIntervalRef = useRef<number>();
  const isRunningRef = useRef(false);
  const timeLeftRef = useRef(TEST_DURATION);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const falsePromptTimeoutRef = useRef<number>();
  const lastKeyRef = useRef<string | null>(null);
  const lastPromptWasFalseRef = useRef(false);
  const keyPressTimeRef = useRef<number>(0);
  const bossCounterRef = useRef(0);
  const wrongStreakRef = useRef(0);
  const surgeIntervalRef = useRef<number>();
  const surgeLevelRef = useRef(0);

  // Track rare key appearances (max 3 each)
  const rareKeyCounts = useRef<Record<string, number>>({
    SHIFT: 0,
    SPACE: 0,
    TAB: 0,
  });

  // --- PROMPT GENERATION ---
  const generatePrompt = (): Prompt => {
    const isFalse = Math.random() < 0.05; // 5% chance

    // Check if this should be a Boss Key (every 10th correct hit)
    const isBoss = !isFalse && bossCounterRef.current >= 9;

    // Get available keys (excluding the last one)
    let availableKeys = ALL_KEYS.filter(k => k !== lastKeyRef.current);

    // Filter out rare keys that have appeared 3+ times
    const filteredKeys = availableKeys.filter(k => {
      if (RARE_KEYS.includes(k)) {
        return rareKeyCounts.current[k] < 3;
      }
      return true;
    });

    // If all keys are filtered out (edge case), fall back to all keys
    const finalAvailableKeys = filteredKeys.length > 0 ? filteredKeys : availableKeys;

    // Weighted selection
    const getWeightedKey = (): string => {
      const rand = Math.random();
      // 15% chance for rare keys (5% each), but only if they haven't hit the limit
      const availableRare = RARE_KEYS.filter(k => 
        finalAvailableKeys.includes(k) && rareKeyCounts.current[k] < 3
      );

      if (rand < 0.05 && availableRare.length > 0) {
        const key = availableRare[Math.floor(Math.random() * availableRare.length)];
        rareKeyCounts.current[key] += 1;
        return key;
      }
      if (rand < 0.10 && availableRare.length > 0) {
        const key = availableRare[Math.floor(Math.random() * availableRare.length)];
        rareKeyCounts.current[key] += 1;
        return key;
      }
      if (rand < 0.15 && availableRare.length > 0) {
        const key = availableRare[Math.floor(Math.random() * availableRare.length)];
        rareKeyCounts.current[key] += 1;
        return key;
      }

      // 85% chance for common keys
      const commonAvailable = finalAvailableKeys.filter(k => COMMON_KEYS.includes(k));
      const key = commonAvailable[Math.floor(Math.random() * commonAvailable.length)] || finalAvailableKeys[0];
      return key;
    };

    const key = getWeightedKey();
    return { keys: [key], isFalse, isBoss };
  };

  // --- SHOW NEXT PROMPT ---
  const showNextPrompt = () => {
    if (!isRunningRef.current) return;

    let prompt = generatePrompt();

    // Prevent two false prompts in a row
    while (prompt.isFalse && lastPromptWasFalseRef.current) {
      prompt = generatePrompt();
    }

    // Reset boss counter if boss was shown
    if (prompt.isBoss) {
      bossCounterRef.current = 0;
    }

    lastPromptWasFalseRef.current = prompt.isFalse;
    lastKeyRef.current = prompt.keys[0];
    setIsBossKey(prompt.isBoss || false);

    setCurrentPrompt(prompt);
    setSequenceIndex(0);
    setIsWaitingForNext(false);
    setFeedback('idle');
    setFeedbackText('');
    keyPressTimeRef.current = Date.now();
  };

  // --- HANDLE KEY PRESS ---
  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isRunningRef.current || !currentPrompt || isWaitingForNext) return;

    let pressedKey = e.key;
    if (pressedKey === ' ') {
      pressedKey = 'SPACE';
    } else if (pressedKey === 'Shift') {
      pressedKey = 'SHIFT';
    } else if (pressedKey === 'Tab') {
      pressedKey = 'TAB';
    } else {
      pressedKey = pressedKey.toUpperCase();
    }

    const isValidKey = ALL_KEYS.includes(pressedKey);
    e.preventDefault();

    if (isValidKey) {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.add(pressedKey);
        setTimeout(() => {
          setPressedKeys(prev2 => {
            const newSet2 = new Set(prev2);
            newSet2.delete(pressedKey);
            return newSet2;
          });
        }, 200);
        return newSet;
      });
    }

    const reactionTime = Date.now() - keyPressTimeRef.current;

    // --- FALSE PROMPT HANDLING ---
    if (currentPrompt.isFalse) {
      if (falsePromptTimeoutRef.current) {
        clearTimeout(falsePromptTimeoutRef.current);
        falsePromptTimeoutRef.current = undefined;
      }
      scoreRef.current -= 20;
      setScore(scoreRef.current);
      setFeedback('penalty');
      setFeedbackText('PENALTY! -20');
      setCombo(0);
      comboRef.current = 0;
      wrongStreakRef.current += 1;
      setMisses(prev => prev + 1);
      missesRef.current++;

      if (wrongStreakRef.current >= 3) {
        scoreRef.current -= 20;
        setScore(scoreRef.current);
        setFeedbackText('SUDDEN DEATH! -20');
        wrongStreakRef.current = 0;
      }

      setIsWaitingForNext(true);
      setTimeout(() => {
        if (isRunningRef.current) showNextPrompt();
      }, 600);
      return;
    }

    // --- BOSS KEY HANDLING ---
    if (currentPrompt.isBoss) {
      if (pressedKey === currentPrompt.keys[0]) {
        if (reactionTime < 200) {
          const points = 10 + 50;
          scoreRef.current += points;
          setFeedback('boss');
          setFeedbackText(`BOSS! +${points}`);
          setScore(scoreRef.current);
        } else {
          scoreRef.current += 10;
          setFeedback('correct');
          setFeedbackText('+10');
          setScore(scoreRef.current);
        }
        const newCombo = comboRef.current + 1;
        comboRef.current = newCombo;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        hitsRef.current++;
        setHits(hitsRef.current);
        wrongStreakRef.current = 0;
        bossCounterRef.current = 0;

        setIsWaitingForNext(true);
        setTimeout(() => {
          if (isRunningRef.current) showNextPrompt();
        }, 500);
        return;
      } else {
        scoreRef.current -= 5;
        setScore(scoreRef.current);
        setFeedback('wrong');
        setFeedbackText('WRONG! -5');
        setCombo(0);
        comboRef.current = 0;
        wrongStreakRef.current += 1;
        setMisses(prev => prev + 1);
        missesRef.current++;

        if (wrongStreakRef.current >= 3) {
          scoreRef.current -= 20;
          setScore(scoreRef.current);
          setFeedbackText('SUDDEN DEATH! -20');
          wrongStreakRef.current = 0;
        }

        setIsWaitingForNext(true);
        setTimeout(() => {
          if (isRunningRef.current) showNextPrompt();
        }, 500);
        return;
      }
    }

    // --- NORMAL PROMPT HANDLING ---
    const expectedKey = currentPrompt.keys[sequenceIndex];

    if (pressedKey === expectedKey) {
      let points = 10;
      const isFast = reactionTime < 300;
      if (isFast) points += 5;

      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      let comboMultiplier = 1;
      if (newCombo >= 15) comboMultiplier = 5;
      else if (newCombo >= 10) comboMultiplier = 3;
      else if (newCombo >= 5) comboMultiplier = 2;

      const totalPoints = points * comboMultiplier;
      scoreRef.current += totalPoints;
      setScore(scoreRef.current);
      hitsRef.current++;
      setHits(hitsRef.current);
      wrongStreakRef.current = 0;
      bossCounterRef.current += 1;

      setFeedback('correct');
      setFeedbackText(`${isFast ? '⚡' : ''}+${totalPoints}`);

      setIsWaitingForNext(true);
      setTimeout(() => {
        if (isRunningRef.current) showNextPrompt();
      }, isFast ? 300 : 400);
    } else {
      scoreRef.current -= 5;
      setScore(scoreRef.current);
      setFeedback('wrong');
      setFeedbackText('WRONG! -5');
      setCombo(0);
      comboRef.current = 0;
      wrongStreakRef.current += 1;
      setMisses(prev => prev + 1);
      missesRef.current++;

      if (wrongStreakRef.current >= 3) {
        scoreRef.current -= 20;
        setScore(scoreRef.current);
        setFeedbackText('SUDDEN DEATH! -20');
        wrongStreakRef.current = 0;
      }

      setIsWaitingForNext(true);
      setTimeout(() => {
        if (isRunningRef.current) showNextPrompt();
      }, 500);
    }
  };

  // --- FALSE PROMPT TIMEOUT (Avoided) ---
  useEffect(() => {
    if (!currentPrompt?.isFalse || !isRunningRef.current) return;

    if (falsePromptTimeoutRef.current) {
      clearTimeout(falsePromptTimeoutRef.current);
      falsePromptTimeoutRef.current = undefined;
    }

    falsePromptTimeoutRef.current = window.setTimeout(() => {
      if (
        isRunningRef.current &&
        currentPrompt?.isFalse &&
        !isWaitingForNext &&
        feedback !== 'penalty'
      ) {
        scoreRef.current += 5;
        setScore(scoreRef.current);
        setFeedback('avoided');
        setFeedbackText('AVOIDED! +5');
        const newCombo = comboRef.current + 1;
        comboRef.current = newCombo;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        hitsRef.current++;
        setHits(hitsRef.current);
        setIsWaitingForNext(true);
        setTimeout(() => {
          if (isRunningRef.current) showNextPrompt();
        }, 500);
      }
    }, 1500);

    return () => {
      if (falsePromptTimeoutRef.current) {
        clearTimeout(falsePromptTimeoutRef.current);
        falsePromptTimeoutRef.current = undefined;
      }
    };
  }, [currentPrompt]);

  // --- SPEED SURGE ---
  useEffect(() => {
    if (!isRunning) return;

    surgeIntervalRef.current = window.setInterval(() => {
      if (!isRunningRef.current) return;

      surgeLevelRef.current += 5;
      const newSurgeLevel = Math.min(surgeLevelRef.current, 30);
      setSurgeLevel(newSurgeLevel);
      setIsSurgeActive(true);

      setFeedback('surge');
      setFeedbackText(`⚡ SPEED SURGE +${newSurgeLevel}%`);
      setTimeout(() => {
        setFeedback('idle');
        setFeedbackText('');
      }, 800);

      if (newSurgeLevel >= 30) {
        setFeedbackText('🔥 CHAOS MODE!');
        setTimeout(() => {
          setFeedback('idle');
          setFeedbackText('');
        }, 1000);
      }
    }, 10000);

    return () => {
      if (surgeIntervalRef.current) {
        clearInterval(surgeIntervalRef.current);
        surgeIntervalRef.current = undefined;
      }
    };
  }, [isRunning]);

  // --- START TEST ---
  const startTest = () => {
    if (isRunning) return;

    // Reset rare key counts
    rareKeyCounts.current = {
      SHIFT: 0,
      SPACE: 0,
      TAB: 0,
    };

    setIsRunning(true);
    isRunningRef.current = true;
    setTestCompleted(false);
    setTimeLeft(TEST_DURATION);
    timeLeftRef.current = TEST_DURATION;
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    comboRef.current = 0;
    setMaxCombo(0);
    setHits(0);
    hitsRef.current = 0;
    setMisses(0);
    missesRef.current = 0;
    setPressedKeys(new Set());
    setFeedback('idle');
    setFeedbackText('');
    setCurrentPrompt(null);
    setSequenceIndex(0);
    setIsWaitingForNext(false);
    setIsBossKey(false);
    setIsSurgeActive(false);
    setSurgeLevel(0);
    lastKeyRef.current = null;
    lastPromptWasFalseRef.current = false;
    bossCounterRef.current = 0;
    wrongStreakRef.current = 0;
    surgeLevelRef.current = 0;

    timerIntervalRef.current = window.setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        endTest();
      }
    }, 1000);

    setTimeout(() => {
      if (isRunningRef.current) showNextPrompt();
    }, 500);
  };

  // --- END TEST ---
  const endTest = () => {
    // 1. Freeze the final score
    const finalScore = scoreRef.current;
    
    // 2. Stop the game
    isRunningRef.current = false;
    setIsRunning(false);
    setTestCompleted(true);
    setCurrentPrompt(null);
    setFeedback('idle');
    setFeedbackText('');

    // 3. Clear all intervals
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = undefined;
    }
    if (falsePromptTimeoutRef.current) {
      clearTimeout(falsePromptTimeoutRef.current);
      falsePromptTimeoutRef.current = undefined;
    }
    if (surgeIntervalRef.current) {
      clearInterval(surgeIntervalRef.current);
      surgeIntervalRef.current = undefined;
    }

    // 4. ⭐ CRITICAL: Save score to Context
    setReaxScore(finalScore);

    // 5. Log the results
    console.log(`🏁 KeybindTest complete! Score: ${finalScore}`);
    console.log(`   Hits: ${hitsRef.current}, Misses: ${missesRef.current}, Max Combo: ${maxCombo}`);
    console.log(`   Boss Keys: ${bossCounterRef.current}, Speed Surge Level: ${surgeLevelRef.current}%`);
  };

  // --- KEYBOARD LISTENER ---
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentPrompt, isWaitingForNext]);

  // --- DRAW CANVAS ---
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    if (isSurgeActive && isRunning) {
      const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.3,
        width / 2, height / 2, height * 0.7
      );
      gradient.addColorStop(0, 'rgba(255, 100, 50, 0)');
      gradient.addColorStop(1, `rgba(255, 100, 50, ${pulse * 0.1})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.05)';
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

    // --- TOP-LEFT: SCORE ---
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
    ctx.fillText(`${score}`, 25, 40);

    if (isRunning && surgeLevel > 0) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
      ctx.font = '10px Orbitron, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`⚡ ${surgeLevel}%`, 25, 78);
    }

    // --- TOP-CENTER: TIMER ---
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const timerText = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
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

    // --- TOP-RIGHT: COMBO ---
    ctx.shadowBlur = 0;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px Orbitron, sans-serif';
    ctx.fillText('COMBO', width - 25, 20);

    if (combo > 0 && isRunning) {
      let multiplier = 'x2';
      if (combo >= 15) multiplier = 'x5';
      else if (combo >= 10) multiplier = 'x3';
      else if (combo >= 5) multiplier = 'x2';

      ctx.fillStyle = combo >= 10 ? '#fbbf24' : combo >= 5 ? '#c084fc' : '#ffffff';
      ctx.font = 'bold 28px Orbitron, sans-serif';
      ctx.shadowColor = combo >= 10 ? '#fbbf24' : '#a855f7';
      ctx.shadowBlur = 20;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`🔥 ${multiplier}`, width - 25, 40);
    } else if (isRunning) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = 'bold 28px Orbitron, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('--', width - 25, 40);
    }

    if (isRunning) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
      ctx.font = '10px Orbitron, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`👑 ${10 - bossCounterRef.current}`, width - 25, 72);
    }

    // --- CENTER: KEY PROMPT ---
    const centerX = width / 2;
    const centerY = height / 2 - 20;

    if (currentPrompt && isRunning) {
      const isFalse = currentPrompt.isFalse;
      const isBoss = currentPrompt.isBoss || false;
      const currentKey = currentPrompt.keys[0];

      let glowColor = '';
      let textColor = '#ffffff';
      let feedbackDisplayText = feedbackText;

      switch (feedback) {
        case 'correct':
          glowColor = 'rgba(68, 255, 136, 0.3)';
          textColor = '#44ff88';
          break;
        case 'wrong':
          glowColor = 'rgba(255, 68, 68, 0.3)';
          textColor = '#ff4444';
          break;
        case 'penalty':
          glowColor = 'rgba(255, 0, 0, 0.4)';
          textColor = '#ff0000';
          break;
        case 'avoided':
          glowColor = 'rgba(255, 255, 68, 0.3)';
          textColor = '#ffff44';
          break;
        case 'boss':
          glowColor = 'rgba(255, 215, 0, 0.4)';
          textColor = '#ffd700';
          break;
        case 'surge':
          glowColor = 'rgba(255, 100, 50, 0.3)';
          textColor = '#ff8844';
          break;
        default:
          glowColor = isFalse ? 'rgba(255, 0, 0, 0.1)' : isBoss ? 'rgba(255, 215, 0, 0.15)' : 'rgba(168, 85, 247, 0.1)';
          textColor = isFalse ? '#ff4444' : isBoss ? '#ffd700' : '#ffffff';
      }

      ctx.shadowBlur = 0;
      const keyGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 140
      );
      keyGlow.addColorStop(0, glowColor || 'rgba(168, 85, 247, 0.1)');
      keyGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = keyGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 140, 0, Math.PI * 2);
      ctx.fill();

      if (isBoss && feedback === 'idle') {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffd700';
        ctx.font = '40px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('👑', centerX, centerY - 90);
      }

      ctx.shadowColor = isBoss ? '#ffd700' : textColor === '#44ff88' ? '#44ff88' : textColor === '#ff4444' ? '#ff4444' : '#a855f7';
      ctx.shadowBlur = feedback !== 'idle' ? 40 : isBoss ? 30 : 20;
      ctx.fillStyle = textColor;
      ctx.font = isBoss ? 'bold 80px Orbitron, sans-serif' : 'bold 72px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayKey = KEY_DISPLAY[currentKey] || currentKey;
      ctx.fillText(displayKey, centerX, centerY - 10);

      if (isFalse && feedback === 'idle') {
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.12})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.8 + 0.2})`;
        ctx.font = 'bold 18px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('⚠️ DO NOT PRESS', centerX, centerY - 80);

        const skullX = centerX;
        const skullY = height - 120;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.font = '36px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', skullX, skullY);
        ctx.shadowBlur = 0;

        ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.4 + 0.2})`;
        ctx.font = '10px Orbitron, sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText('FALSE', skullX, skullY + 30);
      }

      if (isBoss && feedback === 'idle') {
        const pulse = Math.sin(Date.now() / 400) * 0.3 + 0.7;
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 215, 0, ${pulse * 0.1})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 60, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 215, 0, ${pulse * 0.5 + 0.3})`;
        ctx.font = '14px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('⚡ BOSS KEY', centerX, centerY + 60);
      }

      if (feedback !== 'idle') {
        ctx.shadowBlur = 0;
        ctx.fillStyle = textColor;
        ctx.font = 'bold 32px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(feedbackDisplayText, centerX, centerY - 90);
      }

    } else if (testCompleted) {
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 48px Orbitron, sans-serif';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 30;
      ctx.fillText('TEST COMPLETE', centerX, centerY - 20);

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '20px Orbitron, sans-serif';
      ctx.fillText(`Score: ${score}`, centerX, centerY + 50);
    } else {
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '24px Orbitron, sans-serif';
      ctx.fillText('Press START', centerX, centerY);
    }

    // --- BOTTOM: VIRTUAL KEYBOARD ---
    const keyboardY = height - 70;
    const keyWidth = 52;
    const keyHeight = 48;
    const gap = 6;
    const totalKeys = ALL_KEYS.length;
    const totalWidth = totalKeys * (keyWidth + gap) - gap;
    const startX = (width - totalWidth) / 2;

    ctx.shadowBlur = 0;
    ALL_KEYS.forEach((key, index) => {
      const x = startX + index * (keyWidth + gap);
      const y = keyboardY;
      const isPressed = pressedKeys.has(key);
      const isInPrompt = currentPrompt?.keys.includes(key) && !currentPrompt?.isFalse;

      let bgColor = 'rgba(255, 255, 255, 0.06)';
      let borderColor = 'rgba(255, 255, 255, 0.1)';
      let labelColor = 'rgba(255, 255, 255, 0.5)';

      if (isPressed) {
        bgColor = 'rgba(168, 85, 247, 0.4)';
        borderColor = 'rgba(168, 85, 247, 0.6)';
        labelColor = '#c084fc';
      } else if (isInPrompt && feedback === 'idle') {
        bgColor = 'rgba(168, 85, 247, 0.15)';
        borderColor = 'rgba(168, 85, 247, 0.3)';
        labelColor = 'rgba(168, 85, 247, 0.8)';
      }

      ctx.fillStyle = bgColor;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, keyWidth, keyHeight, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = labelColor;
      ctx.font = '14px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = KEY_DISPLAY[key] || key;
      ctx.fillText(label, x + keyWidth / 2, y + keyHeight / 2);
    });
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
  }, [canvasSize, score, combo, timeLeft, currentPrompt, isRunning, testCompleted, pressedKeys, feedback, feedbackText, isBossKey, isSurgeActive, surgeLevel]);

  return (
    <TestLayout step={3} onContinue={() => navigate('/results')}>
      <div className="flex w-full max-w-4xl flex-col items-center">
        <p className="mb-4 text-center text-sm text-text-secondary sm:text-base">
          Press the key that appears. React fast!
        </p>

        <div className="mb-4 flex gap-3">
          <button
            type="button"
            onClick={startTest}
            disabled={isRunning || testCompleted}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
              isRunning || testCompleted
                ? 'border border-border text-text-secondary cursor-not-allowed opacity-50'
                : 'border border-primary text-primary hover:bg-primary/10 hover:shadow-primary-glow'
            }`}
          >
            {isRunning ? 'Running...' : testCompleted ? 'Complete' : 'Start Test'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              isRunningRef.current = false;
              setTestCompleted(false);
              setTimeLeft(TEST_DURATION);
              timeLeftRef.current = TEST_DURATION;
              setScore(0);
              scoreRef.current = 0;
              setCombo(0);
              comboRef.current = 0;
              setMaxCombo(0);
              setHits(0);
              hitsRef.current = 0;
              setMisses(0);
              missesRef.current = 0;
              setCurrentPrompt(null);
              setSequenceIndex(0);
              setIsWaitingForNext(false);
              setFeedback('idle');
              setFeedbackText('');
              setPressedKeys(new Set());
              setIsBossKey(false);
              setIsSurgeActive(false);
              setSurgeLevel(0);
              lastKeyRef.current = null;
              lastPromptWasFalseRef.current = false;
              bossCounterRef.current = 0;
              wrongStreakRef.current = 0;
              surgeLevelRef.current = 0;
              rareKeyCounts.current = {
                SHIFT: 0,
                SPACE: 0,
                TAB: 0,
              };
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = undefined;
              }
              if (falsePromptTimeoutRef.current) {
                clearTimeout(falsePromptTimeoutRef.current);
                falsePromptTimeoutRef.current = undefined;
              }
              if (surgeIntervalRef.current) {
                clearInterval(surgeIntervalRef.current);
                surgeIntervalRef.current = undefined;
              }
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
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </TestLayout>
  );
}