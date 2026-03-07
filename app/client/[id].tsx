import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import InvoiceCard from '@/components/InvoiceCard';
import EmptyState from '@/components/EmptyState';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients, invoices, business, removeClient } = useData();
  const client = clients.find((c) => c.id === id);
  const currency = business?.currency || 'USD';

  const clientInvoices = useMemo(() => {
    return invoices
      .filter((i) => i.clientId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, id]);

  const stats = useMemo(() => {
    const totalBilled = clientInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = clientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
    const totalDue = clientInvoices.reduce((sum, i) => sum + i.amountDue, 0);
    return { totalBilled, totalPaid, totalDue };
  }, [clientInvoices]);

  if (!client) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Client not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Client', `Delete "${client.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeClient(client.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>{client.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.clientName}>{client.name}</Text>
        {client.email ? (
          <View style={styles.infoRow}>
            <Feather name="mail" size={14} color={Colors.textTertiary} />
            <Text style={styles.infoText}>{client.email}</Text>
          </View>
        ) : null}
        {client.phone ? (
          <View style={styles.infoRow}>
            <Feather name="phone" size={14} color={Colors.textTertiary} />
            <Text style={styles.infoText}>{client.phone}</Text>
          </View>
        ) : null}
        {client.address ? (
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={14} color={Colors.textTertiary} />
            <Text style={styles.infoText}>
              {[client.address, client.city, client.state, client.zip].filter(Boolean).join(', ')}
            </Text>
          </View>
        ) : null}
        <View style={styles.editRow}>
          <Pressable
            onPress={() => router.push({ pathname: '/client/create', params: { editId: client.id } })}
            style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Feather name="edit-2" size={16} color={Colors.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [styles.deleteSmallBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Feather name="trash-2" size={16} color={Colors.danger} />
          </Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Billed</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalBilled, currency)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Paid</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {formatCurrency(stats.totalPaid, currency)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Due</Text>
          <Text style={[styles.statValue, { color: stats.totalDue > 0 ? Colors.warning : Colors.text }]}>
            {formatCurrency(stats.totalDue, currency)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Invoices ({clientInvoices.length})
        </Text>
        {clientInvoices.length === 0 ? (
          <EmptyState
            icon="file-text"
            title="No invoices"
            subtitle="Create an invoice for this client"
          />
        ) : (
          <View style={styles.invoiceList}>
            {clientInvoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                currency={currency}
                onPress={() => router.push({ pathname: '/invoice/[id]', params: { id: inv.id } })}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 54 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarLargeText: { color: Colors.white, fontSize: 26, fontFamily: 'Inter_700Bold' },
  clientName: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.text },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  editRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  editBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.primary },
  deleteSmallBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.textTertiary, textTransform: 'uppercase' as const },
  statValue: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.text },
  statDivider: { width: 1, backgroundColor: Colors.border },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  invoiceList: { gap: 10 },
});
