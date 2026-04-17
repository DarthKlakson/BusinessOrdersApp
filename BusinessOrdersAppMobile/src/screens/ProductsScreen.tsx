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
import { apiService } from '../api/apiService';
import { Category, Product, Supplier, UnitOfMeasurement } from '../types/models';

function isLowStock(product: Product) {
  return product.quantityInStock <= product.minimumStockLevel;
}

type PickerModalProps = {
  visible: boolean;
  title: string;
  options: string[];
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
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <Pressable
                style={styles.modalOption}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.modalOptionText}>{item}</Text>
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

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<UnitOfMeasurement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [supplier, setSupplier] = useState('');
  const [price, setPrice] = useState('');
  const [quantityInStock, setQuantityInStock] = useState('');
  const [minimumStockLevel, setMinimumStockLevel] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);

  const loadProducts = async () => {
    try {
      const [productsData, categoriesData, unitsData, suppliersData] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
        apiService.getUnitsOfMeasurement(),
        apiService.getSuppliers(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setUnits(unitsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('');
    setUnit('');
    setSupplier('');
    setPrice('');
    setQuantityInStock('');
    setMinimumStockLevel('');
  };

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !category.trim() ||
      !unit.trim() ||
      !supplier.trim() ||
      !price.trim() ||
      !quantityInStock.trim() ||
      !minimumStockLevel.trim()
    ) {
      Alert.alert('Brak danych', 'Uzupełnij wszystkie pola produktu.');
      return;
    }

    const payload = {
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim(),
      supplier: supplier.trim(),
      price: Number(price),
      quantityInStock: Number(quantityInStock),
      minimumStockLevel: Number(minimumStockLevel),
    };

    if (
      Number.isNaN(payload.price) ||
      Number.isNaN(payload.quantityInStock) ||
      Number.isNaN(payload.minimumStockLevel)
    ) {
      Alert.alert('Błędne dane', 'Cena i stany magazynowe muszą być liczbami.');
      return;
    }

    try {
      if (editingId === null) {
        await apiService.createProduct(payload);
      } else {
        await apiService.updateProduct(editingId, payload);
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error('Failed to save product', error);
      Alert.alert('Błąd', 'Nie udało się zapisać produktu.');
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setUnit(product.unit);
    setSupplier(product.supplier);
    setPrice(product.price.toString());
    setQuantityInStock(product.quantityInStock.toString());
    setMinimumStockLevel(product.minimumStockLevel.toString());
  };

  const confirmDelete = (id: number) => {
    Alert.alert('Usuń produkt', 'Czy na pewno chcesz usunąć ten produkt?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.deleteProduct(id);
            if (editingId === id) {
              resetForm();
            }
            await loadProducts();
          } catch (error) {
            console.error('Failed to delete product', error);
            Alert.alert('Błąd', 'Nie udało się usunąć produktu.');
          }
        },
      },
    ]);
  };

  return (
    <>
      <PickerModal
        visible={categoryModalVisible}
        title="Wybierz kategorię"
        options={categories.map(item => item.name)}
        onClose={() => setCategoryModalVisible(false)}
        onSelect={setCategory}
      />
      <PickerModal
        visible={unitModalVisible}
        title="Wybierz jednostkę miary"
        options={units.map(item => `${item.name} (${item.symbol})`)}
        onClose={() => setUnitModalVisible(false)}
        onSelect={value => setUnit(value.match(/\((.*)\)/)?.[1] ?? value)}
      />
      <PickerModal
        visible={supplierModalVisible}
        title="Wybierz dostawcę"
        options={suppliers.map(item => item.name)}
        onClose={() => setSupplierModalVisible(false)}
        onSelect={setSupplier}
      />

      {loading ? (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#16324f" />
        </View>
      ) : (
        <FlatList
          style={styles.container}
          contentContainerStyle={styles.content}
          data={products}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Produkty</Text>
              <Text style={styles.subtitle}>Lista produktów i stanów magazynowych</Text>

              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  {editingId === null ? 'Dodaj produkt' : 'Edytuj produkt'}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nazwa"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#94a3b8"
                />

                <Pressable style={styles.selector} onPress={() => setCategoryModalVisible(true)}>
                  <Text style={category ? styles.selectorText : styles.selectorPlaceholder}>
                    {category || 'Wybierz kategorię'}
                  </Text>
                </Pressable>

                <Pressable style={styles.selector} onPress={() => setUnitModalVisible(true)}>
                  <Text style={unit ? styles.selectorText : styles.selectorPlaceholder}>
                    {unit || 'Wybierz jednostkę miary'}
                  </Text>
                </Pressable>

                <Pressable style={styles.selector} onPress={() => setSupplierModalVisible(true)}>
                  <Text style={supplier ? styles.selectorText : styles.selectorPlaceholder}>
                    {supplier || 'Wybierz dostawcę'}
                  </Text>
                </Pressable>

                <TextInput
                  style={styles.input}
                  placeholder="Cena"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Stan magazynowy"
                  value={quantityInStock}
                  onChangeText={setQuantityInStock}
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Minimalny stan"
                  value={minimumStockLevel}
                  onChangeText={setMinimumStockLevel}
                  keyboardType="numeric"
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
          renderItem={({ item }) => {
            const lowStock = isLowStock(item);

            return (
              <View style={[styles.card, lowStock && styles.cardWarning]}>
                <View style={styles.cardTopRow}>
                  <View style={styles.cardTopText}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.meta}>
                      {item.category} • {item.unit}
                    </Text>
                    <Text style={styles.meta}>Dostawca: {item.supplier}</Text>
                  </View>

                  {lowStock && (
                    <View style={styles.warningBadge}>
                      <Text style={styles.warningBadgeText}>Niski stan</Text>
                    </View>
                  )}
                </View>

                <View style={styles.infoGrid}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Cena</Text>
                    <Text style={styles.infoValue}>{item.price.toFixed(2)} zł</Text>
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Stan</Text>
                    <Text style={styles.infoValue}>{item.quantityInStock}</Text>
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Minimum</Text>
                    <Text style={styles.infoValue}>{item.minimumStockLevel}</Text>
                  </View>
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
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Brak produktów</Text>
              <Text style={styles.emptySubtitle}>
                Nie znaleziono żadnych produktów do wyświetlenia.
              </Text>
            </View>
          }
        />
      )}
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
  cardWarning: {
    borderColor: '#fdba74',
    backgroundColor: '#fffaf5',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
  },
  cardTopText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16324f',
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: '#52606d',
    marginBottom: 2,
  },
  warningBadge: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  warningBadgeText: {
    color: '#c2410c',
    fontSize: 12,
    fontWeight: '700',
  },
  infoGrid: {
    gap: 10,
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
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
    fontSize: 15,
    color: '#16324f',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
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
