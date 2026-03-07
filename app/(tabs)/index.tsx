import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency } from '@/lib/utils';
import StatCard from '@/components/StatCard';
import InvoiceCard from '@/components/InvoiceCard';
import EmptyState from '@/components/EmptyState';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { invoices, expenses, business, loading, refreshAll } = useData();
  const currency = business?.currency || 'USD';

  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);
    const totalPending = invoices
      .filter((i) => i.status === 'sent' || i.status === 'partial')
      .reduce((sum, i) => sum + i.amountDue, 0);
    const totalOverdue = invoices
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + i.amountDue, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { totalRevenue, totalPending, totalOverdue, totalExpenses };
  }, [invoices, expenses]);

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [invoices]);

  const overdueInvoices = useMemo(() => {
    return invoices.filter((i) => i.status === 'overdue');
  }, [invoices]);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 16, paddingBottom: 100 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshAll} tintColor={Colors.primary} />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>
            {business?.name || 'Welcome'}
          </Text>
          <Text style={styles.subtitle}>Business Overview</Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [
            styles.settingsBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="settings" size={22} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          label="Revenue"
          value={formatCurrency(stats.totalRevenue, currency)}
          icon="trending-up"
          color={Colors.success}
          bgColor={Colors.successLight}
        />
        <StatCard
          label="Pending"
          value={formatCurrency(stats.totalPending, currency)}
          icon="clock"
          color={Colors.warning}
          bgColor={Colors.warningLight}
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          label="Overdue"
          value={formatCurrency(stats.totalOverdue, currency)}
          icon="alert-triangle"
          color={Colors.danger}
          bgColor={Colors.dangerLight}
          subtitle={overdueInvoices.length > 0 ? `${overdueInvoices.length} invoice(s)` : undefined}
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(stats.totalExpenses, currency)}
          icon="credit-card"
          color={Colors.primary}
          bgColor="#E6F4F5"
        />
      </View>

      <View style={styles.quickActions}>
        <Pressable
          onPress={() => router.push('/invoice/create')}
          style={({ pressed }) => [
            styles.primaryAction,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Feather name="plus" size={20} color={Colors.white} />
          <Text style={styles.primaryActionText}>New Invoice</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/client/create')}
          style={({ pressed }) => [
            styles.secondaryAction,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Feather name="user-plus" size={18} color={Colors.primary} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/expense/create')}
          style={({ pressed }) => [
            styles.secondaryAction,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Feather name="minus-circle" size={18} color={Colors.primary} />
        </Pressable>
      </View>

      {overdueInvoices.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: Colors.danger }]} />
              <Text style={styles.sectionTitle}>Overdue</Text>
            </View>
            <Text style={styles.sectionCount}>{overdueInvoices.length}</Text>
          </View>
          {overdueInvoices.slice(0, 3).map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              currency={currency}
              onPress={() => router.push({ pathname: '/invoice/[id]', params: { id: inv.id } })}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          {invoices.length > 0 && (
            <Pressable onPress={() => router.push('/(tabs)/invoices')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          )}
        </View>
        {recentInvoices.length === 0 ? (
          <EmptyState
            icon="file-text"
            title="No invoices yet"
            subtitle="Create your first invoice to get started tracking your business"
            actionLabel="Create Invoice"
            onAction={() => router.push('/invoice/create')}
          />
        ) : (
          <View style={styles.invoiceList}>
            {recentInvoices.map((inv) => (
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryActionText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryAction: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  section: {
    gap: 12,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.danger,
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  invoiceList: {
    gap: 10,
  },
});
