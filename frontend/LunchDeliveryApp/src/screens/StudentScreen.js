import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Image,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const StudentScreen = () => {
  const [students, setStudents] = useState([]);
  const [ra, setRa] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch (err) {
      setError('Falha ao buscar estudantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async () => {
    if (!ra || !name || !photo) {
      Alert.alert('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = { ra, name, photo };
      if (editId) {
        await api.put(`/students/${editId}`, payload);
        Alert.alert('Estudante atualizado com sucesso!');
      } else {
        await api.post('/students', payload);
        Alert.alert('Estudante adicionado com sucesso!');
      }
      resetForm();
      fetchStudents();
    } catch (err) {
      setError('Erro ao salvar estudante.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Excluir Estudante',
      'Tem certeza de que deseja excluir este estudante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            setLoading(true);
            try {
              await api.delete(`/students/${id}`);
              Alert.alert('Estudante excluído com sucesso!');
              fetchStudents();
            } catch (err) {
              setError('Erro ao excluir estudante.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (student) => {
    setRa(student.ra);
    setName(student.name);
    setPhoto(student.photo);
    setEditId(student.id);
  };

  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária para acessar a galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const resetForm = () => {
    setRa('');
    setName('');
    setPhoto('');
    setEditId(null);
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="RA"
        placeholderTextColor="#ccc"
        value={ra}
        onChangeText={setRa}
      />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#ccc"
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.imageTitle}>
        {editId ? 'Alterar Foto de Perfil' : 'Selecionar Foto de Perfil'}
      </Text>
      <TouchableOpacity style={styles.photoContainer} onPress={selectImage}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <Text style={styles.photoPlaceholder}>Nenhuma foto selecionada</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.submitButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {editId ? 'Atualizar Estudante' : 'Adicionar Estudante'}
        </Text>
      </TouchableOpacity>
      {editId && (
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={resetForm}>
          <Text style={styles.buttonText}>Cancelar Edição</Text>
        </TouchableOpacity>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.student}>
              <Image source={{ uri: item.photo }} style={styles.studentPhoto} />
              <View style={styles.info}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentRa}>RA: {item.ra}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(item)}
                >
                  <Ionicons name="pencil" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
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
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  imageTitle: {
    fontSize: 16,
    color: '#bbb',
    marginVertical: 10,
  },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    height: 120,
    backgroundColor: '#1e1e1e',
  },
  photoPlaceholder: {
    color: '#888',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#2196f3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  student: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 10,
  },
  studentPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  studentName: {
    color: '#fff',
    fontSize: 16,
  },
  studentRa: {
    color: '#bbb',
  },
  error: {
    color: '#f44336',
    marginBottom: 10,
  },
});

export default StudentScreen;
