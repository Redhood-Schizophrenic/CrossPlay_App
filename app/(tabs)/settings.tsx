import { API_URL } from '@/constants/url';
import { useState } from 'react';
import { Alert, Button, Modal, Text, TextInput, View } from 'react-native';

export default function SettingsScreen() {

  const [isModelOpen, setisModelOpen] = useState(false);
  const [type, settype] = useState('');
  const [devicename, setdevicename] = useState('');

  async function handleAddDeivces() {
    try {

      if (devicename === '') {
        Alert.alert('Please enter device name');
      } else {
        if (type === 'PS') {
          const res = await fetch(`${API_URL}/api/devices/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              "category_id": 'c495dcc9-6af5-4319-b39d-6cd6dafa49bf',
              "device_name": devicename
            }),
          });

          if (res.ok) {
            const data = await res.json();
            console.log(data)
            Alert.alert('PlayStation Added');
          } else {
            Alert.alert(`Error occured while adding Playstation`)
          }
        } else if (type === 'PC') {
          const res = await fetch(`${API_URL}/api/devices/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              "category_id": '63f7bbff-ad1a-4a48-bdb3-6a93ec5eb9e1',
              "device_name": devicename
            }),
          });

          if (res.ok) {
            Alert.alert('Gaming PC Added');
          } else {
            Alert.alert(`Error Occured while adding PC`)
          }
        }
      }
      setisModelOpen(false);

    } catch (e: any) {
      throw console.error(e);
    }
  }

  return (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}
    >
      <View style={{ width: '100%', padding: 25, gap: 15 }}>
        <Button title='Add PlayStation' onPress={() => { setisModelOpen(true); settype('PS') }} />
        <Button title='Add Gaming PC' onPress={() => { setisModelOpen(true); settype('PC') }} />
      </View>
      <Modal
        visible={isModelOpen}
        animationType='slide'
        onRequestClose={() => { setisModelOpen(false); }}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 18 }}>Add {type} here:-</Text>
          <View
            style={{ width: '100%', padding: 25, gap: 20 }}
          >
            <TextInput
              value={devicename}
              onChangeText={(e) => { setdevicename(e) }}
              style={{ fontSize: 20, padding: 4, borderColor: 'gray', borderWidth: 1 }}
            />
            <Button title='Add' onPress={handleAddDeivces} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
