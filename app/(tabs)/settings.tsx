import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Modal,
  TextInput,
  Alert,
  useColorScheme as _useColorScheme,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNotification } from '@/components/NotificationManager';
import { API_URL } from '@/constants/url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/components/useColorScheme';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import moment from 'moment';

interface SettingItemProps {
  icon: string;
  title: string;
  description?: string;
  onPress?: () => void;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  showArrow?: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedDate: string;
}

interface SessionStats {
  totalSessions: number;
  totalSales: number;
  recentSessions: Array<{
    id: string;
    date: string;
    duration: number;
    sales: number;
    deviceName: string;
  }>;
  lastActive: string;
}

// Device Add Modal Component
const DeviceAddModal = ({ 
  isVisible, 
  onClose, 
  deviceType 
}: { 
  isVisible: boolean; 
  onClose: () => void; 
  deviceType: 'PS' | 'PC' | null;
}) => {
  const [deviceName, setDeviceName] = useState('');
  const { showNotification } = useNotification();

  const handleAddDevice = async () => {
    try {
      if (!deviceName.trim()) {
        showNotification({
          title: 'Input Required',
          message: 'Please enter a device name',
          type: 'warning'
        });
        return;
      }

      const categoryId = deviceType === 'PS' 
        ? 'c495dcc9-6af5-4319-b39d-6cd6dafa49bf'  // PlayStation category ID
        : '63f7bbff-ad1a-4a48-bdb3-6a93ec5eb9e1'; // PC category ID

      const response = await fetch(`${API_URL}/api/devices/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          device_name: deviceName
        }),
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: `${deviceType === 'PS' ? 'PlayStation' : 'Gaming PC'} added successfully`,
          type: 'success'
        });
        onClose();
      } else {
        throw new Error('Failed to add device');
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: `Failed to add ${deviceType === 'PS' ? 'PlayStation' : 'Gaming PC'}`,
        type: 'error'
      });
    }
    setDeviceName('');
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={10} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Add {deviceType === 'PS' ? 'PlayStation' : 'Gaming PC'}
          </Text>
          <TextInput
            value={deviceName}
            onChangeText={setDeviceName}
            style={styles.input}
            placeholder="Enter device name"
            placeholderTextColor="#666"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.addButton]} 
              onPress={handleAddDevice}
            >
              <Text style={styles.buttonText}>Add Device</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  onPress,
  value,
  onValueChange,
  showArrow = true,
}) => {
  const isSwitch = typeof value !== 'undefined' && onValueChange;

  const content = (
    <>
      <LinearGradient
        colors={['#011C37', '#05ECE6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <FontAwesome5 name={icon} size={18} color="white" />
      </LinearGradient>
      <View style={styles.settingContent}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
        {isSwitch ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#767577', true: '#05ECE6' }}
            thumbColor={value ? '#011C37' : '#f4f3f4'}
            ios_backgroundColor="#767577"
          />
        ) : (
          showArrow && (
            <FontAwesome5 name="chevron-right" size={16} color="#011C37" />
          )
        )}
      </View>
    </>
  );

  if (isSwitch) {
    return <View style={styles.settingItem}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
};

export default function Settings() {
  const { showNotification } = useNotification();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceType, setDeviceType] = useState<'PS' | 'PC' | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const colorScheme = useColorScheme();
  const [scaleAnim] = useState(new Animated.Value(1));
  const [devices, setDevices] = useState<Array<{ id: string; name: string; type: 'PS' | 'PC'; status: 'online' | 'offline' }>>([]);
  const [deviceName, setDeviceName] = useState('');

  // Load saved settings, profile, and devices
  useEffect(() => {
    loadSettings();
    loadDevices();
    loadProfile();
    loadSessionStats();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (!savedProfile) {
        // Set default profile if none exists
        const defaultProfile: UserProfile = {
          id: '1',
          name: 'Demo User',
          email: 'demo@crossplay.shop',
          joinedDate: new Date().toISOString(),
        };
        await AsyncStorage.setItem('userProfile', JSON.stringify(defaultProfile));
        setProfile(defaultProfile);
      } else {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load profile',
        type: 'error'
      });
    }
  };

  const loadSessionStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('sessionStats');
      if (!savedStats) {
        // Set default stats if none exists
        const defaultStats: SessionStats = {
          totalSessions: 0,
          totalSales: 0,
          recentSessions: [],
          lastActive: new Date().toISOString(),
        };
        await AsyncStorage.setItem('sessionStats', JSON.stringify(defaultStats));
        setSessionStats(defaultStats);
      } else {
        setSessionStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading session stats:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load session statistics',
        type: 'error'
      });
    }
  };

  const loadDevices = async () => {
    try {
      const savedDevices = await AsyncStorage.getItem('devices');
      if (savedDevices) {
        setDevices(JSON.parse(savedDevices));
      }
    } catch (error) {
      console.error('Error loading devices:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load devices',
        type: 'error'
      });
    }
  };

  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      const darkModeSetting = await AsyncStorage.getItem('darkMode');
      const fontSizeSetting = await AsyncStorage.getItem('fontSize');

      if (notifications !== null) {
        setNotificationsEnabled(notifications === 'true');
      }
      if (darkModeSetting !== null) {
        setDarkMode(darkModeSetting === 'true');
      }
      if (fontSizeSetting) {
        setFontSize(fontSizeSetting);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load settings',
        type: 'error'
      });
    }
  };

  const StatsModal = () => (
    <Modal
      visible={showStatsModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowStatsModal(false)}
    >
      <BlurView intensity={10} style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { width: '90%' }]}>
          <Text style={styles.modalTitle}>Session Statistics</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Sessions</Text>
              <Text style={styles.statValue}>{sessionStats?.totalSessions || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Sales</Text>
              <Text style={styles.statValue}>${sessionStats?.totalSales.toFixed(2) || '0.00'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <ScrollView style={styles.recentSessionsContainer}>
            {sessionStats?.recentSessions.map((session) => (
              <View key={session.id} style={styles.sessionItem}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDevice}>{session.deviceName}</Text>
                  <Text style={styles.sessionDate}>{moment(session.date).format('MMM DD, YYYY')}</Text>
                </View>
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionDuration}>
                    Duration: {Math.floor(session.duration / 60)}h {session.duration % 60}m
                  </Text>
                  <Text style={styles.sessionSales}>Sales: ${session.sales.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => {
              handleSettingPress();
              setShowStatsModal(false);
            }}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </Modal>
  );

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSettingPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddDevice = async () => {
    try {
      if (!deviceName.trim()) {
        showNotification({
          title: 'Input Required',
          message: 'Please enter a device name',
          type: 'warning'
        });
        return;
      }

      const categoryId = deviceType === 'PS' 
        ? 'c495dcc9-6af5-4319-b39d-6cd6dafa49bf'  // PlayStation category ID
        : '63f7bbff-ad1a-4a48-bdb3-6a93ec5eb9e1'; // PC category ID

      const response = await fetch(`${API_URL}/api/devices/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          device_name: deviceName
        }),
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: `${deviceType === 'PS' ? 'PlayStation' : 'Gaming PC'} added successfully`,
          type: 'success'
        });
        setModalVisible(false);
        setDeviceType(null);
      } else {
        throw new Error('Failed to add device');
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: `Failed to add ${deviceType === 'PS' ? 'PlayStation' : 'Gaming PC'}`,
        type: 'error'
      });
    }
    setDeviceName('');
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <LinearGradient
        colors={['#011C37', '#05ECE6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => {
            handleSettingPress();
            setShowStatsModal(true);
          }}
        >
          <LinearGradient
            colors={['#05ECE6', '#011C37']}
            style={styles.avatarContainer}
          >
            {profile?.avatar ? (
              <Image 
                source={{ uri: profile.avatar }} 
                style={styles.avatar}
              />
            ) : (
              <FontAwesome5 name="user" size={30} color="white" />
            )}
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name || 'Loading...'}</Text>
            <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
            <View style={styles.statsPreview}>
              <Text style={styles.statsText}>
                {sessionStats?.totalSessions || 0} Sessions • ${sessionStats?.totalSales.toFixed(2) || '0.00'} Sales
              </Text>
              <Text style={styles.lastActiveText}>
                Last active: {sessionStats?.lastActive ? moment(sessionStats.lastActive).fromNow() : 'Never'}
              </Text>
            </View>
          </View>
          <FontAwesome5 name="chevron-right" size={20} color="#05ECE6" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Device Management</Text>
          <View style={styles.sectionContent}>
            {devices.map((device) => (
              <Animated.View
                key={device.id}
                style={[{ transform: [{ scale: scaleAnim }] }]}
              >
                <SettingItem
                  icon={device.type === 'PS' ? 'playstation' : 'desktop'}
                  title={device.name}
                  description={`Status: ${device.status}`}
                  showArrow={false}
                />
              </Animated.View>
            ))}
            <SettingItem
              icon="plus-circle"
              title="Add PlayStation"
              description="Add a new PlayStation device"
              onPress={() => {
                handleSettingPress();
                setDeviceType('PS');
                setModalVisible(true);
              }}
            />
            <SettingItem
              icon="plus-circle"
              title="Add Gaming PC"
              description="Add a new Gaming PC"
              onPress={() => {
                handleSettingPress();
                setDeviceType('PC');
                setModalVisible(true);
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Notifications</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="bell"
              title="Enable Notifications"
              description="Receive alerts about session status"
              value={notificationsEnabled}
              onValueChange={async (value) => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setNotificationsEnabled(value);
              }}
            />
            <SettingItem
              icon="paper-plane"
              title="Test Notifications"
              description="Send test notifications to verify they work"
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                showNotification({
                  title: 'Success Notification',
                  message: 'This is a test success notification!',
                  type: 'success',
                  duration: 3000,
                });

                setTimeout(() => {
                  showNotification({
                    title: 'Warning Notification',
                    message: 'This is a test warning notification!',
                    type: 'warning',
                    duration: 3000,
                  });
                }, 1000);

                setTimeout(() => {
                  showNotification({
                    title: 'Error Notification',
                    message: 'This is a test error notification!',
                    type: 'error',
                    duration: 3000,
                  });
                }, 2000);
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Appearance</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="moon"
              title="Dark Mode"
              description="Switch between light and dark themes"
              value={darkMode}
              onValueChange={async (value) => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDarkMode(value);
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>About</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="info-circle"
              title="App Version"
              description="1.0.0"
              showArrow={false}
            />
            <SettingItem
              icon="question-circle"
              title="Help & Support"
              description="Get help with using the app"
            />
            <SettingItem
              icon="shield-alt"
              title="Privacy Policy"
              description="Read our privacy policy"
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setDeviceType(null);
        }}
      >
        <BlurView intensity={10} style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <Text style={styles.modalTitle}>
              Add {deviceType === 'PS' ? 'PlayStation' : 'Gaming PC'}
            </Text>
            <TextInput
              value={deviceName}
              onChangeText={setDeviceName}
              style={[
                styles.input,
                darkMode && styles.darkInput
              ]}
              placeholder="Enter device name"
              placeholderTextColor={darkMode ? '#888' : '#666'}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  handleSettingPress();
                  setModalVisible(false);
                  setDeviceType(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]} 
                onPress={() => {
                  handleSettingPress();
                  handleAddDevice();
                }}
              >
                <Text style={styles.buttonText}>Add Device</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>

      <StatsModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#011C37',
    marginBottom: 12,
    paddingLeft: 8,
  },
  darkText: {
    color: '#ffffff',
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#011C37',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#011C37',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  darkInput: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  addButton: {
    backgroundColor: '#011C37',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 15,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  profileEmail: {
    fontSize: 14,
    color: '#05ECE6',
    marginTop: 4,
  },
  statsPreview: {
    marginTop: 8,
  },
  statsText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  lastActiveText: {
    fontSize: 12,
    color: '#05ECE6',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#011C37',
  },
  recentSessionsContainer: {
    maxHeight: 300,
    marginTop: 10,
  },
  sessionItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionDevice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#011C37',
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sessionDuration: {
    fontSize: 14,
    color: '#666',
  },
  sessionSales: {
    fontSize: 14,
    fontWeight: '500',
    color: '#05ECE6',
  },
  closeButton: {
    backgroundColor: '#011C37',
    marginTop: 20,
  },
});
