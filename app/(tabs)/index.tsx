import { Alert, Button, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View, Platform, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { API_URL } from '@/constants/url';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import QuantitySelector from '@/components/QuantitySelector';
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
  categoryCard: {
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
  categoryHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#011C37',
    marginBottom: 15,
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  deviceCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  deviceImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
    backgroundColor: '#011C37',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceIcon: {
    fontSize: 24,
    color: '#05ECE6',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#011C37',
    textAlign: 'center',
  },
  deviceStatus: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '95%',
    marginTop: 'auto',
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
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  closeButtonText: {
    color: '#011C37',
    fontSize: 20,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#011C37',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 15,
  },
  dateTimeButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#011C37',
  },
  submitButton: {
    backgroundColor: '#011C37',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  submitButtonText: {
    color: '#05ECE6',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default function HomeScreen() {

  const [Devices, setDevices]: any = useState([]);
  const [Types, setTypes]: any = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setisModalOpen] = useState(false);

  // Input Values
  const [Name, setName] = useState('');
  const [Contact, setContact] = useState('');
  const [deviceName, setdeviceName] = useState('');
  const [hours, sethours] = useState('0');
  const [date, setDate] = useState(new Date());
  const [inTime, setInTime] = useState(new Date());
  const [outTime, setOutTime] = useState(new Date());
  const [discount, setdiscount] = useState('');
  const [noOfPlayers, setnoOfPlayers] = useState(1);
  const [Snacks, setSnacks] = useState(0);
  const [WaterBottle, setWaterBottle] = useState(0);

  // Date Time Picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInTimePicker, setShowInTimePicker] = useState(false);
  const [showOutTimePicker, setShowOutTimePicker] = useState(false);

  async function handleFetchDevicesandTypes() {
    setRefreshing(true);
    try {
      const devices = await fetch(`${API_URL}/api/devices/fetch`);
      const types = await fetch(`${API_URL}/api/device_types/fetch`);

      if (devices.ok) {
        const data = await devices.json();
        console.log('Devices:', data.output);
        setDevices(data.output);
      } else {
        console.error('Failed to fetch devices:', await devices.text());
        Alert.alert('Error', 'Failed to fetch devices');
      }

      if (types.ok) {
        const data = await types.json();
        console.log('Types:', data.output);
        setTypes(data.output);
      } else {
        console.error('Failed to fetch types:', await types.text());
        Alert.alert('Error', 'Failed to fetch device types');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDisableDevice(id: any) {
    try {

      const res = await fetch(`${API_URL}/api/devices/edit/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "device_id": id,
          "status": "Inactive"
        }),
      });

      if (res.ok) {
        // const data = await res.json();
        Alert.alert('Device is In-Activated');
      } else {
        Alert.alert('Failed to Delete');
      }

    } catch (e: any) {
      throw console.error(e);
    }
  }

  async function handleAddSession() {
    try {

      const session = await fetch(`${API_URL}/api/gaming_session/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "customer_name": Name,
          "customer_contact": Contact,
          "device_name": deviceName,
          "date": formattedDate,
          "hours": parseFloat(hours),
          "in_time": formattedInTime,
          "out_time": formattedOutTime,
          "discount": discount,
          "no_of_players": noOfPlayers,
          "snacks": Snacks,
          "water_bottles": WaterBottle
        }),
      });

      if (session.ok) {
        setisModalOpen(false);
      } else {
        Alert.alert('Failed to add Session');
      }

    } catch (e: any) {
      throw console.error(e);
    }
  }

  useEffect(() => {
    handleFetchDevicesandTypes();
  }, [])

  // Date & Time Supporting Functions
  const formattedDate: string = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formattedInTime: string = inTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formattedOutTime: string = outTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleInTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || inTime;
    setShowInTimePicker(Platform.OS === 'ios');
    setInTime(currentTime);
  };

  const handleOutTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || outTime;
    setShowOutTimePicker(Platform.OS === 'ios');
    setOutTime(currentTime);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#011C37', '#013366']}
        style={styles.header}
      >
        <Text style={styles.headerText}>CrossPlay</Text>
        <Text style={styles.subHeaderText}>Select a gaming device to begin</Text>
      </LinearGradient>
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleFetchDevicesandTypes} />
        }
      >
        {Types?.map((type: any, index: any) => (
          <View key={index} style={styles.categoryCard}>
            <Text style={styles.categoryHeader}>{type.CategoryName}</Text>
            <View style={styles.deviceGrid}>
              {Devices.filter((device: any) => device.CategoryId === type.id)
                .map((device: any, deviceIndex: any) => (
                  <TouchableOpacity
                    key={deviceIndex}
                    style={[
                      styles.deviceCard,
                      { opacity: device.Status === 'Inactive' ? 0.5 : 1 }
                    ]}
                    onPress={() => {
                      if (device.Status === 'Active') {
                        setdeviceName(device.DeviceName);
                        setisModalOpen(true);
                      }
                    }}
                    onLongPress={() => handleDisableDevice(device.id)}
                  >
                    <View style={styles.deviceImage}>
                      <FontAwesome5 
                        name={device.Category.CategoryName === "Playstation" ? "playstation" : "desktop"} 
                        size={28} 
                        color="#05ECE6" 
                      />
                    </View>
                    <Text style={styles.deviceName}>{device.DeviceName}</Text>
                    <Text style={[
                      styles.deviceStatus,
                      { color: device.Status === 'Active' ? '#28a745' : '#dc3545' }
                    ]}>
                      {device.Status === 'Active' ? 'Available' : 'In Use'}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Session</Text>
              <TouchableOpacity
                onPress={() => setisModalOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Customer Details</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={Name}
                  onChangeText={setName}
                  placeholderTextColor="#6c757d"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contact Number"
                  value={Contact}
                  onChangeText={setContact}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor="#6c757d"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Session Details</Text>
                <View style={styles.input}>
                  <Text style={{ color: '#011C37' }}>{deviceName}</Text>
                </View>

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateTimeText}>
                    {formattedDate || 'Select Date'}
                  </Text>
                </TouchableOpacity>

                <View style={{ height: 15 }} />

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowInTimePicker(true)}
                >
                  <Text style={styles.dateTimeText}>
                    {formattedInTime || 'Select Start Time'}
                  </Text>
                </TouchableOpacity>

                <View style={{ height: 15 }} />

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowOutTimePicker(true)}
                >
                  <Text style={styles.dateTimeText}>
                    {formattedOutTime || 'Select End Time'}
                  </Text>
                </TouchableOpacity>

                <View style={{ height: 15 }} />

                <TextInput
                  style={styles.input}
                  placeholder="Hours"
                  value={hours}
                  onChangeText={sethours}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholderTextColor="#6c757d"
                />

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={discount}
                    onValueChange={setdiscount}
                    style={{ color: '#011C37' }}
                  >
                    <Picker.Item label="No Discount" value="None" />
                    <Picker.Item label="Happy Hours" value="Happy Hours" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Additional Options</Text>
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ marginBottom: 8, color: '#6c757d' }}>Number of Players</Text>
                  <QuantitySelector
                    initialQuantity={noOfPlayers}
                    onQuantityChange={setnoOfPlayers}
                  />
                </View>

                <View style={{ marginBottom: 15 }}>
                  <Text style={{ marginBottom: 8, color: '#6c757d' }}>Snacks</Text>
                  <QuantitySelector
                    initialQuantity={Snacks}
                    onQuantityChange={setSnacks}
                  />
                </View>

                <View style={{ marginBottom: 15 }}>
                  <Text style={{ marginBottom: 8, color: '#6c757d' }}>Water Bottles</Text>
                  <QuantitySelector
                    initialQuantity={WaterBottle}
                    onQuantityChange={setWaterBottle}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddSession}
              >
                <Text style={styles.submitButtonText}>Create Session</Text>
              </TouchableOpacity>

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {showInTimePicker && (
        <DateTimePicker
          value={inTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleInTimeChange}
        />
      )}
      {showOutTimePicker && (
        <DateTimePicker
          value={outTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleOutTimeChange}
        />
      )}
    </View>
  );
}
