import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency } from '@/lib/utils';

export default function ReportsScreen() {
  const { invoices, expenses, business } = useData();
  const currency = business?.currency || 'USD';

  const stats = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
    const totalOutstanding = invoices.reduce((sum, i) => sum + i.amountDue, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalCollected - totalExpenses;

    const paidCount = invoices.filter((i) => i.status === 'paid').length;
    const sentCount = invoices.filter((i) => i.status === 'sent').length;
    const overdueCount = invoices.filter((i) => i.status === 'overdue').length;
    const draftCount = invoices.filter((i) => i.status === 'draft').length;
    const partialCount = invoices.filter((i) => i.status === 'partial').length;

    const collectionRate = totalInvoiced > 0
      ? Math.round((totalCollected / totalInvoiced) * 100)
      : 0;

    const expensesByCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    const topClients: { name: string; total: number }[] = [];
    const clientTotals: Record<string, { name: string; total: number }> = {};
    invoices.forEach((i) => {
      if (!clientTotals[i.clientId]) {
        clientTotals[i.clientId] = { name: i.clientName, total: 0 };
      }
      clientTotals[i.clientId].total += i.total;
    });
    Object.values(clientTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .forEach((c) => topClients.push(c));

    const monthlyRevenue: { month: string; amount: number }[] = [];
    const monthMap: Record<string, number> = {};
    invoices
      .filter((i) => i.status === 'paid')
      .forEach((i) => {
        const d = new Date(i.issueDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = (monthMap[key] || 0) + i.total;
      });
    Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .forEach(([month, amount]) => {
        const [y, m] = month.split('-');
        const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthlyRevenue.push({ month: monthName, amount });
      });

    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      totalExpenses,
      netIncome,
      paidCount,
      sentCount,
      overdueCount,
      draftCount,
      partialCount,
      collectionRate,
      expensesByCategory,
      topClients,
      monthlyRevenue,
    };
  }, [invoices, expenses]);

  const maxMonthly = Math.max(...stats.monthlyRevenue.map((m) => m.amount), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Financial Summary</Text>
        <View style={styles.summaryGrid}>
          <SummaryItem
            label="Total Invoiced"
            value={formatCurrency(stats.totalInvoiced, currency)}
            icon="file-text"
            color={Colors.primary}
          />
          <SummaryItem
            label="Collected"
            value={formatCurrency(stats.totalCollected, currency)}
            icon="check-circle"
            color={Colors.success}
          />
          <SummaryItem
            label="Outstanding"
            value={formatCurrency(stats.totalOutstanding, currency)}
            icon="clock"
            color={Colors.warning}
          />
          <SummaryItem
            label="Expenses"
            value={formatCurrency(stats.totalExpenses, currency)}
            icon="minus-circle"
            color={Colors.danger}
          />
        </View>
        <View style={styles.netIncomeRow}>
          <Text style={styles.netIncomeLabel}>Net Income</Text>
          <Text
            style={[
              styles.netIncomeValue,
              { color: stats.netIncome >= 0 ? Colors.success : Colors.danger },
            ]}
          >
            {formatCurrency(stats.netIncome, currency)}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Invoice Status Breakdown</Text>
        <View style={styles.statusGrid}>
          <StatusRow label="Paid" count={stats.paidCount} color={Colors.success} total={invoices.length} />
          <StatusRow label="Sent" count={stats.sentCount} color={Colors.status.sent} total={invoices.length} />
          <StatusRow label="Partial" count={stats.partialCount} color={Colors.warning} total={invoices.length} />
          <StatusRow label="Overdue" count={stats.overdueCount} color={Colors.danger} total={invoices.length} />
          <StatusRow label="Draft" count={stats.draftCount} color={Colors.textTertiary} total={invoices.length} />
        </View>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Collection Rate</Text>
          <Text style={styles.rateValue}>{stats.collectionRate}%</Text>
        </View>
      </View>

      {stats.monthlyRevenue.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Revenue</Text>
          <View style={styles.chartContainer}>
            {stats.monthlyRevenue.map((m) => (
              <View key={m.month} style={styles.barCol}>
                <Text style={styles.barValue}>
                  {formatCurrency(m.amount, currency)}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${Math.max((m.amount / maxMonthly) * 100, 5)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{m.month}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {stats.topClients.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Clients</Text>
          {stats.topClients.map((client, idx) => (
            <View key={client.name} style={styles.clientRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{idx + 1}</Text>
              </View>
              <Text style={styles.clientName} numberOfLines={1}>
                {client.name}
              </Text>
              <Text style={styles.clientTotal}>
                {formatCurrency(client.total, currency)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {Object.keys(stats.expensesByCategory).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Expense Breakdown</Text>
          {Object.entries(stats.expensesByCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => {
              const pct = stats.totalExpenses > 0 ? (amount / stats.totalExpenses) * 100 : 0;
              return (
                <View key={cat} style={styles.expenseRow}>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseCat}>{cat}</Text>
                    <View style={styles.expenseBarTrack}>
                      <View style={[styles.expenseBarFill, { width: `${pct}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.expenseAmount}>
                    {formatCurrency(amount, currency)}
                  </Text>
                </View>
              );
            })}
        </View>
      )}
    </ScrollView>
  );
}

function SummaryItem({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}) {
  return (
    <View style={summaryStyles.item}>
      <Feather name={icon} size={16} color={color} />
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={summaryStyles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function StatusRow({
  label,
  count,
  color,
  total,
}: {
  label: string;
  count: number;
  color: string;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={statusStyles.row}>
      <View style={[statusStyles.dot, { backgroundColor: color }]} />
      <Text style={statusStyles.label}>{label}</Text>
      <View style={statusStyles.barTrack}>
        <View style={[statusStyles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={statusStyles.count}>{count}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  item: { width: '48%', gap: 4, marginBottom: 12 },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  value: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.text },
});

const statusStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { width: 60, fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.text },
  barTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.surfaceSecondary },
  barFill: { height: 6, borderRadius: 3 },
  count: { width: 24, fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.text, textAlign: 'right' as const },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 54 },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.text },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  netIncomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 14,
  },
  netIncomeLabel: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  netIncomeValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  statusGrid: { gap: 2 },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  rateLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  rateValue: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.primary },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    gap: 8,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' },
  barValue: { fontSize: 9, fontFamily: 'Inter_500Medium', color: Colors.textTertiary },
  barTrack: {
    width: '80%',
    flex: 1,
    borderRadius: 6,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: Colors.primary, borderRadius: 6 },
  barLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  clientName: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text },
  clientTotal: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  expenseInfo: { flex: 1, gap: 4 },
  expenseCat: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.text },
  expenseBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceSecondary,
  },
  expenseBarFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.danger,
  },
  expenseAmount: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text },
});
