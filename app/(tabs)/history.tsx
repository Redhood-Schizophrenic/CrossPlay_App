import { View, Text, Alert, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { API_URL } from '@/constants/url';

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

  return (
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
                        (items.Status === 'Close' ? '#FECACA' : 'gray')),
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
                  <Text style={{ fontWeight: 700, fontSize: 19 }}>Rs.{items.TotalPrice}</Text>
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

            </View>
          ))
        }
      </View>
    </ScrollView>
  )
}
