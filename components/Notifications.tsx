// NotificationScheduler.tsx
import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import moment from 'moment';
import { API_URL } from '@/constants/url';

// Request notification permissions
async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Please enable notifications in settings');
  }
}

// Schedule notifications for the OutTime and 5 minutes before
async function scheduleNotifications(outTime: string, customerName: string, deviceName: string) {
  const currentTime = moment();
  const sessionOutTime = moment(outTime, "hh:mm A");

  const delayToOutTime = sessionOutTime.diff(currentTime);
  const delayToFiveMinutesBefore = delayToOutTime - 5 * 60 * 1000; // 5 minutes in milliseconds

  if (delayToOutTime > 0) {
    // Notification for OutTime
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Session Ending Now",
        body: `${customerName}'s session at ${deviceName} is ended.`,
      },
      trigger: { seconds: delayToOutTime / 1000 },
    });

    Alert.alert("Session Ending Now", `${customerName}'s session at ${deviceName} is ended.`)
  }

  if (delayToFiveMinutesBefore > 0) {
    // Notification for 5 minutes before OutTime
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Session Ending Soon",
        body: `${customerName}'s session at ${deviceName} will end in 5 minutes.`,
      },
      trigger: { seconds: delayToFiveMinutesBefore / 1000 },
    });
    Alert.alert("Session Ending Soon", `${customerName}'s session at ${deviceName} will end in 5 minutes.`)
  }
}

// NotificationScheduler component
export default function NotificationScheduler() {
  // const [sessions, setSessions] = useState([]);

  useEffect(() => {
    requestPermissions();
    handleFetchSessions();
  }, []);

  async function handleFetchSessions() {
    try {
      const response = await fetch(`${API_URL}/api/gaming_session/fetch/open`);
      if (response.ok) {
        const data = await response.json();

        // Schedule notifications for each session
        data.output.forEach((session: any) => {
          scheduleNotifications(session.OutTime, session.CustomerName, session.Device.DeviceName);
        });
      } else {
        Alert.alert('Failed to fetch data');
      }
    } catch (e: any) {
      console.error(e);
    }
  }

  return null; // No UI needed
}
