import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { generateId } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/lib/types';
import type { Expense } from '@/lib/types';
import FormField from '@/components/FormField';

export default function CreateExpenseScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { expenses, saveExpense } = useData();
  const existing = editId ? expenses.find((e) => e.id === editId) : null;

  const [description, setDescription] = useState(existing?.description || '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [category, setCategory] = useState(existing?.category || 'Other');
  const [date, setDate] = useState(existing?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(existing?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Description is required');
      return;
    }
    if (!amount.trim() || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      const expense: Expense = {
        id: existing?.id || generateId(),
        description: description.trim(),
        amount: parseFloat(amount),
        category,
        date,
        notes: notes.trim(),
        createdAt: existing?.createdAt || new Date().toISOString(),
      };
      await saveExpense(expense);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <FormField label="Description *" value={description} onChangeText={setDescription} placeholder="What was this expense for?" />
      <FormField label="Amount *" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" />
      <FormField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

      <View style={styles.categorySection}>
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {EXPENSE_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FormField
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Additional details"
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' as const }}
      />

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.saveBtn,
          { opacity: pressed || saving ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <Feather name="check" size={20} color={Colors.white} />
        <Text style={styles.saveBtnText}>{existing ? 'Update' : 'Save Expense'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  categorySection: { gap: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  categoryChipActive: { backgroundColor: Colors.primary },
  categoryText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  categoryTextActive: { color: Colors.white },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  saveBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.white },
});
