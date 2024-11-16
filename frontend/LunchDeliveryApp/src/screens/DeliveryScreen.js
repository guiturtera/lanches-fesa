import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
import api from '../services/api';

const DeliveryScreen = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [date, setDate] = useState('');

  const fetchDeliveries = async () => {
    if (!date) return;
    const { data } = await api.get(`/lunch_permissions?date=${date}`);
    setDeliveries(data);
  };

  const handleDeliver = async (id) => {
    await api.post('/deliveries', { permission_id: id });
    fetchDeliveries();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deliver Lunch</Text>
      <TextInput style={styles.input} placeholder="Enter Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
      <Button title="Search" onPress={fetchDeliveries} />
      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.delivery}>
            <Text>{item.release_date} - {item.name}</Text>
            <Text>Quantity: {item.quantity}</Text>
            {item.delivered === 0 ? (
              <Button title="Mark as Delivered" onPress={() => handleDeliver(item.id)} />
            ) : (
              <Text>Delivered</Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  delivery: { padding: 10, marginBottom: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
});

export default DeliveryScreen;
