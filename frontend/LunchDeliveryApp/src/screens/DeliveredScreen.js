import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
import api from '../services/api';

const DeliveredScreen = () => {
  const [delivered, setDelivered] = useState([]);
  const [date, setDate] = useState('');

  const fetchDelivered = async () => {
    if (!date) return;
    const { data } = await api.get(`/deliveries?date=${date}`);
    setDelivered(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivered Lunches</Text>
      <TextInput style={styles.input} placeholder="Enter Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
      <Button title="Search" onPress={fetchDelivered} />
      <FlatList
        data={delivered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.delivered}>
            <Text>{item.release_date} - {item.name}</Text>
            <Text>Quantity: {item.quantity}</Text>
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
  delivered: { padding: 10, marginBottom: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
});

export default DeliveredScreen;
