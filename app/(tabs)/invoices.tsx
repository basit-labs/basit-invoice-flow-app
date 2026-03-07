import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import type { InvoiceStatus } from '@/lib/types';
import InvoiceCard from '@/components/InvoiceCard';
import EmptyState from '@/components/EmptyState';

const FILTERS: { label: string; value: InvoiceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
];

export default function InvoicesScreen() {
  const insets = useSafeAreaInsets();
  const { invoices, business } = useData();
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');
  const currency = business?.currency || 'USD';

  const filtered = useMemo(() => {
    let list = [...invoices];
    if (filter !== 'all') {
      list = list.filter((i) => i.status === filter);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [invoices, filter]);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Invoices</Text>
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/invoice/create');
            }}
            style={({ pressed }) => [
              styles.addBtn,
              { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <Feather name="plus" size={22} color={Colors.white} />
          </Pressable>
        </View>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setFilter(item.value)}
              style={[
                styles.filterChip,
                filter === item.value && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item.value && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="file-text"
          title={filter === 'all' ? 'No invoices yet' : `No ${filter} invoices`}
          subtitle="Tap the + button to create a new invoice"
          actionLabel="Create Invoice"
          onAction={() => router.push('/invoice/create')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={filtered.length > 0}
          renderItem={({ item }) => (
            <InvoiceCard
              invoice={item}
              currency={currency}
              onPress={() =>
                router.push({ pathname: '/invoice/[id]', params: { id: item.id } })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  list: {
    padding: 20,
  },
});
