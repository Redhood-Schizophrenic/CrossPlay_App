import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import moment from 'moment';
import { LineChart, BarChart } from 'react-native-chart-kit';

interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  joinedDate: string;
  bio?: string;
  location?: string;
  totalSessions: number;
  totalSales: number;
  preferredPlatform?: 'PS' | 'PC';
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

const defaultProfile: UserProfile = {
  id: '1',
  username: 'crossplay_admin',
  firstName: 'John',
  lastName: 'Smith',
  email: 'admin@crossplay.shop',
  phoneNumber: '+1 (555) 123-4567',
  joinedDate: '2024-01-15T00:00:00.000Z',
  bio: 'Gaming center manager with 5+ years of experience',
  location: 'San Francisco, CA',
  totalSessions: 248,
  totalSales: 4920,
  preferredPlatform: 'PS',
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(1, 28, 55, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#05ECE6',
  },
  barPercentage: 0.7,
  propsForBackgroundLines: {
    strokeDasharray: '', // solid background lines
    strokeWidth: 1,
    stroke: '#F0F0F0',
  },
  propsForLabels: {
    fontSize: 12,
    fontWeight: 'bold',
  },
};

const sampleSessionData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    data: [12, 18, 15, 22, 24, 32, 28],
    color: (opacity = 1) => `rgba(5, 236, 230, ${opacity})`,
    strokeWidth: 2,
  }],
};

const sampleSalesData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    data: [240, 360, 300, 440, 480, 640, 560],
    color: (opacity = 1) => `rgba(1, 28, 55, ${opacity})`,
    strokeWidth: 2,
  }],
};

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(defaultProfile);
  const [sessionData, setSessionData] = useState<ChartData>(sampleSessionData);
  const [salesData, setSalesData] = useState<ChartData>(sampleSalesData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileAndStats();
  }, []);

  const loadProfileAndStats = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadProfile(), loadChartData()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setEditedProfile(parsedProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadChartData = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('sessionStats');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = moment().subtract(i, 'days');
          return {
            date: date.format('ddd'),
            sessions: 0,
            sales: 0,
          };
        }).reverse();

        // Populate data from saved sessions
        if (stats.recentSessions) {
          stats.recentSessions.forEach((session: any) => {
            const sessionDate = moment(session.date).format('ddd');
            const dayData = last7Days.find(day => day.date === sessionDate);
            if (dayData) {
              dayData.sessions++;
              dayData.sales += session.price || 0;
            }
          });
        }

        setSessionData({
          labels: last7Days.map(day => day.date),
          datasets: [{
            data: last7Days.map(day => day.sessions),
            color: (opacity = 1) => `rgba(5, 236, 230, ${opacity})`,
            strokeWidth: 2,
          }],
        });

        setSalesData({
          labels: last7Days.map(day => day.date),
          datasets: [{
            data: last7Days.map(day => day.sales),
            color: (opacity = 1) => `rgba(1, 28, 55, ${opacity})`,
            strokeWidth: 2,
          }],
        });
      } else {
        // Use sample data if no saved data exists
        setSessionData(sampleSessionData);
        setSalesData(sampleSalesData);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Fallback to sample data on error
      setSessionData(sampleSessionData);
      setSalesData(sampleSalesData);
    }
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(editedProfile));
      setProfile(editedProfile);
      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving profile:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05ECE6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient
          colors={['#011C37', '#05ECE6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <FontAwesome5 name="user-circle" size={80} color="#fff" />
            </View>
            <Text style={styles.username}>{profile.username}</Text>
            <Text style={styles.email}>{profile.email}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {!isEditing ? (
            <>
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Profile Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>First Name:</Text>
                  <Text style={styles.value}>{profile.firstName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Last Name:</Text>
                  <Text style={styles.value}>{profile.lastName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{profile.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{profile.phoneNumber || 'Not set'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Joined:</Text>
                  <Text style={styles.value}>
                    {moment(profile.joinedDate).format('MMMM DD, YYYY')}
                  </Text>
                </View>
              </View>

              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>Statistics</Text>
                <View style={styles.statsOverview}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{profile.totalSessions}</Text>
                    <Text style={styles.statLabel}>Total Sessions</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>${profile.totalSales}</Text>
                    <Text style={styles.statLabel}>Total Sales</Text>
                  </View>
                </View>
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Sessions (Last 7 Days)</Text>
                  <LineChart
                    data={sessionData}
                    width={Dimensions.get('window').width - 100}
                    height={200}
                    chartConfig={{
                      ...chartConfig,
                      paddingRight: 32,
                      paddingTop: 16,
                    }}
                    bezier
                    style={styles.chart}
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={false}
                    withDots={true}
                    withShadow={false}
                    segments={4}
                    yAxisInterval={1}
                  />
                </View>

                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Sales (Last 7 Days)</Text>
                  <BarChart
                    data={salesData}
                    width={Dimensions.get('window').width - 100}
                    height={200}
                    chartConfig={{
                      ...chartConfig,
                      paddingRight: 32,
                      paddingTop: 16,
                    }}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                    withInnerLines={false}
                    withHorizontalLabels={true}
                    withVerticalLabels={true}
                    segments={4}
                    fromZero={true}
                    yAxisInterval={1}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.editSection}>
              <Text style={styles.sectionTitle}>Edit Profile</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.firstName}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, firstName: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.lastName}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, lastName: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.email}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, email: text })
                  }
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.phoneNumber}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, phoneNumber: text })
                  }
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statsSection: {
    marginBottom: 20,
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#011C37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#011C37',
    marginBottom: 12,
    paddingLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#011C37',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#05ECE6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#011C37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#05ECE6',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#011C37',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
