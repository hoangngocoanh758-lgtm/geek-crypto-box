import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Zap, BarChart3, Lock, RefreshCw } from 'lucide-react';
import { Theme } from '../theme/designSystem';
import { COLORS, GuessHistory } from '../data/gameData';

interface AIAnalyticsProps {
  theme: Theme;
  history: GuessHistory[];
  difficulty: number;
  remainingAttempts: number;
}

export const AIAnalytics: React.FC<AIAnalyticsProps> = ({ theme, history, difficulty, remainingAttempts }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [entropy, setEntropy] = useState(100);
  const [possibleCombinations, setPossibleCombinations] = useState(Math.pow(6, difficulty));

  const lastHistory = history[history.length - 1];

  const excludedColors = new Set<number>();
  history.forEach(item => {
    if (item.blackDots === 0 && item.whiteDots === 0) {
      item.guess.forEach(index => {
        excludedColors.add(index);
      });
    }
  });

  const availableColorIndices = COLORS.map((_, index) => index).filter(
    index => !excludedColors.has(index)
  );

  const colorStats = COLORS.map((_, index) => {
    let appearances = 0;
    let positiveRounds = 0;
    let zeroRounds = 0;
    history.forEach(item => {
      if (item.guess.includes(index)) {
        appearances += 1;
        const total = item.blackDots + item.whiteDots;
        if (total === 0) {
          zeroRounds += 1;
        } else {
          positiveRounds += 1;
        }
      }
    });
    return { index, appearances, positiveRounds, zeroRounds };
  });

  const strongCandidateColors = colorStats
    .filter(stat => stat.appearances > 0 && stat.positiveRounds > 0 && stat.zeroRounds === 0)
    .map(stat => stat.index);

  const weakCandidateColors = colorStats
    .filter(
      stat =>
        stat.appearances > 0 &&
        stat.positiveRounds > 0 &&
        stat.zeroRounds > 0 &&
        !excludedColors.has(stat.index)
    )
    .map(stat => stat.index);

  const getSuggestedGuess = (): number[] | null => {
    if (difficulty <= 0) {
      return null;
    }
    if (history.length === 0) {
      const result: number[] = [];
      for (let i = 0; i < difficulty; i++) {
        result.push(i % COLORS.length);
      }
      return result;
    }
    if (!lastHistory) {
      return null;
    }
    const totalMatches = lastHistory.blackDots + lastHistory.whiteDots;
    if (totalMatches === 0) {
      if (availableColorIndices.length === 0) {
        return null;
      }
      const result: number[] = [];
      for (let i = 0; i < difficulty; i++) {
        const index = availableColorIndices[i % availableColorIndices.length];
        result.push(index);
      }
      return result;
    }
    const result: number[] = [];
    for (let i = 0; i < difficulty; i++) {
      const colorIndex =
        lastHistory.guess[i] ??
        availableColorIndices[i % availableColorIndices.length] ??
        0;
      result.push(colorIndex);
    }
    return result;
  };

  const suggestedGuess = getSuggestedGuess();

  // Simulate analysis on history change
  useEffect(() => {
    setIsAnalyzing(true);
    
    // Simulate calculation delay
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      
      // Update simulated stats
      if (history.length > 0) {
        // Drastic reduction simulation
        const reductionFactor = 0.1 + (Math.random() * 0.1); // 10-20% remaining each step
        setPossibleCombinations(prev => Math.max(1, Math.floor(prev * reductionFactor)));
        setEntropy(prev => Math.max(0, prev - (20 + Math.random() * 10)));
      } else {
        setPossibleCombinations(Math.pow(6, difficulty));
        setEntropy(100);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [history, difficulty]);

  return (
    <div className={`space-y-6 animate-fade-in`}>
      
      {/* Main Status Hub */}
      <div className={`rounded-xl p-6 border relative overflow-hidden ${theme.cardBg} ${theme.cardBorder}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent skew-x-12 animate-pulse opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-indigo-900/50 text-indigo-400`}>
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-bold text-lg text-slate-100`}>AI 分析核心</h3>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-indigo-400 animate-ping' : 'bg-emerald-500'}`}></span>
                  <span className={`text-xs font-mono text-slate-500`}>
                    {isAnalyzing ? '正在计算矩阵…' : '系统待命'}
                  </span>
                </div>
              </div>
            </div>
            <Activity className={`w-6 h-6 text-indigo-500 opacity-50`} />
          </div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg bg-slate-950/50 border border-slate-800`}>
              <div className={`text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1`}>
                <Lock className="w-3 h-3" />
                剩余可能组合数
              </div>
              <div className={`text-2xl font-mono font-bold text-slate-200`}>
                {possibleCombinations.toLocaleString()}
              </div>
              <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-indigo-500 transition-all duration-500`} 
                  style={{ width: `${Math.min(100, (possibleCombinations / Math.pow(6, difficulty)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className={`p-4 rounded-lg bg-slate-950/50 border border-slate-800`}>
              <div className={`text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1`}>
                <Zap className="w-3 h-3" />
                系统熵值
              </div>
              <div className={`text-2xl font-mono font-bold text-slate-200`}>
                {entropy.toFixed(1)}%
              </div>
               <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-emerald-500 transition-all duration-500`} 
                  style={{ width: `${entropy}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Input Monitor / Last Action */}
          <div className={`rounded-lg p-4 bg-slate-950/30 border border-slate-800`}>
            <h4 className={`text-xs uppercase tracking-wider font-bold mb-3 text-slate-400 flex items-center gap-2`}>
              <RefreshCw className="w-3 h-3" />
              最新输入解析
            </h4>
            
            {history.length > 0 ? (
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {history[history.length - 1].guess.map((colorIndex, i) => (
                    <div key={i} className={`w-4 h-4 rounded-sm ${COLORS[colorIndex].class} ring-1 ring-slate-700`}></div>
                  ))}
                </div>
                <div className={`text-xs text-indigo-400 font-mono`}>
                   -{((100 - entropy) * 0.1).toFixed(2)} 位信息
                </div>
              </div>
            ) : (
              <div className={`text-xs text-slate-600 font-mono text-center py-2`}>
                等待数据流输入…
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`rounded-xl p-6 border ${theme.cardBg} ${theme.cardBorder}`}>
        <h3 className={`font-bold mb-4 text-slate-200 flex items-center gap-2`}>
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          策略引擎
        </h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className={`p-3 rounded border border-indigo-900/30 bg-indigo-900/10 text-sm text-slate-300`}>
              <span className="font-bold text-indigo-400 block mb-1 text-xs uppercase tracking-wider">起手建议</span> 
              建议优先使用不同颜色的组合，以尽快探测哪些颜色存在于序列中。
            </div>
          ) : (
             <div className={`p-3 rounded border border-indigo-900/30 bg-indigo-900/10 text-sm text-slate-300`}>
              <span className="font-bold text-indigo-400 block mb-1 text-xs uppercase tracking-wider">分析结论</span> 
              <div className="space-y-2">
                <div className="text-xs text-slate-300">
                  最近一轮反馈为
                  <span className="ml-1">
                    黑点 {lastHistory?.blackDots ?? 0}，白点 {lastHistory?.whiteDots ?? 0}
                  </span>
                  。黑点越多，说明当前位置越接近正确解；白点表示颜色对但位置错。
                </div>
                {strongCandidateColors.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="shrink-0">高度怀疑存在的颜色：</span>
                    <div className="flex gap-1">
                      {strongCandidateColors.map(index => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full ring-1 ring-emerald-400/60"
                          style={{ backgroundColor: COLORS[index].hex }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
                {weakCandidateColors.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="shrink-0">可以继续测试的颜色：</span>
                    <div className="flex gap-1">
                      {weakCandidateColors.map(index => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full ring-1 ring-amber-400/60"
                          style={{ backgroundColor: COLORS[index].hex }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
                {excludedColors.size > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="shrink-0">建议排除颜色：</span>
                    <div className="flex gap-1">
                      {Array.from(excludedColors).map(index => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full ring-1 ring-slate-900/40"
                          style={{ backgroundColor: COLORS[index].hex }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
                {suggestedGuess && (
                  <div className="flex flex-col gap-1 text-xs text-slate-300">
                    <span>示例下一步尝试：</span>
                    <div className="flex gap-2">
                      {suggestedGuess.map((colorIndex, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full ring-1 ring-slate-900/50"
                          style={{ backgroundColor: COLORS[colorIndex].hex }}
                        ></div>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      建议保留有反馈的颜色，少用或避免上轮完全无反馈的颜色。
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
