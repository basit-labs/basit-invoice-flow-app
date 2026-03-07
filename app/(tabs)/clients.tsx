import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();
  const { clients, invoices, business, removeClient } = useData();
  const currency = business?.currency || 'USD';

  const clientsWithStats = useMemo(() => {
    return clients
      .map((client) => {
        const clientInvoices = invoices.filter((i) => i.clientId === client.id);
        const totalBilled = clientInvoices.reduce((sum, i) => sum + i.total, 0);
        const totalPaid = clientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
        return { ...client, totalBilled, totalPaid, invoiceCount: clientInvoices.length };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [clients, invoices]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Client', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeClient(id),
      },
    ]);
  };

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.title}>Clients</Text>
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/client/create');
          }}
          style={({ pressed }) => [
            styles.addBtn,
            { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <Feather name="plus" size={22} color={Colors.white} />
        </Pressable>
      </View>

      {clientsWithStats.length === 0 ? (
        <EmptyState
          icon="users"
          title="No clients yet"
          subtitle="Add your first client to start creating invoices"
          actionLabel="Add Client"
          onAction={() => router.push('/client/create')}
        />
      ) : (
        <FlatList
          data={clientsWithStats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={clientsWithStats.length > 0}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/client/[id]', params: { id: item.id } })
              }
              onLongPress={() => handleDelete(item.id, item.name)}
              style={({ pressed }) => [
                styles.clientCard,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <View style={styles.clientRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.email ? (
                    <Text style={styles.clientEmail} numberOfLines={1}>
                      {item.email}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.clientStats}>
                  <Text style={styles.clientAmount}>
                    {formatCurrency(item.totalBilled, currency)}
                  </Text>
                  <Text style={styles.invoiceCount}>
                    {item.invoiceCount} invoice{item.invoiceCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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
  list: {
    padding: 20,
  },
  clientCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  clientEmail: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clientStats: {
    alignItems: 'flex-end',
  },
  clientAmount: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  invoiceCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
