import { useState } from 'react';
import Toast from 'react-native-toast-message';

export function useSettings() {
  const [metricUnits, setMetricUnits] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [waterReminder, setWaterReminder] = useState(true);
  const [appleHealthSync, setAppleHealthSync] = useState(false);

  const toggleMetricUnits = () => setMetricUnits(prev => !prev);
  const togglePushNotifications = () => setPushNotifications(prev => !prev);
  const toggleWaterReminder = () => setWaterReminder(prev => !prev);

  const toggleAppleHealthSync = () => {
    setAppleHealthSync(prev => {
      const next = !prev;
      Toast.show({
        type: 'info',
        text1: 'Wearable Integration',
        text2: 'Wearable data syncing will launch in Phase 7.',
      });
      return next;
    });
  };

  const handleAction = (label: string) => {
    Toast.show({
      type: 'info',
      text1: label,
      text2: 'This action is currently simulated.',
    });
  };

  return {
    metricUnits,
    pushNotifications,
    waterReminder,
    appleHealthSync,
    toggleMetricUnits,
    togglePushNotifications,
    toggleWaterReminder,
    toggleAppleHealthSync,
    handleAction,
  };
}
