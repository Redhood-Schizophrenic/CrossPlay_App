import { View, Text, Alert, ScrollView, TouchableOpacity, RefreshControl, Modal, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5 } from '@expo/vector-icons';
import QuantitySelector from '@/components/QuantitySelector';
import { API_URL } from '@/constants/url';
import { LinearGradient } from 'expo-linear-gradient';

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
  sessionCard: {
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
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#011C37',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButtonSmall: {
    flex: 1,
    paddingVertical: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#05ECE6',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    minHeight: '40%',
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#011C37',
  },
  modalContent: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#011C37',
    marginBottom: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#011C37',
    fontSize: 20,
    fontWeight: '600',
    marginTop: -2,
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  itemSection: {
    marginBottom: 20,
  },
  timeButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timeText: {
    fontSize: 16,
    color: '#011C37',
  },
});

export default function SessionsScreen() {

  const [Sessions, setSessions]: any = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setisModalOpen] = useState(false);
  const [isSnacksModalOpen, setisSnacksModalOpen] = useState(false);
  const [session_id, setsession_id] = useState('');
  const [minutes, setminutes] = useState('');
  const [Snacks, setSnacks] = useState(0);
  const [WaterBottle, setWaterBottle] = useState(0);

  async function handleFetchSessions() {
    setRefreshing(true)
    try {

      const sessions = await fetch(`${API_URL}/api/gaming_session/fetch/open`);

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

  async function handleSessionSnacks() {

    try {

      const extend = await fetch(`${API_URL}/api/gaming_session/snacks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "session_id": session_id,
          "snacks": Snacks,
          "water_bottles": WaterBottle
        })
      });

      if (extend.ok) {
        setisSnacksModalOpen(false);
      } else {
        Alert.alert("Failed to add Snacks");
      }

    } catch (e: any) {
      throw console.error(e);
    }
  }

  async function handleSessionExtend() {

    if (minutes === "") {

      Alert.alert('Please input minutes')
    } else {

      try {

        const extend = await fetch(`${API_URL}/api/gaming_session/extend`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "session_id": session_id,
            "minutes": parseFloat(minutes),
          })
        });

        if (extend.ok) {
          setisModalOpen(false);
        } else {
          Alert.alert("Failed to Extend Session");
        }

      } catch (e: any) {
        throw console.error(e);
      }
    }
  }

  async function handleSessionClosed(id: any) {
    try {

      const closed = await fetch(`${API_URL}/api/gaming_session/close`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "session_id": id
        }),
      });

      if (closed.ok) {
        Alert.alert("Session Closed");
      } else {
        Alert.alert("Failed to Close Session");
      }

    } catch (e: any) {
      throw console.error(e);
    }
  }

  useEffect(() => {
    handleFetchSessions();
  }, [])

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#011C37', '#013366']}
        style={styles.header}
      >
        <Text style={styles.headerText}>Active Sessions</Text>
        <Text style={styles.subHeaderText}>Currently running gaming sessions</Text>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleFetchSessions} />
        }
      >
        {Sessions?.map((session: any, index: any) => (
          <View key={index} style={styles.sessionCard}>
            <View style={styles.deviceInfo}>
              <View style={styles.deviceIcon}>
                <FontAwesome5 
                  name={session.Device.Category.CategoryName === "Playstation" ? "playstation" : "desktop"}
                  size={20} 
                  color="#05ECE6" 
                />
              </View>
              <Text style={styles.label}>{session.Device.DeviceName}</Text>
            </View>
 
            <View style={styles.infoRow}>
              <Text style={styles.label}>Customer</Text>
              <Text style={styles.value}>{session.CustomerName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>{session.CustomerContact}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Start Time</Text>
              <Text style={styles.value}>{session.InTime}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Duration</Text>
              <Text style={styles.value}>{session.Hours} hours</Text>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSmall]}
                onPress={() => {
                  setsession_id(session.id);
                  setSnacks(session.Snacks);
                  setWaterBottle(session.WaterBottles);
                  setisSnacksModalOpen(true);
                }}
              >
                <FontAwesome5 name="coffee" size={16} color="#05ECE6" />
                <Text style={styles.actionButtonText}>Add Items</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSmall]}
                onPress={() => {
                  setsession_id(session.id);
                  setisModalOpen(true);
                }}
              >
                <FontAwesome5 name="clock" size={16} color="#05ECE6" />
                <Text style={styles.actionButtonText}>Extend</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSmall, { backgroundColor: '#dc3545' }]}
                onPress={() => handleSessionClosed(session.id)}
              >
                <FontAwesome5 name="stop-circle" size={16} color="#ffffff" />
                <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>End</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Extend Session Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Extend Session</Text>
              <TouchableOpacity
                onPress={() => setisModalOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Duration</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={minutes}
                  onValueChange={(itemValue: any) => setminutes(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select duration" value="" />
                  <Picker.Item label="15 minutes" value="15" />
                  <Picker.Item label="30 minutes" value="30" />
                  <Picker.Item label="1 hour" value="60" />
                </Picker>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, { marginTop: 20 }]}
                onPress={handleSessionExtend}
              >
                <Text style={styles.actionButtonText}>Confirm Extension</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Items Modal */}
      <Modal
        visible={isSnacksModalOpen}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Extra Items</Text>
              <TouchableOpacity
                onPress={() => setisSnacksModalOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.itemSection}>
                <Text style={styles.modalLabel}>Snacks</Text>
                <QuantitySelector
                  initialQuantity={Snacks}
                  onQuantityChange={(quantity) => setSnacks(quantity)}
                />
              </View>

              <View style={styles.itemSection}>
                <Text style={styles.modalLabel}>Water Bottles</Text>
                <QuantitySelector
                  initialQuantity={WaterBottle}
                  onQuantityChange={(quantity) => setWaterBottle(quantity)}
                />
              </View>

              <TouchableOpacity
                style={[styles.actionButton, { marginTop: 20 }]}
                onPress={handleSessionSnacks}
              >
                <Text style={styles.actionButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
