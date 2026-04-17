import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiService } from '../api/apiService';
import { DashboardDto } from '../types/models';

type StatCardProps = {
  value: number;
  label: string;
  accent?: 'default' | 'success' | 'warning';
};

function StatCard({ value, label, accent = 'default' }: StatCardProps) {
  const accentStyle =
    accent === 'success'
      ? styles.cardSuccess
      : accent === 'warning'
        ? styles.cardWarning
        : styles.cardDefault;

  return (
    <View style={[styles.card, accentStyle]}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [dashboard, setDashboard] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const data = await apiService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
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
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Business Orders App</Text>
        <Text style={styles.heroSubtitle}>
          Przegląd zamówień, klientów i stanów magazynowych.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Przegląd</Text>
        <View style={styles.grid}>
          <StatCard value={dashboard?.productsCount ?? 0} label="Produkty" />
          <StatCard value={dashboard?.clientsCount ?? 0} label="Klienci" />
          <StatCard value={dashboard?.ordersCount ?? 0} label="Zamówienia" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status zamówień</Text>
        <View style={styles.grid}>
          <StatCard value={dashboard?.newOrdersCount ?? 0} label="Nowe" accent="warning" />
          <StatCard
            value={dashboard?.completedOrdersCount ?? 0}
            label="Zakończone"
            accent="success"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alerty</Text>
        <View style={styles.grid}>
          <StatCard
            value={dashboard?.lowStockProductsCount ?? 0}
            label="Niski stan magazynowy"
            accent="warning"
          />
        </View>
      </View>
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
    gap: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    backgroundColor: '#16324f',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#16324f',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: '600',
    color: '#bfd7ea',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#d9e7f2',
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16324f',
  },
  grid: {
    gap: 14,
  },
  card: {
    borderRadius: 20,
    padding: 22,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
  },
  cardDefault: {
    borderColor: '#d9e2ec',
  },
  cardSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  cardWarning: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  cardValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#16324f',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 15,
    color: '#52606d',
    lineHeight: 20,
  },
});
