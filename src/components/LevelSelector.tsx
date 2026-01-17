import React, { useState } from 'react';
import { Lock, Star, Check } from 'lucide-react';
import { LEVELS } from '../data/levels';
import { getThemeForLevel } from '../theme/designSystem';

interface LevelSelectorProps {
  completedLevels: number[];
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  username: string | null;
  authError: string | null;
  authLoading: boolean;
  onAuth: (identifier: string, password: string) => void;
  onSignOut: () => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ completedLevels, currentLevelId, onSelectLevel, username, authError, authLoading, onAuth, onSignOut }) => {
  
  const progress = Math.round((completedLevels.length / 100) * 100);
  const mainTheme = getThemeForLevel(1);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('123456');

  return (
    <div 
      className={`min-h-screen text-slate-200 p-6 sm:p-12 overflow-y-auto custom-scrollbar ${mainTheme.bgGradient}`}
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        
        <div className="mb-12">
          <div className="text-center mb-8">
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
          <div className="max-w-2xl mx-auto">
            {username ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg">
                <div className="text-xs sm:text-sm font-mono text-slate-200">
                  当前用户: <span className="text-indigo-300">{username}</span>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="text-xs font-mono px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300"
                >
                  退出登录
                </button>
              </div>
            ) : (
              <form
                className="flex flex-col sm:flex-row items-stretch gap-2 px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg"
                onSubmit={e => {
                  e.preventDefault();
                  if (!identifier.trim()) {
                    return;
                  }
                  onAuth(identifier.trim(), password);
                }}
              >
                <input
                  type="text"
                  placeholder="用户名（例如 alice）"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="flex-1 px-3 py-2 rounded bg-slate-800 text-slate-100 text-xs sm:text-sm font-mono border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full sm:w-28 px-3 py-2 rounded bg-slate-800 text-slate-100 text-xs sm:text-sm font-mono border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full sm:w-32 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm font-mono text-white"
                >
                  {authLoading ? '处理中…' : '登录 / 注册'}
                </button>
              </form>
            )}
            {authError && (
              <div className="mt-2 text-[11px] text-rose-400 font-mono px-1">
                {authError}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-4">
          {LEVELS.map((level) => {
            const isCompleted = completedLevels.includes(level.id);
            const highestUnlocked = Math.max(0, ...completedLevels) + 1;
            const locked = level.id > highestUnlocked;
            const isCurrent = level.id === currentLevelId;

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
