import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, Brain, Smile, Meh, Frown, Lightbulb, Trophy, ArrowLeft } from 'lucide-react';
import { COLORS, GameStatus, AiMood, GuessHistory } from '../data/gameData';
import { LevelConfig } from '../data/levels';
import { Theme } from '../theme/designSystem';
import { AIAnalytics } from './AIAnalytics';

type ExtendedWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

interface GameLevelProps {
  level: LevelConfig;
  theme: Theme;
  onComplete: () => void;
  onExit: () => void;
}

export const GameLevel: React.FC<GameLevelProps> = ({ level, theme, onComplete, onExit }) => {
  const [secretCode, setSecretCode] = useState<number[]>([]);
  const [currentGuess, setCurrentGuess] = useState<number[]>([]);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [remainingAttempts, setRemainingAttempts] = useState(level.maxAttempts);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [aiMood, setAiMood] = useState<AiMood>('thinking');
  const [aiMessage, setAiMessage] = useState(level.description || '系统已初始化。');
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeGame = useCallback(() => {
    const newCode = generateSecretCode(level.difficulty);
    setSecretCode(newCode);
    setCurrentGuess(new Array(level.difficulty).fill(0));
    setGuessHistory([]);
    setGameStatus('playing');
    setRemainingAttempts(level.maxAttempts);
    setAiMood('thinking');
    setAiMessage(level.description || '系统就绪，等待输入序列。');
  }, [level]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const w = window as ExtendedWindow;
      const AudioContextClass = w.AudioContext || w.webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const generateSecretCode = (length: number): number[] => {
    const code: number[] = [];
    for (let i = 0; i < length; i++) {
      code.push(Math.floor(Math.random() * COLORS.length));
    }
    return code;
  };

  const checkGuess = (guess: number[], secret: number[]) => {
    let blackDots = 0;
    let whiteDots = 0;
    const secretCopy = [...secret];
    const guessCopy = [...guess];

    for (let i = 0; i < guess.length; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        blackDots++;
        secretCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }

    for (let i = 0; i < guess.length; i++) {
      if (guessCopy[i] !== -2) {
        const index = secretCopy.indexOf(guessCopy[i]);
        if (index !== -1) {
          whiteDots++;
          secretCopy[index] = -1;
        }
      }
    }

    return { blackDots, whiteDots };
  };

  const handleColorButton = (index: number) => {
    if (gameStatus !== 'playing') return;
    const newGuess = [...currentGuess];
    newGuess[index] = (newGuess[index] + 1) % COLORS.length;
    setCurrentGuess(newGuess);
  };

  const playSubmitSound = () => {
    if (!soundEnabled) return;
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(900, now);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  };

  const handleEnter = () => {
    if (gameStatus !== 'playing') return;
    playSubmitSound();
    
    const result = checkGuess(currentGuess, secretCode);
    const newHistory = [...guessHistory, { guess: [...currentGuess], ...result }];
    setGuessHistory(newHistory);
    
    const newRemainingAttempts = remainingAttempts - 1;
    setRemainingAttempts(newRemainingAttempts);
    
    if (result.blackDots === level.difficulty) {
      setGameStatus('won');
      setAiMood('happy');
      setAiMessage('序列完全匹配，访问授权通过。');
      setTimeout(onComplete, 1500);
    } else if (newRemainingAttempts === 0) {
      setGameStatus('lost');
      setAiMood('sad');
      setAiMessage(`访问被拒绝，正确序列为：${secretCode.map(i => COLORS[i].name).join(', ')}`);
    } else {
       updateAiAssistant(result.blackDots, result.whiteDots);
    }
  };

  const updateAiAssistant = (blackDots: number, whiteDots: number) => {
    if (blackDots > 0 || whiteDots > 0) {
      if (blackDots >= level.difficulty / 2) {
        setAiMood('happy');
        setAiMessage(`高相关度：${blackDots} 个位置完全匹配。`);
      } else {
        setAiMood('neutral');
        setAiMessage(`部分相关：${blackDots} 个位置正确，${whiteDots} 个颜色正确。`);
      }
    } else {
      setAiMood('sad');
      setAiMessage('未检测到有效相关，请调整策略。');
    }
  };

  const getSphereStyle = (hex: string): React.CSSProperties => {
    return {
      backgroundColor: hex,
    };
  };

  const getAiIcon = () => {
    const iconClass = `w-8 h-8 ${theme.accent}`;
    switch (aiMood) {
      case 'happy':
        return <Smile className={iconClass} />;
      case 'sad':
        return <Frown className={iconClass} />;
      case 'neutral':
        return <Meh className={iconClass} />;
      default:
        return <Brain className={`${iconClass} animate-pulse`} />;
    }
  };

  return (
    <div 
      className={`min-h-screen p-4 flex flex-col items-center justify-center transition-all duration-700 ${theme.bgGradient}`}
    >
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center">
        
        {/* Header / Nav */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-8">
          <button onClick={onExit} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${theme.buttonSecondary}`}>
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">返回关卡地图</span>
          </button>
          
          <h1 className={`text-2xl font-bold font-mono ${theme.textPrimary} flex items-center gap-2 tracking-tight`}>
             <span className="text-indigo-500 opacity-80 text-sm font-bold uppercase tracking-widest mr-2">安全关卡 {level.id}</span>
             {level.title}
          </h1>

          <div className={`px-4 py-2 rounded-lg ${theme.cardBg} ${theme.textSecondary} border ${theme.cardBorder} font-mono text-xs`}>
             {level.difficulty} 位加密序列
          </div>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Game Machine */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl p-8 shadow-2xl border relative overflow-hidden transition-all duration-500 ${theme.cardBg} ${theme.cardBorder}`}>
              
              {/* Screen Area */}
              <div className="bg-slate-950/50 rounded-lg p-6 mb-6 shadow-inner border border-slate-800 relative">
                <div className="flex justify-between items-center mb-4 font-mono text-xs text-slate-500 uppercase tracking-wider">
                   <span>剩余尝试次数：<span className="text-slate-200">{remainingAttempts}</span></span>
                   <span className={theme.accent}>状态：{gameStatus === 'playing' ? '进行中' : gameStatus === 'won' ? '成功' : '失败'}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">可用颜色</span>
                  <div className="flex gap-2">
                    {COLORS.map((color, index) => (
                      <div
                        key={index}
                        className="w-5 h-5 rounded-full ring-1 ring-slate-900/50"
                        style={getSphereStyle(color.hex)}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  {getAiIcon()}
                  <p className="text-sm font-mono text-slate-300">
                    {aiMessage}
                  </p>
                </div>

                 {/* History Scroll */}
                 <div className="space-y-2 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {guessHistory.map((history, index) => (
                      <div key={index} className="flex items-center gap-4 p-2 rounded bg-slate-800/50 border border-slate-700/50">
                        <span className={`text-xs font-mono w-6 text-slate-500`}>#{String(index + 1).padStart(2, '0')}</span>
                        <div className="flex gap-3">
                          {history.guess.map((colorIndex, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full ring-1 ring-slate-900/50"
                              style={getSphereStyle(COLORS[colorIndex].hex)}
                            ></div>
                          ))}
                        </div>
                        <div className="flex gap-1 ml-auto">
                          {Array.from({ length: history.blackDots }).map((_, i) => (
                            <div
                              key={`black-${i}`}
                              className="w-2 h-2 bg-black rounded-full shadow-[0_0_4px_rgba(0,0,0,0.6)]"
                            ></div>
                          ))}
                          {Array.from({ length: history.whiteDots }).map((_, i) => (
                            <div
                              key={`white-${i}`}
                              className="w-2 h-2 bg-white rounded-full ring-1 ring-slate-500/60 shadow-[0_0_4px_rgba(255,255,255,0.7)]"
                            ></div>
                          ))}
                          {history.blackDots === 0 && history.whiteDots === 0 && (
                             <span className="text-[10px] text-slate-600 font-mono">无匹配</span>
                          )}
                        </div>
                      </div>
                    ))}
                 </div>

                 {/* Input Area */}
                 {gameStatus === 'playing' && (
                   <div className="flex justify-center gap-3 sm:gap-6 py-6 border-t border-slate-800/50">
                     {currentGuess.map((colorIndex, index) => (
                       <button
                         key={index}
                         onClick={() => handleColorButton(index)}
                         className="w-12 h-12 sm:w-16 sm:h-16 rounded-full transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 ring-2 ring-slate-900/50"
                         style={getSphereStyle(COLORS[colorIndex].hex)}
                       />
                     ))}
                   </div>
                 )}

                 {/* Game Over Message */}
                 {gameStatus !== 'playing' && (
                    <div className="text-center py-6 animate-fade-in border-t border-slate-800/50 mt-4">
                      {gameStatus === 'won' ? (
                        <div className={`text-2xl font-bold text-emerald-400 flex items-center justify-center gap-3 font-mono`}>
                          <Trophy className="w-8 h-8" />
                          <span>解密成功</span>
                      </div>
                    ) : (
                      <div className="text-rose-400 text-lg font-bold font-mono">
                          解密失败<br/>
                          正确序列：{secretCode.map(i => COLORS[i].name).join(', ')}
                        </div>
                      )}
                    </div>
                 )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleEnter}
                  disabled={gameStatus !== 'playing'}
                  className={`px-10 py-3 font-bold rounded-lg shadow-lg transform transition-all tracking-wider font-mono
                    ${gameStatus === 'playing' ? theme.buttonPrimary : 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-600'}
                    active:scale-95`}
                >
                  提交
                </button>
                
                <button
                  onClick={initializeGame}
                  className={`p-3 rounded-lg shadow-lg transition-all ${theme.buttonSecondary} hover:scale-105`}
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-3 rounded-lg shadow-lg transition-all ${theme.buttonSecondary} hover:scale-105`}
                >
                  {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>
              </div>

            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <AIAnalytics 
              theme={theme}
              history={guessHistory}
              difficulty={level.difficulty}
              remainingAttempts={remainingAttempts}
            />

             <div className={`rounded-xl p-6 shadow-xl border ${theme.cardBg} ${theme.cardBorder}`}>
                <h3 className={`font-bold mb-4 ${theme.textPrimary} flex items-center gap-2`}>
                   <Lightbulb className="w-4 h-4 text-indigo-500" />
                   判定规则
                </h3>
                <ul className={`space-y-3 text-xs font-mono ${theme.textSecondary}`}>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-black shadow-[0_0_4px_rgba(0,0,0,0.6)]"></span>
                    ⚫ 黑点：颜色与位置均正确
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-white ring-1 ring-slate-500/60 shadow-[0_0_4px_rgba(255,255,255,0.7)]"></span>
                    ⚪ 白点：颜色正确但位置不正确
                  </li>
                </ul>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
