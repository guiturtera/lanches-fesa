import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importando ícones
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const LunchPermissionScreen = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [quantity, setQuantity] = useState(1);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch (err) {
      setError('Erro ao carregar estudantes.');
    }
  };

  const fetchPermissions = async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const { data } = await api.get(`/lunch_permissions?date=${formattedDate}`);
      setPermissions(data);
    } catch (err) {
      setError('Erro ao carregar permissões.');
    }
  };

  const updateFilteredPermissions = () => {
    const filtered = permissions.filter((permission) => {
      const student = students.find((s) => s.id === permission.student_id);
      return student && student.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    return filtered;
  };

  const updateFilteredStudents = (query = '') => {
    const permittedStudentIds = permissions.map((p) => p.student_id);
    const availableStudents = students.filter(
      (s) => !permittedStudentIds.includes(s.id)
    );
    setFilteredStudents(
      availableStudents.filter((student) =>
        student.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  useEffect(() => {
    fetchStudents();
    fetchPermissions(selectedDate);
  }, []);

  useEffect(() => {
    updateFilteredStudents(searchQuery);
  }, [permissions, searchQuery, students]);

  const handleDateChange = async (event, selected) => {
    const currentDate = selected || selectedDate;
    setSelectedDate(currentDate);
    await fetchPermissions(currentDate);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    updateFilteredStudents(query);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 3) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !quantity) {
      Alert.alert('Erro', 'Selecione um aluno e preencha todos os campos.');
      return;
    }

    try {
      const payload = {
        student_id: selectedStudent.id,
        release_date: selectedDate.toISOString().split('T')[0],
        quantity,
      };

      if (editId) {
        await api.put(`/lunch_permissions/${editId}`, payload);
        Alert.alert('Sucesso', 'Permissão atualizada com sucesso!');
      } else {
        await api.post(`/lunch_permissions`, payload);
        Alert.alert('Sucesso', 'Permissão adicionada com sucesso!');
      }

      resetForm();
      fetchPermissions(selectedDate);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao salvar permissão.');
    }
  };

  const handleDeletePermission = async (permissionId) => {
    try {
      await api.delete(`/lunch_permissions/${permissionId}`);
      Alert.alert('Sucesso', 'Permissão removida com sucesso!');
      fetchPermissions(selectedDate);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao remover permissão.');
    }
  };

  const handleDeliverLunch = async (permissionId) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza de que deseja confirmar a entrega do lanche? Essa ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await api.post('/deliveries', { permission_id: permissionId });
              Alert.alert('Sucesso', 'Lanche entregue com sucesso!');
              fetchPermissions(selectedDate);
            } catch (err) {
              Alert.alert('Erro', 'Falha ao confirmar a entrega do lanche.');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setQuantity(1);
    setEditId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      
    <FlatList
      ListHeaderComponent={
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          
          <Text style={[styles.label, { marginBottom: 5 }]}>
            Pesquisar Aluno
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Pesquisar aluno pelo nome"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={(query) => {
              setSearchQuery(query);
              updateFilteredStudents(query);
            }}
          />

          {/* Formulário */}
          <View style={styles.row}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Data de Liberação</Text>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                themeVariant="dark"
                onChange={handleDateChange}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Lanches (1-3)</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(-1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={[styles.sectionTitle]}>Alunos Disponíveis</Text>
          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.studentCard,
                  selectedStudent?.id === item.id && styles.studentCardSelected,
                ]}
                onPress={() => setSelectedStudent(item)}
              >
                <Image
                  source={{ uri: item.photo }}
                  style={styles.studentPhoto}
                />
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentRa}>RA: {item.ra}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>
              {editId ? 'Atualizar Permissão' : 'Adicionar Permissão'}
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.sectionTitle]}>Alunos com Permissão</Text>
        </>
      }
      data={updateFilteredPermissions()}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        const student = students.find((s) => s.id === item.student_id);
        return (
          <View style={styles.permissionCard}>
            <Image
              source={{ uri: student?.photo }}
              style={styles.studentPhotoLeft}
            />
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionStudentName}>{student?.name}</Text>
              <Text style={styles.permissionText}>
                Lanches: {item.quantity}
              </Text>
              <Text style={styles.permissionRa}>RA: {student?.ra}</Text>
            </View>
            <TouchableOpacity
              style={styles.deliverButton}
              onPress={() => handleDeliverLunch(item.id)}
              disabled={item.delivered === 1}
            >
              <View style={item.delivered === 1 ? styles.deliverCircle : styles.notDeliveredCircle}>
                <Icon
                  name="check-circle"
                  size={20}
                  color={item.delivered === 1 ? '#ccc' : '#d3d3d3'}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={item.delivered === 1 ? styles.deleteButtonDisabled : styles.deleteButton}
              onPress={() => handleDeletePermission(item.id)}
              disabled={item.delivered === 1}
            >
              <View style={styles.deleteCircle}>
                <Ionicons name="trash" size={20} color={item.delivered === 1 ? '#ccc' : '#fff'} />
              </View>
            </TouchableOpacity>
          </View>
        );
      }}
    />
  </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  fieldContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 5,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#555',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    color: '#fff',
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    marginBottom: 10,
  },
  studentCard: {
    width: 100,
    height: 120,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  studentCardSelected: {
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  studentPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  studentName: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
  },
  studentRa: {
    color: '#bbb',
    textAlign: 'center',
    fontSize: 10,
  },
  button: {
    backgroundColor: '#4caf50',
    borderRadius: 5,
    alignItems: 'center',
    padding: 12,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  permissionCard: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    alignItems: 'center',
  },
  studentPhotoLeft: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  permissionInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  permissionStudentName: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  permissionText: {
    color: '#bbb',
    fontSize: 12,
    textAlign: 'left',
  },
  permissionRa: {
    color: '#bbb',
    fontSize: 12,
    textAlign: 'left',
  },
  deliverButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deliverCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notDeliveredCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d3d3d3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: .2
  },
  deleteCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#ff5252',
    fontSize: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});


export default LunchPermissionScreen;
