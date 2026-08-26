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
import { getOrCreateAnonId } from '@/lib/anonId';

type TestContextValue = {
  gamertag: string;
  setGamertag: Dispatch<SetStateAction<string>>;
  aimScore: number | null;
  setAimScore: Dispatch<SetStateAction<number | null>>;
  dexScore: number | null;
  setDexScore: Dispatch<SetStateAction<number | null>>;
  reaxScore: number | null;
  setReaxScore: Dispatch<SetStateAction<number | null>>;
  anonId: string;
};

const TestContext = createContext<TestContextValue | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [gamertag, setGamertag] = useState('');
  const [aimScore, setAimScore] = useState<number | null>(null);
  const [dexScore, setDexScore] = useState<number | null>(null);
  const [reaxScore, setReaxScore] = useState<number | null>(null);
  const [anonId] = useState(getOrCreateAnonId); // run once, stable value

  // Ref to guard against multiple saves
  const hasSaved = useRef(false);

  // Auto-save when all three scores are present
  useEffect(() => {
    // Only proceed if we have all scores, gamertag, and haven't saved yet
    if (aimScore === null || dexScore === null || reaxScore === null) return;
    if (!gamertag.trim()) {
      console.warn('Cannot save score: gamertag is empty');
      return;
    }
    if (hasSaved.current) return;

    // Mark as saved before the async operation to prevent double-save
    hasSaved.current = true;

    const saveScore = async () => {
      try {
        const { error } = await supabase
          .from('user_scores')
          .insert({
            user_id: anonId,
            gamer_tag: gamertag.trim(),
            aim_score: aimScore,
            dex_score: dexScore,
            reax_score: reaxScore,
          });

        if (error) {
          console.error('Supabase insert error:', error);
        } else {
          console.log('✅ Score saved to Supabase:', { aimScore, dexScore, reaxScore });
        }
      } catch (err) {
        console.error('Unexpected error during save:', err);
      }
    };

    saveScore();
  }, [aimScore, dexScore, reaxScore, gamertag, anonId]);

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