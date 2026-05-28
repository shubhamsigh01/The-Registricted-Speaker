import { LucideIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  color: string;
  onHold: () => void;
  holdDuration?: number;
}

export function ActionButton({ icon: Icon, label, color, onHold, holdDuration = 800 }: ActionButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout>();
  const progressTimerRef = useRef<NodeJS.Timeout>();

  const startHold = () => {
    setIsHolding(true);
    setProgress(0);

    const startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(newProgress);
    }, 16);

    holdTimerRef.current = setTimeout(() => {
      onHold();
      endHold();
    }, holdDuration);
  };

  const endHold = () => {
    setIsHolding(false);
    setProgress(0);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-transform active:scale-90"
        style={{ backgroundColor: color }}
      >
        <Icon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />

        {isHolding && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray={`${progress * 2.827} 282.7`}
              opacity="0.5"
            />
          </svg>
        )}
      </button>
      <span className="text-white text-xs md:text-sm font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
