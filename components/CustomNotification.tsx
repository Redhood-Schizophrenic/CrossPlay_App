import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface CustomNotificationProps {
  title: string;
  message: string;
  type: 'warning' | 'success' | 'error';
  onPress?: () => void;
  onClose?: () => void;
  duration?: number;
}

const getIconAndColors = (type: 'warning' | 'success' | 'error') => {
  switch (type) {
    case 'warning':
      return {
        icon: 'exclamation-circle',
        gradient: ['#FFB75E', '#ED8F03'],
        backgroundColor: 'rgba(255, 183, 94, 0.1)',
      };
    case 'success':
      return {
        icon: 'check-circle',
        gradient: ['#05ECE6', '#056f6d'],
        backgroundColor: 'rgba(5, 236, 230, 0.1)',
      };
    case 'error':
      return {
        icon: 'times-circle',
        gradient: ['#FF512F', '#DD2476'],
        backgroundColor: 'rgba(255, 81, 47, 0.1)',
      };
    default:
      return {
        icon: 'bell',
        gradient: ['#05ECE6', '#056f6d'],
        backgroundColor: 'rgba(5, 236, 230, 0.1)',
      };
  }
};

export const CustomNotification: React.FC<CustomNotificationProps> = ({
  title,
  message,
  type = 'success',
  onPress,
  onClose,
  duration = 5000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: Platform.OS === 'ios' ? 50 : 20,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      hideNotification();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  const { icon, gradient, backgroundColor } = getIconAndColors(type);

  const NotificationContent = () => (
    <TouchableOpacity
      style={[styles.contentContainer, { backgroundColor }]}
      onPress={() => {
        onPress?.();
        hideNotification();
      }}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.iconContainer}
      >
        <FontAwesome5 name={icon} size={24} color="white" />
      </LinearGradient>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={hideNotification}
      >
        <FontAwesome5 name="times" size={16} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={100} style={styles.blurContainer}>
          <NotificationContent />
        </BlurView>
      ) : (
        <View style={[styles.blurContainer, { backgroundColor: 'white' }]}>
          <NotificationContent />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  blurContainer: {
    width: width - 32,
    maxWidth: 500,
    borderRadius: 16,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#011C37',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 8,
  },
});
