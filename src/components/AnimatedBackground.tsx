import { useEffect, useRef } from 'react';
// ⭐ Import the image directly
import bgImage from '@/assets/bg-games.jpg';

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const animationFrame = useRef<number>();

  useEffect(() => {
    console.log('✅ AnimatedBackground mounted');

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      targetX.current = x;
      targetY.current = y;
    };

    const animate = () => {
      const speed = 0.06;
      currentX.current += (targetX.current - currentX.current) * speed;
      currentY.current += (targetY.current - currentY.current) * speed;

      if (containerRef.current) {
        containerRef.current.style.transform =
          `translate(${currentX.current}px, ${currentY.current}px)`;
      }

      animationFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none will-change-transform"
    >
      {/* ⭐ Using img tag instead of background-image */}
      <img
        src={bgImage}
        alt="Background"
        className="w-full h-full object-cover scale-105 animate-drift"
        style={{
          opacity: 0.1,
          filter: 'blur(2px)',
        }}
      />

      <style>{`
        @keyframes drift {
          0% { transform: scale(1) rotate(-0.5deg); }
          100% { transform: scale(1.03) rotate(0.5deg); }
        }
        .animate-drift {
          animation: drift 30s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}