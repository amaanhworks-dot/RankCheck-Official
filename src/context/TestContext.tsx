import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';
import { supabase } from '@/lib/supabase';
import { getOrCreateAnonId, getGamertag, saveGamertag } from '@/lib/anonId';

type TestContextValue = {
  gamertag: string;
  setGamertag: Dispatch<SetStateAction<string>>;
  aimScore: number | null;
  setAimScore: Dispatch<SetStateAction<number | null>>;
  dexScore: number | null;
  setDexScore: Dispatch<SetStateAction<number | null>>;
  reaxScore: number | null;
  setReaxScore: Dispatch<SetStateAction<number | null>>;
  compositeScore: number | null;
  anonId: string;
};

const TestContext = createContext<TestContextValue | undefined>(undefined);

// ⭐ Updated Rank Thresholds (0-100 scale)
export const RANKS = [
  { label: 'Radiant', color: '#fbbf24', minScore: 85 },
  { label: 'Immortal', color: '#c084fc', minScore: 70 },
  { label: 'Diamond', color: '#60a5fa', minScore: 55 },
  { label: 'Platinum', color: '#34d399', minScore: 40 },
  { label: 'Gold', color: '#f59e0b', minScore: 25 },
  { label: 'Bronze', color: '#d97706', minScore: 0 },
];

export function getRank(score: number): { label: string; color: string; minScore: number } {
  for (const rank of RANKS) {
    if (score >= rank.minScore) return rank;
  }
  return RANKS[RANKS.length - 1];
}

export function TestProvider({ children }: { children: ReactNode }) {
  // Initialize gamertag from localStorage
  const [gamertag, setGamertag] = useState(() => {
    const saved = getGamertag();
    return saved || '';
  });
  
  const [aimScore, setAimScore] = useState<number | null>(null);
  const [dexScore, setDexScore] = useState<number | null>(null);
  const [reaxScore, setReaxScore] = useState<number | null>(null);
  const [compositeScore, setCompositeScore] = useState<number | null>(null);
  const [anonId] = useState(getOrCreateAnonId);

  const hasSaved = useRef(false);

  // Save gamertag to localStorage whenever it changes
  useEffect(() => {
    if (gamertag.trim()) {
      saveGamertag(gamertag.trim());
    }
  }, [gamertag]);

  // ⭐ Calculate composite score (normalized 0-100 scale)
  useEffect(() => {
    if (aimScore !== null && dexScore !== null && reaxScore !== null) {
      // Normalize each score to 0-100 scale
      const normalizeAim = (score: number) => Math.min((score / 1000) * 100, 100);
      const normalizeMovement = (score: number) => Math.min((score / 60) * 100, 100);
      const normalizeReflex = (score: number) => Math.min((score / 1000) * 100, 100);

      const aimNorm = normalizeAim(aimScore);
      const moveNorm = normalizeMovement(dexScore);
      const reflexNorm = normalizeReflex(reaxScore);

      // Apply weights: Aim 40%, Movement 35%, Reflex 25%
      const composite = Math.round(
        (aimNorm * 0.4) + (moveNorm * 0.35) + (reflexNorm * 0.25)
      );

      setCompositeScore(composite);
      console.log(`📊 Composite calculated: ${composite}`);
      console.log(`   Aim: ${aimScore} → ${aimNorm.toFixed(1)}/100`);
      console.log(`   Movement: ${dexScore} → ${moveNorm.toFixed(1)}/100`);
      console.log(`   Reflex: ${reaxScore} → ${reflexNorm.toFixed(1)}/100`);
    } else {
      if (compositeScore !== null) {
        setCompositeScore(null);
      }
    }
  }, [aimScore, dexScore, reaxScore]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 TestContext State Update:', {
      gamertag: gamertag || '(empty)',
      aimScore,
      dexScore,
      reaxScore,
      compositeScore,
    });
  }, [gamertag, aimScore, dexScore, reaxScore, compositeScore]);

  // Auto-save
  useEffect(() => {
    console.log('🔄 Auto-save check triggered');
    console.log(`   aimScore: ${aimScore} (${aimScore === null ? 'null' : 'set'})`);
    console.log(`   dexScore: ${dexScore} (${dexScore === null ? 'null' : 'set'})`);
    console.log(`   reaxScore: ${reaxScore} (${reaxScore === null ? 'null' : 'set'})`);
    console.log(`   compositeScore: ${compositeScore} (${compositeScore === null ? 'null' : 'set'})`);
    console.log(`   gamertag: "${gamertag}" (${gamertag.trim() ? 'valid' : 'EMPTY'})`);
    console.log(`   hasSaved: ${hasSaved.current}`);

    if (aimScore === null || dexScore === null || reaxScore === null || compositeScore === null) {
      console.log('❌ Auto-save blocked: One or more scores are null');
      return;
    }

    if (!gamertag.trim()) {
      console.log('❌ Auto-save blocked: Gamertag is empty');
      return;
    }

    if (hasSaved.current) {
      console.log('❌ Auto-save blocked: Already saved');
      return;
    }

    console.log('✅ ALL CONDITIONS MET! Proceeding with save...');
    hasSaved.current = true;

    const saveScore = async () => {
      try {
        console.log('📤 Sending to Supabase:', {
          user_id: anonId,
          gamer_tag: gamertag.trim(),
          aim_score: aimScore,
          dex_score: dexScore,
          reax_score: reaxScore,
          composite_score: compositeScore,
        });

        const { error } = await supabase
          .from('user_scores')
          .insert({
            user_id: anonId,
            gamer_tag: gamertag.trim(),
            aim_score: aimScore,
            dex_score: dexScore,
            reax_score: reaxScore,
            composite_score: compositeScore,
          });

        if (error) {
          console.error('❌ Supabase insert error:', error);
        } else {
          console.log('✅ Score saved to Supabase:', {
            aimScore,
            dexScore,
            reaxScore,
            compositeScore,
          });
        }
      } catch (err) {
        console.error('❌ Unexpected error during save:', err);
      }
    };

    saveScore();
  }, [aimScore, dexScore, reaxScore, compositeScore, gamertag, anonId]);

  return (
    <TestContext.Provider
      value={{
        gamertag,
        setGamertag,
        aimScore,
        setAimScore,
        dexScore,
        setDexScore,
        reaxScore,
        setReaxScore,
        compositeScore,
        anonId,
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error('useTest must be used within a TestProvider');
  return ctx;
}