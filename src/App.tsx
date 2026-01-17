import React, { useState, useEffect } from 'react';
import { LevelSelector } from './components/LevelSelector';
import { GameLevel } from './components/GameLevel';
import { LEVELS } from './data/levels';
import { getThemeForLevel } from './theme/designSystem';
import { supabase } from './lib/supabaseClient';

type LevelProgressRow = {
  completed_levels: number[] | null;
};

type GameUser = {
  id: string;
  username: string;
};

function App() {
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [user, setUser] = useState<GameUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  useEffect(() => {
    const existingId = localStorage.getItem('geek-code-breaker-player-id');
    if (existingId) {
      setPlayerId(existingId);
      return;
    }
    let newId: string;
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      newId = crypto.randomUUID();
    } else {
      newId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    localStorage.setItem('geek-code-breaker-player-id', newId);
    setPlayerId(newId);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('geek-code-breaker-user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as GameUser;
        if (parsed && parsed.id && parsed.username) {
          setUser(parsed);
        }
      } catch (e) {
        console.error('Failed to load saved user', e);
      }
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('geek-code-breaker-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('geek-code-breaker-user');
    }
  }, [user]);

  useEffect(() => {
    if (!user && !playerId) return;
    const loadRemoteProgress = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('level_progress')
          .select('completed_levels')
          .eq('game_user_id', user.id)
          .maybeSingle();
        if (error) {
          console.error('Failed to load remote progress for user', error);
          return;
        }
        const row = data as LevelProgressRow | null;
        if (row && Array.isArray(row.completed_levels)) {
          const levels = row.completed_levels;
          setCompletedLevels(levels);
          localStorage.setItem('geek-code-breaker-progress', JSON.stringify(levels));
          return;
        }

        // If no remote record exists (or invalid), migrate local progress
        let localLevels: number[] = [];
        const saved = localStorage.getItem('geek-code-breaker-progress');
        if (saved) {
          try {
            localLevels = JSON.parse(saved);
          } catch (e) {
            console.error('Failed to load local progress for migration', e);
          }
        }

        // Insert new record for existing user
        const { error: insertError } = await supabase
          .from('level_progress')
          .insert({ 
            game_user_id: user.id, 
            player_id: playerId,
            completed_levels: localLevels 
          });

        if (insertError) {
          console.error('Failed to initialize missing progress for user', insertError);
        }

        setCompletedLevels(localLevels);
        return;
      }
      if (playerId) {
        const { data, error } = await supabase
          .from('level_progress')
          .select('completed_levels')
          .eq('player_id', playerId)
          .maybeSingle();
        if (error) {
          console.error('Failed to load remote progress', error);
          return;
        }
        const row = data as LevelProgressRow | null;
        if (row && Array.isArray(row.completed_levels)) {
          const levels = row.completed_levels;
          setCompletedLevels(levels);
          localStorage.setItem('geek-code-breaker-progress', JSON.stringify(levels));
          return;
        }
        const saved = localStorage.getItem('geek-code-breaker-progress');
        if (saved) {
          try {
            setCompletedLevels(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to load local progress fallback', e);
          }
        }
      }
    };
    loadRemoteProgress();
  }, [user, playerId]);

  // Save progress on change
  useEffect(() => {
    localStorage.setItem('geek-code-breaker-progress', JSON.stringify(completedLevels));
    if (completedLevels.length === 0) return;
    const saveRemoteProgress = async () => {
      if (user) {
        // Try to find existing record first to avoid relying on ON CONFLICT constraint
        const { data: existing } = await supabase
          .from('level_progress')
          .select('id')
          .eq('game_user_id', user.id)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('level_progress')
            .update({ completed_levels: completedLevels })
            .eq('game_user_id', user.id);
            
          if (error) console.error('Failed to update remote progress for user', error);
        } else {
          const { error } = await supabase
            .from('level_progress')
            .insert({ 
              game_user_id: user.id, 
              player_id: playerId,
              completed_levels: completedLevels 
            });
            
          if (error) console.error('Failed to create remote progress for user', error);
        }
        return;
      }
      if (playerId) {
        const { data: existing } = await supabase
          .from('level_progress')
          .select('id')
          .eq('player_id', playerId)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('level_progress')
            .update({ completed_levels: completedLevels })
            .eq('player_id', playerId);
            
          if (error) console.error('Failed to update remote progress for player', error);
        } else {
          const { error } = await supabase
            .from('level_progress')
            .insert({ 
              player_id: playerId, 
              completed_levels: completedLevels 
            });
            
          if (error) console.error('Failed to create remote progress for player', error);
        }
      }
    };
    saveRemoteProgress();
  }, [completedLevels, user, playerId]);

  const handleAuth = async (identifier: string, password: string) => {
    setAuthError(null);
    setAuthLoading(true);
    const username = identifier.trim();
    if (!username) {
      setAuthError('用户名不能为空');
      setAuthLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('game_users')
      .select('id, username, password')
      .eq('username', username);
    if (error) {
      setAuthError('无法访问用户表');
      setAuthLoading(false);
      return;
    }
    if (data && data.length > 0) {
      const existing = data[0] as { id: string; username: string; password: string };
      if (existing.password !== password) {
        setAuthError('用户名或密码错误');
        setAuthLoading(false);
        return;
      }
      setUser({ id: existing.id, username: existing.username });
      setAuthLoading(false);
      return;
    }
    const { data: inserted, error: insertError } = await supabase
      .from('game_users')
      .insert({ username, password })
      .select('id, username')
      .single();
    if (insertError || !inserted) {
      setAuthError('注册失败');
      setAuthLoading(false);
      return;
    }
    const newUser = inserted as { id: string; username: string };
    
    // Initialize level progress for new user
    const { error: initProgressError } = await supabase
      .from('level_progress')
      .insert({ 
        game_user_id: newUser.id,
        player_id: playerId,
        completed_levels: [] 
      });
      
    if (initProgressError) {
      console.error('Failed to initialize progress', initProgressError);
    }

    setUser({ id: newUser.id, username: newUser.username });
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    setUser(null);
  };

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
      username={user ? user.username : null}
      authError={authError}
      authLoading={authLoading}
      onAuth={handleAuth}
      onSignOut={handleSignOut}
    />
  );
}

export default App;
