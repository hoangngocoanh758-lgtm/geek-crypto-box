import React from 'react';
import { Lock, Star, Check } from 'lucide-react';
import { LEVELS } from '../data/levels';
import { getThemeForLevel } from '../theme/designSystem';

interface LevelSelectorProps {
  completedLevels: number[];
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ completedLevels, currentLevelId, onSelectLevel }) => {
  
  // Calculate stats
  const progress = Math.round((completedLevels.length / 100) * 100);
  
  // Get main theme for styling
  const mainTheme = getThemeForLevel(1);

  return (
    <div 
      className={`min-h-screen text-slate-200 p-6 sm:p-12 overflow-y-auto custom-scrollbar ${mainTheme.bgGradient}`}
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white tracking-tight">
            极客密码机
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 font-mono text-sm">
            逻辑 · 推理 · 破解
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-xs font-mono text-slate-500 mb-2">
              <span>系统进度</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-4">
          {LEVELS.map((level) => {
            const isCompleted = completedLevels.includes(level.id);
            const highestUnlocked = Math.max(0, ...completedLevels) + 1;
            const locked = level.id > highestUnlocked;
            const isCurrent = level.id === highestUnlocked;
            
            const theme = getThemeForLevel(level.id);

            return (
              <button
                key={level.id}
                disabled={locked}
                onClick={() => onSelectLevel(level.id)}
                className={`
                  relative aspect-square rounded-lg p-3 flex flex-col items-center justify-center border transition-all duration-200
                  ${locked 
                    ? 'bg-[#0f172a] border-slate-800 text-slate-700 cursor-not-allowed' 
                    : 'hover:-translate-y-1 hover:border-indigo-500/50 cursor-pointer'
                  }
                  ${isCurrent 
                    ? `bg-indigo-900/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50`
                    : !locked 
                      ? 'bg-slate-800 border-slate-700' 
                      : ''
                  }
                  ${isCompleted ? 'bg-slate-800/50 border-emerald-900/30' : ''}
                `}
              >
                {/* Milestone Marker */}
                {level.isMilestone && (
                  <div className="absolute top-2 right-2">
                    <Star className={`w-3 h-3 ${locked ? 'text-slate-800' : 'text-amber-500'}`} fill={locked ? "none" : "currentColor"} />
                  </div>
                )}

                {/* Status Icon */}
                <div className="mb-1">
                  {locked ? (
                    <Lock className="w-4 h-4" />
                  ) : isCompleted ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <span className={`text-xl font-bold font-mono ${isCurrent ? 'text-indigo-400' : 'text-slate-300'}`}>{level.id}</span>
                  )}
                </div>
                
                {/* Level Number for locked/completed small view */}
                {(locked || isCompleted) && (
                   <span className="text-[10px] absolute bottom-2 font-mono opacity-30">{level.id}</span>
                )}
                
                {/* Active Indicator */}
                {isCurrent && (
                  <div className="absolute inset-0 rounded-lg ring-1 ring-indigo-400/30 animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
