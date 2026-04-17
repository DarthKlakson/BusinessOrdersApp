import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiService } from '../api/apiService';
import { Client } from '../types/models';

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const loadClients = async () => {
    try {
      const data = await apiService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Brak danych', 'Uzupełnij wszystkie pola klienta.');
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    try {
      if (editingId === null) {
        await apiService.createClient(payload);
      } else {
        await apiService.updateClient(editingId, payload);
      }

      resetForm();
      await loadClients();
    } catch (error) {
      console.error('Failed to save client', error);
      Alert.alert('Błąd', 'Nie udało się zapisać klienta.');
    }
  };

  const startEdit = (client: Client) => {
    setEditingId(client.id);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);
    setAddress(client.address);
  };

  const confirmDelete = (id: number) => {
    Alert.alert('Usuń klienta', 'Czy na pewno chcesz usunąć tego klienta?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.deleteClient(id);
            if (editingId === id) {
              resetForm();
            }
            await loadClients();
          } catch (error) {
            console.error('Failed to delete client', error);
            Alert.alert('Błąd', 'Nie udało się usunąć klienta.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16324f" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={clients}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Klienci</Text>
          <Text style={styles.subtitle}>Lista klientów zapisanych w systemie</Text>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId === null ? 'Dodaj klienta' : 'Edytuj klienta'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nazwa"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Telefon"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Adres"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#94a3b8"
            />

            <View style={styles.formActions}>
              <Pressable style={styles.primaryButton} onPress={handleSubmit}>
                <Text style={styles.primaryButtonText}>
                  {editingId === null ? 'Dodaj' : 'Zapisz'}
                </Text>
              </Pressable>

              {editingId !== null && (
                <Pressable style={styles.secondaryButton} onPress={resetForm}>
                  <Text style={styles.secondaryButtonText}>Anuluj</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.trim().charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>{item.email}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Telefon</Text>
              <Text style={styles.infoValue}>{item.phone}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Adres</Text>
              <Text style={styles.infoValue}>{item.address}</Text>
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={styles.editButton} onPress={() => startEdit(item)}>
                <Text style={styles.editButtonText}>Edytuj</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => confirmDelete(item.id)}>
                <Text style={styles.deleteButtonText}>Usuń</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Brak klientów</Text>
          <Text style={styles.emptySubtitle}>Nie znaleziono żadnych klientów do wyświetlenia.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6f9',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 8,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#16324f',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#5c6b73',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e4e7eb',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16324f',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9e2ec',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#16324f',
    backgroundColor: '#f8fafc',
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#16324f',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#334e68',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e4e7eb',
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#16324f',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
    gap: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16324f',
  },
  infoBlock: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#7b8794',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#334e68',
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  editButtonText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16324f',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
