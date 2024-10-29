import { Alert, Button, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { API_URL } from '@/constants/url';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import QuantitySelector from '@/components/QuantitySelector';

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
        setDevices(data.output);
      }

      if (types.ok) {
        const data = await types.json();
        const reversed = data.output;
        setTypes(reversed.reverse());
      }

      setTimeout(() => {
        setRefreshing(false);
      }, 1500);

    } catch (e: any) {
      throw console.log(e);
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
    <>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleFetchDevicesandTypes} />
        }
      >
        {
          Types?.map((type: any, index: any) => (
            <View
              key={index}
              style={{ padding: 10, }}
            >
              <Text
                style={{ padding: 15, borderRadius: 10, marginBottom: 20, backgroundColor: '#449ae1', color: '#fff', fontSize: 20, fontWeight: 700 }}
              >{type.CategoryName}</Text>
              <View
                style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 15 }}
              >
                {
                  Devices.filter((d: any) => d.CategoryId === type?.id).map((device: any, index: any) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        display: device.Status === 'Inactive' ? 'none' : 'flex',
                        width: 100,
                        height: 100,
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        elevation: 8,
                      }}
                      onLongPress={() => { handleDisableDevice(device.id) }}
                      onPress={() => { setisModalOpen(true); setdeviceName(device.DeviceName) }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 700 }}>{device.DeviceName}</Text>
                    </TouchableOpacity>
                  ))
                }
              </View>
            </View>
          ))
        }
      </ScrollView>
      <Modal
        visible={isModalOpen}
        animationType='slide'
        onRequestClose={() => { setisModalOpen(false) }}
      >
        <ScrollView
          contentContainerStyle={{ width: '100%', padding: 30, gap: 20 }}
        >

          <View style={{ paddingBottom: 10 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              Customer Name
            </Text>

            <TextInput
              placeholder='Please enter Customer Name...'
              value={Name}
              onChangeText={(e) => { setName(e) }}
              style={{ fontSize: 16, paddingVertical: 8, borderColor: 'gray', borderBottomWidth: 1 }}
            />
          </View>

          <View style={{ paddingBottom: 10 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              Customer Contact
            </Text>

            <TextInput
              keyboardType='numeric'
              placeholder='Please enter Customer Contact...'
              value={Contact}
              onChangeText={(e) => { setContact(e) }}
              maxLength={10}
              style={{ fontSize: 16, paddingVertical: 8, borderColor: 'gray', borderBottomWidth: 1 }}
            />
          </View>

          <View style={{ paddingBottom: 10 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              Device Selected
            </Text>

            <TextInput
              value={deviceName}
              editable={false}
              selectTextOnFocus={false}
              style={{ fontSize: 16, paddingVertical: 8, borderColor: 'gray', borderBottomWidth: 1 }}
            />
          </View>

          <View style={{ paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              Date
            </Text>
            <Button title="Pick Date" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            <Text style={{ fontSize: 12, color: '#6B7280' }}> {formattedDate}</Text>
          </View>

          <View style={{ paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              In Time
            </Text>
            <Button title="Pick In Time" onPress={() => setShowInTimePicker(true)} />
            {showInTimePicker && (
              <DateTimePicker
                value={inTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleInTimeChange}
              />
            )}
            <Text style={{ fontSize: 12, color: '#6B7280' }}> {formattedInTime}</Text>
          </View>

          <View style={{ paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              Out Time
            </Text>
            <Button title="Pick Out Time" onPress={() => setShowOutTimePicker(true)} />
            {showOutTimePicker && (
              <DateTimePicker
                value={outTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleOutTimeChange}
              />
            )}
            <Text style={{ fontSize: 12, color: '#6B7280' }}> {formattedOutTime}</Text>
          </View>


          <View style={{ paddingBottom: 10 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              Hours
            </Text>

            <TextInput
              keyboardType='numeric'
              value={hours}
              onChangeText={(e) => { sethours(e) }}
              maxLength={5}
              style={{ fontSize: 16, paddingVertical: 8, borderColor: 'gray', borderBottomWidth: 1 }}
            />
          </View>

          <View style={{ paddingBottom: 10 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              Discount
            </Text>
            <Picker
              selectedValue={discount}
              onValueChange={(itemValue) => setdiscount(itemValue)}
              style={{ fontSize: 16, paddingVertical: 8, borderColor: 'gray', borderBottomWidth: 1 }}
            >
              <Picker.Item label="None" value="None" />
              <Picker.Item label="Happy Hours" value="Happy Hours" />
            </Picker>
          </View>

          <View style={{ paddingBottom: 10 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              Number of Players
            </Text>

            <QuantitySelector
              initialQuantity={noOfPlayers}
              onQuantityChange={(quantity) => setnoOfPlayers(quantity)}
            />
          </View>

          <View style={{ paddingBottom: 10 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              Snacks
            </Text>

            <QuantitySelector
              initialQuantity={Snacks}
              onQuantityChange={(quantity) => setSnacks(quantity)}
            />
          </View>

          <View style={{ paddingBottom: 10 }}>
            <Text style={{ fontSize: 16, textTransform: 'uppercase', fontWeight: 500 }}>
              Water
            </Text>

            <QuantitySelector
              initialQuantity={WaterBottle}
              onQuantityChange={(quantity) => setWaterBottle(quantity)}
            />
          </View>


          <Button title='Add' onPress={handleAddSession} />
        </ScrollView>
      </Modal>
    </>
  );
}
