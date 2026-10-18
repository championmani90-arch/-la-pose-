import React from 'react';
import { Lock } from 'lucide-react';
import { DiceTheme } from '../types/game';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  isKept?: boolean;
  onClick?: () => void;
  selectable?: boolean;
  theme?: DiceTheme;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  isKept = false,
  onClick,
  selectable = false,
  theme = 'ivory',
  size = 'md',
  label,
}) => {
  // Map value (1-6) to class for rotation
  const showClass = `show-${value || 1}`;

  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-20 h-20 text-base',
  };

  const pipSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  const renderFace = (faceNumber: number) => {
    const isOne = faceNumber === 1;

    return (
      <div className={`dice-face face-${faceNumber} p-1.5 flex items-center justify-center`}>
        {faceNumber === 1 && (
          <div className={`${pipSizes[size]} rounded-full dice-pip pip-red scale-125`} />
        )}

        {faceNumber === 2 && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-end"><div className={`${pipSizes[size]} rounded-full dice-pip`} /></div>
            <div className="flex justify-start"><div className={`${pipSizes[size]} rounded-full dice-pip`} /></div>
          </div>
        )}

        {faceNumber === 3 && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-end"><div className={`${pipSizes[size]} rounded-full dice-pip`} /></div>
            <div className="flex justify-center"><div className={`${pipSizes[size]} rounded-full dice-pip`} /></div>
            <div className="flex justify-start"><div className={`${pipSizes[size]} rounded-full dice-pip`} /></div>
          </div>
        )}

        {faceNumber === 4 && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
            </div>
            <div className="flex justify-between">
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
            </div>
          </div>
        )}

        {faceNumber === 5 && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
            </div>
            <div className="flex justify-center">
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
            </div>
            <div className="flex justify-between">
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
            </div>
          </div>
        )}

        {faceNumber === 6 && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
            </div>
            <div className="flex justify-between">
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
            </div>
            <div className="flex justify-between">
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
              <div className={`${pipSizes[size]} rounded-full dice-pip`} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div
        onClick={selectable ? onClick : undefined}
        className={`dice-scene relative ${sizeClasses[size]} theme-${theme} ${
          selectable ? 'cursor-pointer group' : ''
        } transition-transform duration-200 ${
          isKept ? 'scale-105 -translate-y-2' : ''
        }`}
        style={{ perspective: '800px' }}
      >
        <div
          className={`dice-cube w-full h-full ${isRolling ? 'is-rolling' : showClass}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {renderFace(1)}
          {renderFace(2)}
          {renderFace(3)}
          {renderFace(4)}
          {renderFace(5)}
          {renderFace(6)}
        </div>

        {/* Kept badge */}
        {isKept && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-1 rounded-full shadow-lg z-20 flex items-center justify-center">
            <Lock className="w-3 h-3 stroke-[2.5]" />
          </div>
        )}

        {/* Hover hint if selectable */}
        {selectable && !isKept && !isRolling && (
          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-amber-400/60 pointer-events-none transition-colors" />
        )}
      </div>

      {label && (
        <span className="text-[11px] font-medium text-slate-400 tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};
