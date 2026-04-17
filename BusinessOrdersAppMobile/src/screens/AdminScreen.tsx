import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiService } from '../api/apiService';
import { Category, Supplier, UnitOfMeasurement, Worker } from '../types/models';

type FieldConfig<T> = {
  key: keyof T;
  label: string;
  placeholder: string;
};

type CrudSectionProps<T extends { id: number }> = {
  title: string;
  subtitle: string;
  items: T[];
  fields: FieldConfig<Omit<T, 'id'>>[];
  createEmpty: () => Omit<T, 'id'>;
  renderLabel: (item: T) => string;
  onCreate: (item: Omit<T, 'id'>) => Promise<void>;
  onUpdate: (id: number, item: Omit<T, 'id'>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

function CrudSection<T extends { id: number }>({
  title,
  subtitle,
  items,
  fields,
  createEmpty,
  renderLabel,
  onCreate,
  onUpdate,
  onDelete,
}: CrudSectionProps<T>) {
  const [form, setForm] = useState<Omit<T, 'id'>>(createEmpty());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key: keyof Omit<T, 'id'>, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(createEmpty());
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (editingId === null) {
        await onCreate(form);
      } else {
        await onUpdate(editingId, form);
      }
      resetForm();
    } catch (error) {
      console.error(`Failed to save ${title}`, error);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item: T) => {
    const { id, ...rest } = item;
    setEditingId(id);
    setForm(rest as Omit<T, 'id'>);
  };

  const confirmDelete = (id: number) => {
    Alert.alert('Usuń rekord', `Usunąć element z sekcji "${title}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await onDelete(id);
            if (editingId === id) {
              resetForm();
            }
          } catch (error) {
            console.error(`Failed to delete ${title}`, error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>

      <View style={styles.formCard}>
        {fields.map((field) => (
          <View key={`${title}-${String(field.key)}`} style={styles.inputBlock}>
            <Text style={styles.inputLabel}>{field.label}</Text>
            <TextInput
              value={String(form[field.key] ?? '')}
              onChangeText={(value) => updateField(field.key, value)}
              placeholder={field.placeholder}
              style={styles.input}
              placeholderTextColor="#94a3b8"
            />
          </View>
        ))}

        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
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

      {items.length === 0 ? (
        <Text style={styles.emptyText}>Brak danych</Text>
      ) : (
        items.map((item) => (
          <View key={`${title}-${item.id}`} style={styles.row}>
            <Text style={styles.rowText}>{renderLabel(item)}</Text>

            <View style={styles.rowActions}>
              <Pressable style={styles.smallEditButton} onPress={() => startEdit(item)}>
                <Text style={styles.smallEditButtonText}>Edytuj</Text>
              </Pressable>
              <Pressable style={styles.smallDeleteButton} onPress={() => confirmDelete(item.id)}>
                <Text style={styles.smallDeleteButtonText}>Usuń</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

export default function AdminScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<UnitOfMeasurement[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async () => {
    try {
      const [categoriesData, unitsData, workersData, suppliersData] = await Promise.all([
        apiService.getCategories(),
        apiService.getUnitsOfMeasurement(),
        apiService.getWorkers(),
        apiService.getSuppliers(),
      ]);

      setCategories(categoriesData);
      setUnits(unitsData);
      setWorkers(workersData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Failed to load admin data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16324f" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Administracja</Text>
        <Text style={styles.subtitle}>Prosty CRUD dla dodatkowych klas projektu</Text>
      </View>

      <CrudSection
        title="Kategorie"
        subtitle={`${categories.length} rekordów`}
        items={categories}
        fields={[
          { key: 'name', label: 'Nazwa', placeholder: 'Np. Biuro' },
          { key: 'description', label: 'Opis', placeholder: 'Opis kategorii' },
        ]}
        createEmpty={() => ({ name: '', description: '' })}
        renderLabel={(x) => `${x.name} - ${x.description}`}
        onCreate={async (item) => {
          await apiService.createCategory(item);
          await loadAll();
        }}
        onUpdate={async (id, item) => {
          await apiService.updateCategory(id, item);
          await loadAll();
        }}
        onDelete={async (id) => {
          await apiService.deleteCategory(id);
          await loadAll();
        }}
      />

      <CrudSection
        title="Jednostki miary"
        subtitle={`${units.length} rekordów`}
        items={units}
        fields={[
          { key: 'name', label: 'Nazwa', placeholder: 'Np. Sztuka' },
          { key: 'symbol', label: 'Symbol', placeholder: 'Np. szt.' },
        ]}
        createEmpty={() => ({ name: '', symbol: '' })}
        renderLabel={(x) => `${x.name} (${x.symbol})`}
        onCreate={async (item) => {
          await apiService.createUnitOfMeasurement(item);
          await loadAll();
        }}
        onUpdate={async (id, item) => {
          await apiService.updateUnitOfMeasurement(id, item);
          await loadAll();
        }}
        onDelete={async (id) => {
          await apiService.deleteUnitOfMeasurement(id);
          await loadAll();
        }}
      />

      <CrudSection
        title="Pracownicy"
        subtitle={`${workers.length} rekordów`}
        items={workers}
        fields={[
          { key: 'firstName', label: 'Imię', placeholder: 'Np. Anna' },
          { key: 'lastName', label: 'Nazwisko', placeholder: 'Np. Nowak' },
          { key: 'email', label: 'E-mail', placeholder: 'Np. anna@firma.pl' },
          { key: 'position', label: 'Stanowisko', placeholder: 'Np. Handlowiec' },
        ]}
        createEmpty={() => ({ firstName: '', lastName: '', email: '', position: '' })}
        renderLabel={(x) => `${x.firstName} ${x.lastName} - ${x.position}`}
        onCreate={async (item) => {
          await apiService.createWorker(item);
          await loadAll();
        }}
        onUpdate={async (id, item) => {
          await apiService.updateWorker(id, item);
          await loadAll();
        }}
        onDelete={async (id) => {
          await apiService.deleteWorker(id);
          await loadAll();
        }}
      />

      <CrudSection
        title="Dostawcy"
        subtitle={`${suppliers.length} rekordów`}
        items={suppliers}
        fields={[
          { key: 'name', label: 'Nazwa', placeholder: 'Np. Office Supply' },
          { key: 'email', label: 'E-mail', placeholder: 'Np. biuro@firma.pl' },
          { key: 'phone', label: 'Telefon', placeholder: 'Np. 123456789' },
          { key: 'address', label: 'Adres', placeholder: 'Np. ul. Handlowa 10' },
        ]}
        createEmpty={() => ({ name: '', email: '', phone: '', address: '' })}
        renderLabel={(x) => `${x.name} - ${x.phone}`}
        onCreate={async (item) => {
          await apiService.createSupplier(item);
          await loadAll();
        }}
        onUpdate={async (id, item) => {
          await apiService.updateSupplier(id, item);
          await loadAll();
        }}
        onDelete={async (id) => {
          await apiService.deleteSupplier(id);
          await loadAll();
        }}
      />
    </ScrollView>
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
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 8,
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
  sectionCard: {
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
    gap: 10,
  },
  formCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  inputBlock: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#16324f',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#16324f',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#16324f',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16324f',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#7b8794',
    marginBottom: 4,
  },
  row: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  rowText: {
    color: '#334e68',
    fontSize: 14,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallEditButton: {
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallEditButtonText: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 12,
  },
  smallDeleteButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallDeleteButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyText: {
    color: '#7b8794',
    fontSize: 14,
  },
});
