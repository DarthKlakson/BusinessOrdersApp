import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService } from '../api/apiService';
import { Client, Order, Product } from '../types/models';
import { RootStackParamList } from '../navigation/types';

type OrdersScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OrderDetails'
>;

function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return {
        container: styles.statusCompleted,
        text: styles.statusCompletedText,
        label: 'Zakończone',
      };
    case 'new':
      return {
        container: styles.statusNew,
        text: styles.statusNewText,
        label: 'Nowe',
      };
    case 'inprogress':
      return {
        container: styles.statusInProgress,
        text: styles.statusInProgressText,
        label: 'W realizacji',
      };
    default:
      return {
        container: styles.statusDefault,
        text: styles.statusDefaultText,
        label: status,
      };
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString('pl-PL');
}

const STATUS_OPTIONS = [
  { label: 'Nowe', value: 'New' },
  { label: 'W realizacji', value: 'InProgress' },
  { label: 'Zakończone', value: 'Completed' },
];

type PickerModalProps = {
  visible: boolean;
  title: string;
  options: Array<{
    label: string;
    value: string;
  }>;
  onClose: () => void;
  onSelect: (value: string) => void;
};

function PickerModal({ visible, title, options, onClose, onSelect }: PickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>

          <FlatList
            data={options}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <Pressable
                style={styles.modalOption}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <Text style={styles.modalOptionText}>{item.label}</Text>
              </Pressable>
            )}
          />

          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Zamknij</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function OrdersScreen() {
  const navigation = useNavigation<OrdersScreenNavigationProp>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientLabel, setClientLabel] = useState('');
  const [status, setStatus] = useState('New');
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductLabel, setSelectedProductLabel] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [items, setItems] = useState<Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>>([]);

  const loadOrders = async () => {
    try {
      const [ordersData, clientsData, productsData] = await Promise.all([
        apiService.getOrders(),
        apiService.getClients(),
        apiService.getProducts(),
      ]);
      setOrders(ordersData);
      setClients(clientsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  const resetForm = () => {
    setClientId(null);
    setClientLabel('');
    setStatus('New');
    setSelectedProductId(null);
    setSelectedProductLabel('');
    setSelectedQuantity('');
    setItems([]);
  };

  const addItem = () => {
    if (selectedProductId === null || !selectedQuantity.trim()) {
      Alert.alert('Brak danych', 'Wybierz produkt i podaj ilość.');
      return;
    }

    const quantity = Number(selectedQuantity);
    if (Number.isNaN(quantity) || quantity <= 0) {
      Alert.alert('Błędne dane', 'Ilość musi być większa od zera.');
      return;
    }

    const product = products.find(item => item.id === selectedProductId);
    if (!product) {
      Alert.alert('Błąd', 'Nie znaleziono wybranego produktu.');
      return;
    }

    setItems(current => {
      const existing = current.find(item => item.productId === product.id);
      if (existing) {
        return current.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
        },
      ];
    });

    setSelectedProductId(null);
    setSelectedProductLabel('');
    setSelectedQuantity('');
  };

  const handleCreate = async () => {
    if (clientId === null || !status.trim() || items.length === 0) {
      Alert.alert('Brak danych', 'Wybierz klienta, status i dodaj co najmniej jeden produkt.');
      return;
    }

    try {
      await apiService.createOrder({
        clientId,
        status,
        orderDate: new Date().toISOString(),
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      resetForm();
      await loadOrders();
    } catch (error) {
      console.error('Failed to create order', error);
      Alert.alert(
        'Błąd',
        error instanceof Error ? error.message : 'Nie udało się utworzyć zamówienia.',
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16324f" />
      </View>
    );
  }

  return (
    <>
      <PickerModal
        visible={clientModalVisible}
        title="Wybierz klienta"
        options={clients.map(item => ({
          label: item.name,
          value: item.id.toString(),
        }))}
        onClose={() => setClientModalVisible(false)}
        onSelect={value => {
          const client = clients.find(item => item.id === Number(value));
          if (!client) {
            return;
          }
          setClientId(client.id);
          setClientLabel(client.name);
        }}
      />
      <PickerModal
        visible={statusModalVisible}
        title="Wybierz status"
        options={STATUS_OPTIONS}
        onClose={() => setStatusModalVisible(false)}
        onSelect={setStatus}
      />
      <PickerModal
        visible={productModalVisible}
        title="Wybierz produkt"
        options={products.map(item => ({
          label: item.name,
          value: item.id.toString(),
        }))}
        onClose={() => setProductModalVisible(false)}
        onSelect={value => {
          const product = products.find(item => item.id === Number(value));
          if (!product) {
            return;
          }
          setSelectedProductId(product.id);
          setSelectedProductLabel(product.name);
        }}
      />

      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={orders}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Zamówienia</Text>
            <Text style={styles.subtitle}>Lista wszystkich zamówień w systemie</Text>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Dodaj zamówienie</Text>

              <Pressable style={styles.selector} onPress={() => setClientModalVisible(true)}>
                <Text style={clientLabel ? styles.selectorText : styles.selectorPlaceholder}>
                  {clientLabel || 'Wybierz klienta'}
                </Text>
              </Pressable>

              <Pressable style={styles.selector} onPress={() => setStatusModalVisible(true)}>
                <Text style={styles.selectorText}>
                  {STATUS_OPTIONS.find(item => item.value === status)?.label ?? status}
                </Text>
              </Pressable>

              <Pressable style={styles.selector} onPress={() => setProductModalVisible(true)}>
                <Text
                  style={selectedProductLabel ? styles.selectorText : styles.selectorPlaceholder}
                >
                  {selectedProductLabel || 'Wybierz produkt'}
                </Text>
              </Pressable>

              <TextInput
                style={styles.input}
                placeholder="Ilość produktu"
                value={selectedQuantity}
                onChangeText={setSelectedQuantity}
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
              />

              <View style={styles.formActions}>
                <Pressable style={styles.secondaryButton} onPress={addItem}>
                  <Text style={styles.secondaryButtonText}>Dodaj produkt</Text>
                </Pressable>
              </View>

              {items.map((item, index) => (
                <View key={`${item.productId}-${index}`} style={styles.orderItemRow}>
                  <View style={styles.orderItemTextBox}>
                    <Text style={styles.orderItemTitle}>{item.productName}</Text>
                    <Text style={styles.orderItemMeta}>
                      {item.quantity} szt. • {(item.unitPrice * item.quantity).toFixed(2)} zł
                    </Text>
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() =>
                      setItems(current => current.filter((_, currentIndex) => currentIndex !== index))
                    }
                  >
                    <Text style={styles.deleteButtonText}>Usuń</Text>
                  </Pressable>
                </View>
              ))}

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Kwota zamówienia</Text>
                <Text style={styles.totalValue}>
                  {items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2)} zł
                </Text>
              </View>

              <View style={styles.formActions}>
                <Pressable style={styles.primaryButton} onPress={handleCreate}>
                  <Text style={styles.primaryButtonText}>Dodaj</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={resetForm}>
                  <Text style={styles.secondaryButtonText}>Wyczyść</Text>
                </Pressable>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status);

          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
            >
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.orderNumber}>Zamówienie #{item.id}</Text>
                  <Text style={styles.clientName}>{item.clientName}</Text>
                </View>

                <View style={[styles.statusBadge, statusStyle.container]}>
                  <Text style={[styles.statusText, statusStyle.text]}>{statusStyle.label}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>Data</Text>
                  <Text style={styles.metaValue}>{formatDate(item.orderDate)}</Text>
                </View>

                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>Kwota</Text>
                  <Text style={styles.metaValue}>{item.totalAmount.toFixed(2)} zł</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Brak zamówień</Text>
            <Text style={styles.emptySubtitle}>
              Nie znaleziono żadnych rekordów do wyświetlenia.
            </Text>
          </View>
        }
      />
    </>
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
  selector: {
    borderWidth: 1,
    borderColor: '#d9e2ec',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
  },
  selectorText: {
    color: '#16324f',
    fontSize: 14,
  },
  selectorPlaceholder: {
    color: '#94a3b8',
    fontSize: 14,
  },
  totalBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d9e2ec',
  },
  totalLabel: {
    fontSize: 12,
    color: '#7b8794',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: '#16324f',
    fontWeight: '800',
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
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderItemTextBox: {
    flex: 1,
  },
  orderItemTitle: {
    color: '#16324f',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  orderItemMeta: {
    color: '#52606d',
    fontSize: 13,
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
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16324f',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: '#52606d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
  },
  statusCompletedText: {
    color: '#166534',
  },
  statusNew: {
    backgroundColor: '#fff7ed',
  },
  statusNewText: {
    color: '#c2410c',
  },
  statusInProgress: {
    backgroundColor: '#dbeafe',
  },
  statusInProgressText: {
    color: '#1d4ed8',
  },
  statusDefault: {
    backgroundColor: '#e5e7eb',
  },
  statusDefaultText: {
    color: '#374151',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaLabel: {
    fontSize: 12,
    color: '#7b8794',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 15,
    color: '#16324f',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    maxHeight: '70%',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16324f',
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#334e68',
  },
});
