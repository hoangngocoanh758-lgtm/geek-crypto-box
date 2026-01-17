export interface LevelConfig {
  id: number;
  difficulty: 3 | 4 | 5; // Number of slots
  maxAttempts: number;
  isMilestone: boolean;
  title?: string;
  description?: string;
}

const generateLevels = (): LevelConfig[] => {
  const levels: LevelConfig[] = [];

  for (let i = 1; i <= 100; i++) {
    let difficulty: 3 | 4 | 5 = 3;
    let maxAttempts = 12;
    let title = `Level ${i}`;
    let description = "破解密码以进入下一关";

    // Difficulty Progression
    if (i <= 10) {
      difficulty = 3;
      maxAttempts = 10;
    } else if (i <= 40) {
      difficulty = 4;
      maxAttempts = 12;
    } else {
      difficulty = 5;
      maxAttempts = 12;
    }

    // Milestone Logic
    const isMilestone = i % 10 === 0;
    if (isMilestone) {
      title = `里程碑关卡 ${i}`;
      description = "证明你实力的时刻到了！";
      // Slightly harder constraints for milestones if we wanted, 
      // but for now we keep it standard to avoid frustration.
    }

    // Special introductory levels
    if (i === 1) {
      title = "初出茅庐";
      description = "欢迎来到密码机。让我们从简单的3位密码开始。";
    }

    levels.push({
      id: i,
      difficulty,
      maxAttempts,
      isMilestone,
      title,
      description
    });
  }
  return levels;
};

export const LEVELS = generateLevels();
