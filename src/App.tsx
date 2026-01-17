import React, { useState, useEffect } from 'react';
import { LevelSelector } from './components/LevelSelector';
import { GameLevel } from './components/GameLevel';
import { LEVELS } from './data/levels';
import { getThemeForLevel } from './theme/designSystem';

function App() {
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);

  // Load progress on mount
  useEffect(() => {
    const saved = localStorage.getItem('geek-code-breaker-progress');
    if (saved) {
      try {
        setCompletedLevels(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load progress', e);
      }
    }
  }, []);

  // Save progress on change
  useEffect(() => {
    localStorage.setItem('geek-code-breaker-progress', JSON.stringify(completedLevels));
  }, [completedLevels]);

  const handleLevelSelect = (levelId: number) => {
    setCurrentLevelId(levelId);
  };

  const handleLevelComplete = () => {
    if (currentLevelId !== null) {
      // Mark current as completed if not already
      if (!completedLevels.includes(currentLevelId)) {
        setCompletedLevels(prev => [...prev, currentLevelId]);
      }
      
      // Auto advance to next level if available
      const nextLevelId = currentLevelId + 1;
      if (nextLevelId <= 100) {
        setCurrentLevelId(nextLevelId);
      } else {
        // Game Completed!
        setCurrentLevelId(null);
      }
    }
  };

  const handleExitLevel = () => {
    setCurrentLevelId(null);
  };

  // Render Logic
  if (currentLevelId !== null) {
    const levelConfig = LEVELS.find(l => l.id === currentLevelId);
    const theme = getThemeForLevel(currentLevelId);
    
    if (levelConfig) {
      return (
        <GameLevel 
          level={levelConfig} 
          theme={theme} 
          onComplete={handleLevelComplete}
          onExit={handleExitLevel}
        />
      );
    }
  }

  return (
    <LevelSelector 
      completedLevels={completedLevels}
      currentLevelId={Math.max(0, ...completedLevels) + 1}
      onSelectLevel={handleLevelSelect}
    />
  );
}

export default App;
