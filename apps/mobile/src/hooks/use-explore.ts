import { useState, useEffect } from 'react';
import { travelService } from '../services/travel-service';
import Toast from 'react-native-toast-message';

const CALORIE_DATA = [
  { day: 'Mon', val: 2100, target: 2200 },
  { day: 'Tue', val: 1850, target: 2200 },
  { day: 'Wed', val: 2400, target: 2200 },
  { day: 'Thu', val: 2200, target: 2200 },
  { day: 'Fri', val: 1950, target: 2200 },
  { day: 'Sat', val: 2700, target: 2200 },
  { day: 'Sun', val: 1350, target: 2200 },
] as const;

const PROTEIN_DATA = [
  { day: 'Mon', val: 142, target: 150 },
  { day: 'Tue', val: 125, target: 150 },
  { day: 'Wed', val: 155, target: 150 },
  { day: 'Thu', val: 150, target: 150 },
  { day: 'Fri', val: 130, target: 150 },
  { day: 'Sat', val: 160, target: 150 },
  { day: 'Sun', val: 95, target: 150 },
] as const;

export function useExplore() {
  const [travelModeActive, setTravelModeActive] = useState(false);
  const [stats, setStats] = useState({
    streak: 0,
    activeDays: 0,
    waterTotal: 0,
    scannedMealsCount: 0,
  });

  const loadStats = async () => {
    try {
      const data = await travelService.getTravelStats();
      setStats(data);
    } catch (e) {
      setStats({
        streak: 5,
        activeDays: 24,
        waterTotal: 14.5,
        scannedMealsCount: 12,
      });
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const toggleTravelMode = async () => {
    const nextState = !travelModeActive;
    try {
      await travelService.toggleTravelMode(nextState);
      setTravelModeActive(nextState);
      Toast.show({
        type: 'info',
        text1: nextState ? 'Travel Mode Activated' : 'Travel Mode Disabled',
        text2: nextState
          ? 'Strict goals paused. Calorie compensation will start in Phase 5.'
          : 'Deficit targets resumed.',
      });
    } catch (e) {}
  };

  return {
    travelModeActive,
    toggleTravelMode,
    stats,
    CALORIE_DATA,
    PROTEIN_DATA,
  };
}
