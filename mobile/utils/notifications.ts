import { Platform } from 'react-native';

// Conditional import to avoid Expo Go errors
let Notifications: any = null;
try {
  // Only import expo-notifications if not in Expo Go
  if (!__DEV__ || Platform.OS !== 'android') {
    Notifications = require('expo-notifications');
  }
} catch (error) {
  console.log('📱 Notifications disabled in Expo Go environment');
}

// Fallback notification handler
const fallbackNotificationHandler = {
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
};

// Configure how notifications should be handled when app is in foreground
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.log('📱 Could not configure notifications in current environment');
  }
}

/**
 * Request notification permissions from the user
 */
export async function registerForPushNotificationsAsync() {
  if (!Notifications) {
    console.log('📱 Notifications not available in current environment');
    return 'denied';
  }

  try {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#21AEA8',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return finalStatus;
    }

    return finalStatus;
  } catch (error) {
    console.log('📱 Could not register for notifications:', error);
    return 'denied';
  }
}

/**
 * Schedule a notification for new test results
 */
export async function scheduleResultNotification(testName: string, resultDate: string) {
  if (!Notifications) {
    console.log(`📱 [Demo] Would notify: ${testName} results ready`);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Results Ready!',
        body: `Your ${testName} results are now available. Tap to view and download.`,
        data: { 
          type: 'result',
          testName,
          resultDate,
          screen: '/(drawer)/results'
        },
        sound: true,
      },
      trigger: null, // Show immediately (or use a specific time)
    });
  } catch (error) {
    console.log('📱 Could not schedule result notification:', error);
  }
}

/**
 * Schedule a notification for payment reminder
 */
export async function schedulePaymentNotification(amount: number, dueDate: string) {
  if (!Notifications) {
    console.log(`📱 [Demo] Would notify: Payment due ₱${amount.toFixed(2)}`);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💰 Payment Reminder',
        body: `You have a pending balance of ₱${amount.toFixed(2)}. Please pay at MDLAB office (walk-in only).`,
        data: { 
          type: 'payment',
          amount,
          dueDate,
          screen: '/(drawer)/payments'
        },
        sound: true,
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.log('📱 Could not schedule payment notification:', error);
  }
}

/**
 * Schedule a notification for payment confirmation
 */
export async function schedulePaymentConfirmationNotification(amount: number, receiptNumber: string) {
  if (!Notifications) {
    console.log(`📱 [Demo] Would notify: Payment confirmed ₱${amount.toFixed(2)}`);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Payment Received',
        body: `Payment of ₱${amount.toFixed(2)} has been confirmed. Receipt #${receiptNumber} is now available.`,
        data: { 
          type: 'payment_confirmation',
          amount,
          receiptNumber,
          screen: '/(drawer)/payments'
        },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.log('📱 Could not schedule payment confirmation:', error);
  }
}

/**
 * Schedule a notification for appointment reminder
 */
export async function scheduleAppointmentReminder(testName: string, appointmentDate: string, location: string) {
  if (!Notifications) {
    console.log(`📱 [Demo] Would notify: Appointment reminder for ${testName}`);
    return;
  }

  try {
    // Calculate trigger time (e.g., 1 day before appointment)
    const appointmentTime = new Date(appointmentDate);
    const reminderTime = new Date(appointmentTime);
    reminderTime.setDate(reminderTime.getDate() - 1);
    reminderTime.setHours(9, 0, 0, 0); // 9 AM the day before

    const now = new Date();
    const secondsUntilReminder = Math.max(0, Math.floor((reminderTime.getTime() - now.getTime()) / 1000));

    if (secondsUntilReminder > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Appointment Reminder',
          body: `Your ${testName} appointment is tomorrow at ${location}.`,
          data: { 
            type: 'appointment',
            testName,
            appointmentDate,
            location,
            screen: '/(drawer)/appointments'
          },
          sound: true,
        },
        trigger: { seconds: secondsUntilReminder },
      });
    }
  } catch (error) {
    console.log('📱 Could not schedule appointment reminder:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  if (!Notifications) {
    console.log('📱 [Demo] Would cancel all notifications');
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('📱 Could not cancel notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications() {
  if (!Notifications) {
    console.log('📱 [Demo] Would get scheduled notifications');
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('📱 Could not get notifications:', error);
    return [];
  }
}

/**
 * Add a notification listener for when notifications are received
 */
export function addNotificationReceivedListener(callback: (notification: any) => void) {
  if (!Notifications) {
    console.log('📱 [Demo] Would add notification listener');
    return { remove: () => {} };
  }

  try {
    return Notifications.addNotificationReceivedListener(callback);
  } catch (error) {
    console.log('📱 Could not add notification listener:', error);
    return { remove: () => {} };
  }
}

/**
 * Add a notification response listener for when user taps on notification
 */
export function addNotificationResponseReceivedListener(
  callback: (response: any) => void
) {
  if (!Notifications) {
    console.log('📱 [Demo] Would add notification response listener');
    return { remove: () => {} };
  }

  try {
    return Notifications.addNotificationResponseReceivedListener(callback);
  } catch (error) {
    console.log('📱 Could not add notification response listener:', error);
    return { remove: () => {} };
  }
}
