import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  'Office Supplies': 'paperclip',
  Travel: 'map',
  Meals: 'coffee',
  Software: 'monitor',
  Hardware: 'cpu',
  Marketing: 'trending-up',
  Insurance: 'shield',
  Utilities: 'zap',
  Rent: 'home',
  'Professional Services': 'briefcase',
  Other: 'tag',
};

export default function ExpensesScreen() {
  const { expenses, business, removeExpense } = useData();
  const currency = business?.currency || 'USD';

  const sorted = useMemo(
    () =>
      [...expenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [expenses],
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  const handleDelete = (id: string) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeExpense(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      {expenses.length > 0 && (
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Expenses</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalExpenses, currency)}</Text>
        </View>
      )}

      <Pressable
        onPress={() => router.push('/expense/create')}
        style={({ pressed }) => [
          styles.addBtn,
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <Feather name="plus" size={18} color={Colors.white} />
        <Text style={styles.addBtnText}>Add Expense</Text>
      </Pressable>

      {sorted.length === 0 ? (
        <EmptyState
          icon="minus-circle"
          title="No expenses yet"
          subtitle="Start tracking your business expenses"
        />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          scrollEnabled={sorted.length > 0}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/expense/create', params: { editId: item.id } })}
              onLongPress={() => handleDelete(item.id)}
              style={({ pressed }) => [
                styles.expenseCard,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <View style={styles.expenseIcon}>
                <Feather
                  name={CATEGORY_ICONS[item.category] || 'tag'}
                  size={16}
                  color={Colors.danger}
                />
              </View>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseDesc} numberOfLines={1}>{item.description}</Text>
                <View style={styles.expenseMeta}>
                  <Text style={styles.expenseCategory}>{item.category}</Text>
                  <Text style={styles.expenseDot}>  </Text>
                  <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
                </View>
              </View>
              <Text style={styles.expenseAmount}>
                -{formatCurrency(item.amount, currency)}
              </Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  totalCard: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.danger, textTransform: 'uppercase' as const },
  totalValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.danger, marginTop: 4 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  addBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.white },
  list: { paddingBottom: 20 },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseInfo: { flex: 1 },
  expenseDesc: { fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.text },
  expenseMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  expenseCategory: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  expenseDot: { fontSize: 12, color: Colors.textTertiary },
  expenseDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textTertiary },
  expenseAmount: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.danger },
});
