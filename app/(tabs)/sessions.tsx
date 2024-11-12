import { View, Text, Alert, ScrollView, TouchableOpacity, RefreshControl, Modal, Button, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import QuantitySelector from '@/components/QuantitySelector';
import { API_URL } from '@/constants/url';

export default function SessionsScreen() {

  const [Sessions, setSessions]: any = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setisModalOpen] = useState(false);
  const [isSnacksModalOpen, setisSnacksModalOpen] = useState(false);
  const [session_id, setsession_id] = useState('');
  const [minutes, setminutes] = useState('');
  const [outTime, setOutTime] = useState(new Date());
  const [showOutTimePicker, setShowOutTimePicker] = useState(false);
  const [Snacks, setSnacks] = useState(0);
  const [WaterBottle, setWaterBottle] = useState(0);

  const out_time: string = outTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleOutTimeChange = (event: any, selectedTime: Date) => {

    const currentTime = selectedTime;
    setShowOutTimePicker(Platform.OS === 'ios');
    setOutTime(currentTime);
  };

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
            "out_time": out_time
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
    <>
      <ScrollView
        contentContainerStyle={{ padding: 15, }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleFetchSessions} />
        }
      >
        <View style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          {
            Sessions?.map((items: any, index: any) => (
              <View
                key={index}
                style={{ backgroundColor: '#fff', elevation: 8, padding: 15, borderRadius: 10, display: 'flex', flexDirection: "column", gap: 10 }}
              >
                <View style={{ width: "100%" }}>
                  <TouchableOpacity
                    style={{
                      width: "100%",
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 10,
                      backgroundColor: items.Status === 'Open' ? '#A7F3D0' :
                        (items.Status === 'Extended' ? '#FDE68A' :
                          (items.Status === 'Close' ? '#FECACA' : 'black')),
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold', fontSize: 19,
                        color: items.Status === 'Open' ? '#10B981' :
                          (items.Status === 'Extended' ? '#F59E0B' :
                            (items.Status === 'Close' ? '#EF4444' : 'black')),
                      }}
                    >
                      {items.Status}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}
                >
                  <TouchableOpacity
                    style={{ width: "auto", alignItems: 'center', backgroundColor: '#F59E0B', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 }}
                    onPress={() => {
                      setisSnacksModalOpen(true); setsession_id(items.id);
                      setSnacks(items.Snacks); setWaterBottle(items.WaterBottles)
                    }}
                  >
                    <FontAwesome name='glass' style={{ color: '#fff', fontWeight: 100, fontSize: 18 }} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ width: "auto", alignItems: 'center', backgroundColor: '#60A5FA', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 }}
                    onPress={() => { setisModalOpen(true); setsession_id(items.id); }}
                  >
                    <FontAwesome name='plus' style={{ color: '#fff', fontWeight: 100, fontSize: 20 }} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ width: "auto", alignItems: 'center', backgroundColor: '#10B981', padding: 10, borderRadius: 10 }}
                    onPress={() => { handleSessionClosed(items.id) }}
                  >
                    <FontAwesome name='check' style={{ color: '#fff', fontWeight: 100, fontSize: 20 }} />
                  </TouchableOpacity>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ color: "gray", fontSize: 17, fontWeight: 400 }}>Date</Text>
                    <Text style={{ fontWeight: 700, fontSize: 19 }}>{items.Date}</Text>
                  </View>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ color: "gray", fontSize: 17, fontWeight: 400 }}>Customer</Text>
                    <Text style={{ fontWeight: 700, fontSize: 19 }}>{items.CustomerName}</Text>
                  </View>
                  <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ color: "gray", fontSize: 17, textAlign: 'right', fontWeight: 400 }}>
                      Price
                    </Text>
                    <Text style={{ fontWeight: 700, fontSize: 19 }}>Rs.{items.SessionPrice}</Text>
                  </View>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ color: "gray", fontSize: 17, fontWeight: 400 }}>In Time</Text>
                    <Text style={{ fontWeight: 700, fontSize: 19 }}>{items.InTime}</Text>
                  </View>
                  <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ color: "gray", fontSize: 17, textAlign: 'right', fontWeight: 400 }}>
                      Out Time
                    </Text>
                    <Text style={{ fontWeight: 700, fontSize: 19 }}>{items.OutTime}</Text>
                  </View>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ color: "gray", fontSize: 17, fontWeight: 400 }}>Snacks</Text>
                    <Text style={{ fontWeight: 700, fontSize: 19 }}>{items.Snacks}</Text>
                  </View>
                  <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ color: "gray", fontSize: 17, textAlign: 'right', fontWeight: 400 }}>
                      Water
                    </Text>
                    <Text style={{ fontWeight: 700, fontSize: 19, textAlign: 'right' }}>{items.WaterBottles}</Text>
                  </View>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontWeight: 700, fontSize: 23, textAlign: 'right' }}>{items.Device.DeviceName}</Text>
                  </View>
                </View>

              </View>
            ))
          }
        </View>
      </ScrollView>

      <Modal
        visible={isSnacksModalOpen}
        animationType='slide'
        onRequestClose={() => { setisSnacksModalOpen(false) }}
      >
        <ScrollView
          contentContainerStyle={{ width: '100%', padding: 30, gap: 20 }}
        >

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

          <Button title='Edit' onPress={handleSessionSnacks} />
        </ScrollView>
      </Modal>

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
              Minutes
            </Text>
            <Picker
              selectedValue={minutes}
              onValueChange={(itemValue: any) => setminutes(itemValue)}
              style={{ fontSize: 16, paddingVertical: 8, borderColor: 'gray', borderBottomWidth: 1 }}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="15 min" value="15" />
              <Picker.Item label="30 min" value="30" />
              <Picker.Item label="1 Hour" value="60" />
            </Picker>
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
            <Text style={{ fontSize: 12, color: '#6B7280' }}> {out_time}</Text>
          </View>

          <Button title='Extend' onPress={handleSessionExtend} />
        </ScrollView>
      </Modal>

    </>
  )
}
