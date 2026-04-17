import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { apiService } from '../api/apiService';
import { OrderDetails, Product } from '../types/models';
import { RootStackParamList } from '../navigation/types';

type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

type EditableOrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

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

export default function OrderDetailsScreen() {
  const route = useRoute<OrderDetailsRouteProp>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editableItems, setEditableItems] = useState<EditableOrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductLabel, setSelectedProductLabel] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncEditableItems = (details: OrderDetails) => {
    setEditableItems(details.items);
  };

  const loadOrder = async () => {
    try {
      const [orderData, productsData] = await Promise.all([
        apiService.getOrderById(orderId),
        apiService.getProducts(),
      ]);
      setOrder(orderData);
      setProducts(productsData);
      syncEditableItems(orderData);
    } catch (error) {
      console.error('Failed to load order details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const changeStatus = async (status: string) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      await loadOrder();
    } catch (error) {
      console.error('Failed to update status', error);
      Alert.alert(
        'Błąd',
        error instanceof Error
          ? error.message
          : 'Nie udało się zmienić statusu zamówienia.',
      );
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setEditableItems(current =>
      current
        .map(item =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + delta,
                lineTotal: (item.quantity + delta) * item.unitPrice,
              }
            : item,
        )
        .filter(item => item.quantity > 0),
    );
  };

  const removeItem = (productId: number) => {
    setEditableItems(current => current.filter(item => item.productId !== productId));
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

    setEditableItems(current => {
      const existing = current.find(item => item.productId === product.id);
      if (existing) {
        return current.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                lineTotal: (item.quantity + quantity) * item.unitPrice,
              }
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
          lineTotal: product.price * quantity,
        },
      ];
    });

    setSelectedProductId(null);
    setSelectedProductLabel('');
    setSelectedQuantity('');
  };

  const saveItems = async () => {
    if (editableItems.length === 0) {
      Alert.alert('Błąd', 'Zamówienie musi zawierać co najmniej jedną pozycję.');
      return;
    }

    try {
      await apiService.updateOrderItems(
        orderId,
        editableItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );
      await loadOrder();
      Alert.alert('Sukces', 'Pozycje zamówienia zostały zapisane.');
    } catch (error) {
      console.error('Failed to update order items', error);
      Alert.alert(
        'Błąd',
        error instanceof Error
          ? error.message
          : 'Nie udało się zapisać pozycji zamówienia.',
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

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Nie udało się wczytać zamówienia.</Text>
      </View>
    );
  }

  const status = getStatusStyle(order.status);
  const total = editableItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <>
      <PickerModal
        visible={productModalVisible}
        title="Wybierz produkt"
        options={products.map(item => ({
          label: `${item.name} (stan: ${item.quantityInStock}, min: ${item.minimumStockLevel})`,
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

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.orderNumber}>Zamówienie #{order.id}</Text>
              <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
            </View>

            <View style={[styles.statusBadge, status.container]}>
              <Text style={[styles.statusText, status.text]}>{status.label}</Text>
            </View>
          </View>

          <Text style={styles.totalLabel}>Łączna kwota</Text>
          <Text style={styles.totalValue}>{total.toFixed(2)} zł</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zmień status</Text>
          <View style={styles.statusActions}>
            <Pressable style={styles.statusActionButton} onPress={() => changeStatus('New')}>
              <Text style={styles.statusActionText}>Nowe</Text>
            </Pressable>
            <Pressable
              style={styles.statusActionButton}
              onPress={() => changeStatus('InProgress')}
            >
              <Text style={styles.statusActionText}>W realizacji</Text>
            </Pressable>
            <Pressable
              style={styles.statusActionButton}
              onPress={() => changeStatus('Completed')}
            >
              <Text style={styles.statusActionText}>Zakończone</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Klient</Text>
          <View style={styles.card}>
            <Text style={styles.clientName}>{order.clientName}</Text>
            <Text style={styles.meta}>{order.clientEmail}</Text>
            <Text style={styles.meta}>{order.clientPhone}</Text>
            <Text style={styles.meta}>{order.clientAddress}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dodaj pozycję</Text>
          <View style={styles.card}>
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

            <Pressable style={styles.primaryButton} onPress={addItem}>
              <Text style={styles.primaryButtonText}>Dodaj produkt</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pozycje zamówienia</Text>

          {editableItems.map((item, index) => (
            <View key={`${item.productId}-${index}`} style={styles.card}>
              <Text style={styles.itemName}>{item.productName}</Text>

              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Ilość</Text>
                <View style={styles.quantityActions}>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.productId, -1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.itemValue}>{item.quantity}</Text>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.productId, 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Cena jednostkowa</Text>
                <Text style={styles.itemValue}>{item.unitPrice.toFixed(2)} zł</Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Wartość</Text>
                <Text style={styles.itemStrong}>{item.lineTotal.toFixed(2)} zł</Text>
              </View>

              <Pressable
                style={styles.dangerButton}
                onPress={() => removeItem(item.productId)}
              >
                <Text style={styles.dangerButtonText}>Usuń pozycję</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable style={styles.primaryButton} onPress={saveItems}>
          <Text style={styles.primaryButtonText}>Zapisz pozycje zamówienia</Text>
        </Pressable>
      </ScrollView>
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
    gap: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#52606d',
    fontSize: 15,
  },
  heroCard: {
    backgroundColor: '#16324f',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#16324f',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
    gap: 12,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  orderDate: {
    fontSize: 14,
    color: '#d9e7f2',
  },
  totalLabel: {
    fontSize: 13,
    color: '#bfd7ea',
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16324f',
  },
  statusActions: {
    gap: 10,
  },
  statusActionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#d9e2ec',
  },
  statusActionText: {
    color: '#16324f',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e4e7eb',
    gap: 8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16324f',
  },
  meta: {
    fontSize: 14,
    color: '#52606d',
  },
  selector: {
    borderWidth: 1,
    borderColor: '#d9e2ec',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorText: {
    color: '#16324f',
    fontSize: 15,
    fontWeight: '600',
  },
  selectorPlaceholder: {
    color: '#94a3b8',
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9e2ec',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#16324f',
  },
  primaryButton: {
    backgroundColor: '#16324f',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#16324f',
    fontSize: 14,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#fff1f2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecdd3',
    marginTop: 6,
  },
  dangerButtonText: {
    color: '#be123c',
    fontSize: 13,
    fontWeight: '700',
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#16324f',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  itemLabel: {
    fontSize: 14,
    color: '#7b8794',
  },
  itemValue: {
    fontSize: 14,
    color: '#334e68',
    fontWeight: '600',
  },
  itemStrong: {
    fontSize: 15,
    color: '#16324f',
    fontWeight: '800',
  },
  quantityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#16324f',
    fontSize: 18,
    fontWeight: '800',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16324f',
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalOptionText: {
    color: '#334e68',
    fontSize: 16,
  },
});
