import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Badge, Level, Achievement, Challenge, DailyMission } from '../types';
import { 
  getLevelForXp, 
  getXpProgress, 
  getNextLevel, 
  ALL_BADGES, 
  ALL_ACHIEVEMENTS, 
  generateDailyMissions, 
  getDefaultChallenges,
  XP_REWARDS
} from '../lib/gamification';
import { useAuth } from './AuthProvider';
import { useNotifications } from './NotificationProvider';
import confetti from 'canvas-confetti';
import { getStorageItem, setStorageItem } from '../lib/utils';

interface GamificationContextType {
  badges: Badge[];
  achievements: Achievement[];
  dailyMissions: DailyMission[];
  challenges: Challenge[];
  level: Level;
  xpProgress: { current: number; required: number; percentage: number };
  addXp: (amount: number, reason: string) => void;
  awardCoins: (amount: number, reason: string) => void;
  completeMission: (id: string) => void;
  joinChallenge: (id: string) => void;
  progressChallenge: (id: string, amount: number) => void;
  unlockBadge: (id: string) => void;
  incrementAchievementProgress: (id: string, amount: number) => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user, updateProfile } = useAuth();
  const { addNotification, showToast } = useNotifications();

  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Load gamification data from localStorage or initialize
  useEffect(() => {
    if (user) {
      const userBadges = getStorageItem<Badge[]>('badges', ALL_BADGES);
      const userAchievements = getStorageItem<Achievement[]>('achievements', ALL_ACHIEVEMENTS);
      const userMissions = getStorageItem<DailyMission[]>('daily_missions', []);
      const userChallenges = getStorageItem<Challenge[]>('challenges', []);

      setBadges(userBadges);
      setAchievements(userAchievements);
      
      if (userMissions.length === 0) {
        const initialMissions = generateDailyMissions();
        setDailyMissions(initialMissions);
        setStorageItem('daily_missions', initialMissions);
      } else {
        setDailyMissions(userMissions);
      }

      if (userChallenges.length === 0) {
        const initialChallenges = getDefaultChallenges().map(c => ({
          ...c,
          joined: c.type === 'community',
        }));
        setChallenges(initialChallenges);
        setStorageItem('challenges', initialChallenges);
      } else {
        setChallenges(userChallenges);
      }
    } else {
      setBadges([]);
      setAchievements([]);
      setDailyMissions([]);
      setChallenges([]);
    }
  }, [user]);

  const saveBadges = useCallback((updated: Badge[]) => {
    setBadges(updated);
    setStorageItem('badges', updated);
  }, []);

  const saveAchievements = useCallback((updated: Achievement[]) => {
    setAchievements(updated);
    setStorageItem('achievements', updated);
  }, []);

  const saveMissions = useCallback((updated: DailyMission[]) => {
    setDailyMissions(updated);
    setStorageItem('daily_missions', updated);
  }, []);

  const saveChallenges = useCallback((updated: Challenge[]) => {
    setChallenges(updated);
    setStorageItem('challenges', updated);
  }, []);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }, []);

  const awardCoins = useCallback((amount: number, reason: string) => {
    if (!user) return;
    const newCoins = user.coins + amount;
    updateProfile({ coins: newCoins });
    showToast(`+${amount} EcoCoins: ${reason}`, 'success');
  }, [user, updateProfile, showToast]);

  const addXp = useCallback((amount: number, reason: string) => {
    if (!user) return;
    const currentXp = user.xp || 0;
    const currentTotalXp = user.totalXp || 0;
    const newTotalXp = currentTotalXp + amount;
    
    // Calculate new level
    const currentLevelVal = user.level || 1;
    const nextLevelObj = getLevelForXp(newTotalXp);
    
    showToast(`+${amount} XP: ${reason}`, 'info');

    const updates: Partial<typeof user> = {
      xp: newTotalXp, // Wait, in levels we use total XP or relative XP? Let's check LEVELS minXp.
      totalXp: newTotalXp,
    };

    if (nextLevelObj.level > currentLevelVal) {
      updates.level = nextLevelObj.level;
      updates.coins = (user.coins || 0) + 50; // Level up bonus coins

      // Level up celebration
      triggerConfetti();
      addNotification(
        'Level Up!',
        `Congratulations! You reached Level ${nextLevelObj.level} (${nextLevelObj.title}) ${nextLevelObj.icon}`,
        'achievement',
        nextLevelObj.icon
      );
    }

    updateProfile(updates);
  }, [user, updateProfile, triggerConfetti, addNotification, showToast]);

  const unlockBadge = useCallback((badgeId: string) => {
    const badgeIndex = badges.findIndex(b => b.id === badgeId);
    if (badgeIndex === -1 || badges[badgeIndex].unlocked) return;

    const updated = [...badges];
    updated[badgeIndex] = {
      ...updated[badgeIndex],
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    };
    saveBadges(updated);

    const badge = updated[badgeIndex];
    triggerConfetti();
    addNotification(
      'Badge Unlocked!',
      `You earned the "${badge.name}" badge: ${badge.description}`,
      'achievement',
      badge.icon
    );

    // Reward XP and coins
    if (badge.xpReward) addXp(badge.xpReward, `Unlocked "${badge.name}" badge`);
    if (badge.coinReward) awardCoins(badge.coinReward, `Unlocked "${badge.name}" badge`);
  }, [badges, saveBadges, triggerConfetti, addNotification, addXp, awardCoins]);

  const completeMission = useCallback((missionId: string) => {
    const index = dailyMissions.findIndex(m => m.id === missionId);
    if (index === -1 || dailyMissions[index].completed) return;

    const updated = [...dailyMissions];
    updated[index] = { ...updated[index], completed: true };
    saveMissions(updated);

    const mission = updated[index];
    addXp(mission.xpReward, `Completed daily mission: ${mission.title}`);
    awardCoins(mission.coinReward, `Completed daily mission: ${mission.title}`);

    // Check achievement progress
    // Complete daily mission can increment some achievements if needed
  }, [dailyMissions, saveMissions, addXp, awardCoins]);

  const joinChallenge = useCallback((challengeId: string) => {
    const index = challenges.findIndex(c => c.id === challengeId);
    if (index === -1) return;

    const updated = [...challenges];
    updated[index] = { ...updated[index], joined: true, status: 'active' };
    saveChallenges(updated);

    addNotification(
      'Joined Challenge',
      `You joined the challenge: ${updated[index].title}`,
      'challenge',
      updated[index].icon
    );
  }, [challenges, saveChallenges, addNotification]);

  const progressChallenge = useCallback((challengeId: string, amount: number) => {
    const index = challenges.findIndex(c => c.id === challengeId);
    if (index === -1 || challenges[index].status !== 'active') return;

    const challenge = challenges[index];
    const newProgress = Math.min(challenge.targetValue, challenge.currentValue + amount);
    const completed = newProgress >= challenge.targetValue;

    const updated = [...challenges];
    updated[index] = {
      ...updated[index],
      currentValue: newProgress,
      status: completed ? 'completed' : 'active',
    };
    saveChallenges(updated);

    if (completed) {
      triggerConfetti();
      addNotification(
        'Challenge Completed!',
        `You completed "${challenge.title}" and saved emissions!`,
        'challenge',
        challenge.icon
      );
      addXp(challenge.xpReward, `Completed challenge "${challenge.title}"`);
      awardCoins(challenge.coinReward, `Completed challenge "${challenge.title}"`);

      // Count completed challenges for badges
      const completedCount = updated.filter(c => c.status === 'completed').length;
      if (completedCount >= 1) unlockBadge('challenge_1');
      if (completedCount >= 10) unlockBadge('challenge_10');
      if (completedCount >= 50) unlockBadge('challenge_50');
    }
  }, [challenges, saveChallenges, triggerConfetti, addNotification, addXp, awardCoins, unlockBadge]);

  const incrementAchievementProgress = useCallback((achievementId: string, amount: number) => {
    const index = achievements.findIndex(a => a.id === achievementId);
    if (index === -1 || achievements[index].completed) return;

    const achievement = achievements[index];
    const newProgress = Math.min(achievement.target, achievement.progress + amount);
    const completed = newProgress >= achievement.target;

    const updated = [...achievements];
    updated[index] = {
      ...updated[index],
      progress: newProgress,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    };
    saveAchievements(updated);

    if (completed) {
      triggerConfetti();
      addNotification(
        'Achievement Unlocked!',
        `You unlocked the "${achievement.title}" achievement!`,
        'achievement',
        achievement.icon
      );
      addXp(achievement.xpReward, `Unlocked achievement "${achievement.title}"`);
    }
  }, [achievements, saveAchievements, triggerConfetti, addNotification, addXp]);

  const level = user ? getLevelForXp(user.totalXp || 0) : getLevelForXp(0);
  const xpProgress = user ? getXpProgress(user.totalXp || 0) : { current: 0, required: 100, percentage: 0 };

  return (
    <GamificationContext.Provider
      value={{
        badges,
        achievements,
        dailyMissions,
        challenges,
        level,
        xpProgress,
        addXp,
        awardCoins,
        completeMission,
        joinChallenge,
        progressChallenge,
        unlockBadge,
        incrementAchievementProgress,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}
