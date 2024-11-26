// NotificationScheduler.tsx
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import moment from 'moment';
import { API_URL } from '@/constants/url';
import { useNotification } from './NotificationManager';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return status;
  }
  return status;
}

// Clear all scheduled notifications
async function clearAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Create notification channel for Android
async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('session-alerts', {
      name: 'Session Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      sound: true,
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

// NotificationScheduler component
export default function NotificationScheduler() {
  const appState = useRef(AppState.currentState);
  const notificationInterval = useRef<NodeJS.Timeout | null>(null);
  const { showNotification } = useNotification();

  // Function to show in-app notification
  const showInAppNotification = (title: string, message: string, type: 'warning' | 'success' | 'error' = 'warning') => {
    showNotification({
      title,
      message,
      type,
      duration: 5000,
    });
  };

  // Schedule notifications for the OutTime and 5 minutes before
  async function scheduleNotifications(outTime: string, customerName: string, deviceName: string) {
    try {
      const currentTime = moment();
      // Parse outTime and set it to today's date
      const sessionOutTime = moment(outTime, "hh:mm A");
      
      // If the outTime is earlier than current time, assume it's for tomorrow
      if (sessionOutTime.isBefore(currentTime)) {
        sessionOutTime.add(1, 'day');
      }

      const delayToOutTime = sessionOutTime.diff(currentTime);
      const delayToFiveMinutesBefore = delayToOutTime - 5 * 60 * 1000; // 5 minutes in milliseconds

      // Schedule only if the time hasn't passed
      if (delayToOutTime > 0) {
        // Notification for OutTime
        await Notifications.scheduleNotificationAsync({
          content: {
            title: " Session Ending Now",
            body: `${customerName}'s session at ${deviceName} has ended.`,
            data: { type: 'session_end', customerName, deviceName },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: { 
            seconds: Math.floor(delayToOutTime / 1000),
            channelId: 'session-alerts',
          },
        });

        // Show in-app notification
        setTimeout(() => {
          showInAppNotification(
            "Session Ending Now",
            `${customerName}'s session at ${deviceName} has ended.`,
            'error'
          );
        }, delayToOutTime);
      }

      if (delayToFiveMinutesBefore > 0) {
        // Notification for 5 minutes before OutTime
        await Notifications.scheduleNotificationAsync({
          content: {
            title: " Session Ending Soon",
            body: `${customerName}'s session at ${deviceName} will end in 5 minutes.`,
            data: { type: 'session_reminder', customerName, deviceName },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: { 
            seconds: Math.floor(delayToFiveMinutesBefore / 1000),
            channelId: 'session-alerts',
          },
        });

        // Show in-app notification
        setTimeout(() => {
          showInAppNotification(
            "Session Ending Soon",
            `${customerName}'s session at ${deviceName} will end in 5 minutes.`,
            'warning'
          );
        }, delayToFiveMinutesBefore);
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      showInAppNotification(
        "Notification Error",
        "Failed to schedule session notifications",
        'error'
      );
    }
  }

  // Function to fetch and schedule notifications
  async function handleFetchSessions() {
    try {
      // Clear existing notifications before scheduling new ones
      await clearAllNotifications();

      const response = await fetch(`${API_URL}/api/gaming_session/fetch/open`);
      if (response.ok) {
        const data = await response.json();

        // Schedule notifications for each session
        for (const session of data.output) {
          await scheduleNotifications(
            session.OutTime,
            session.CustomerName,
            session.Device.DeviceName
          );
        }
      } else {
        console.error('Failed to fetch sessions for notifications');
        showInAppNotification(
          "Connection Error",
          "Failed to fetch active sessions",
          'error'
        );
      }
    } catch (error) {
      console.error('Error in handleFetchSessions:', error);
      showInAppNotification(
        "Connection Error",
        "Failed to connect to the server",
        'error'
      );
    }
  }

  // Handle app state changes
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) && 
      nextAppState === 'active'
    ) {
      // App has come to foreground
      await handleFetchSessions();
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    // Initial setup
    setupNotificationChannel();
    requestPermissions().then((status) => {
      if (status !== 'granted') {
        showInAppNotification(
          "Permission Required",
          "Please enable notifications in settings to receive session alerts.",
          'warning'
        );
      }
    });
    handleFetchSessions();

    // Set up app state change listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Set up periodic refresh (every 1 minute)
    notificationInterval.current = setInterval(handleFetchSessions, 60000);

    // Cleanup function
    return () => {
      subscription.remove();
      if (notificationInterval.current) {
        clearInterval(notificationInterval.current);
      }
      clearAllNotifications();
    };
  }, []);

  return null; // No UI needed
}
