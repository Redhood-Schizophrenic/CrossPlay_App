import { View, Text, Alert, ScrollView, RefreshControl, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { API_URL } from '@/constants/url';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 28,
    color: '#05ECE6',
    fontWeight: '700',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 5,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#011C37',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#011C37',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
  },
  value: {
    fontSize: 14,
    color: '#011C37',
    fontWeight: '500',
  },
  priceContainer: {
    marginTop: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#011C37',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#011C37',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default function SessionsHistory() {
  const [Sessions, setSessions]: any = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function handleFetchSessions() {
    setRefreshing(true)
    try {
      const sessions = await fetch(`${API_URL}/api/gaming_session/fetch/closed`);

      if (sessions.ok) {
        const data = await sessions.json();
        setSessions(data.output);
      } else {
        Alert.alert('Failed to fetch data');
      }

      setRefreshing(false);
    } catch (e: any) {
      throw console.error(e);
    }
  }

  useEffect(() => {
    handleFetchSessions();
  }, [])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          badge: { backgroundColor: '#d1fae5' },
          text: { color: '#059669' }
        };
      case 'Extended':
        return {
          badge: { backgroundColor: '#fef3c7' },
          text: { color: '#d97706' }
        };
      default:
        return {
          badge: { backgroundColor: '#fee2e2' },
          text: { color: '#dc2626' }
        };
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#011C37', '#013366']}
        style={styles.header}
      >
        <Text style={styles.headerText}>Session History</Text>
        <Text style={styles.subHeaderText}>Past gaming sessions</Text>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleFetchSessions} />
        }
      >
        {Sessions?.map((session: any, index: any) => {
          const statusStyle = getStatusStyle(session.Status);
          return (
            <View key={index} style={styles.historyCard}>
              <View style={[styles.badge, statusStyle.badge]}>
                <Text style={[styles.badgeText, statusStyle.text]}>
                  {session.Status}
                </Text>
              </View>

              <View style={styles.deviceInfo}>
                <View style={styles.deviceIcon}>
                  <FontAwesome5 
                    name={session.Device.Category.CategoryName === "Playstation" ? "playstation" : "desktop"}
                    size={20} 
                    color="#05ECE6" 
                  />
                </View>
                <Text style={styles.deviceName}>{session.Device.DeviceName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Customer</Text>
                <Text style={styles.value}>{session.CustomerName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{session.Date}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Duration</Text>
                <Text style={styles.value}>{session.Hours} hours</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Time</Text>
                <Text style={styles.value}>{session.InTime} - {session.OutTime}</Text>
              </View>

              <View style={styles.priceContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.label}>Session Price</Text>
                  <Text style={styles.value}>₹{session.TotalPrice}</Text>
                </View>
                {session.Snacks > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.label}>Snacks ({session.Snacks})</Text>
                    <Text style={styles.value}>₹{session.Snacks * 50}</Text>
                  </View>
                )}
                {session.WaterBottles > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.label}>Water ({session.WaterBottles})</Text>
                    <Text style={styles.value}>₹{session.WaterBottles * 20}</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{session.TotalPrice}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
