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
import { PRODUCT_UNITS } from '@/lib/types';
import type { Product } from '@/lib/types';
import FormField from '@/components/FormField';

export default function CreateProductScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { products, saveProduct } = useData();
  const existing = editId ? products.find((p) => p.id === editId) : null;

  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [unit, setUnit] = useState(existing?.unit || 'Unit');
  const [category, setCategory] = useState(existing?.category || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    setSaving(true);
    try {
      const product: Product = {
        id: existing?.id || generateId(),
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        unit,
        category: category.trim(),
        createdAt: existing?.createdAt || new Date().toISOString(),
      };
      await saveProduct(product);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save product');
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
      <FormField label="Name *" value={name} onChangeText={setName} placeholder="Product or service name" />
      <FormField label="Description" value={description} onChangeText={setDescription} placeholder="Brief description" multiline />
      <View style={styles.row}>
        <View style={styles.flex2}>
          <FormField label="Price *" value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="numeric" />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.fieldLabel}>Unit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.unitRow}>
              {PRODUCT_UNITS.map((u) => (
                <Pressable
                  key={u}
                  onPress={() => setUnit(u)}
                  style={[styles.unitChip, unit === u && styles.unitChipActive]}
                >
                  <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
      <FormField label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Design, Development" />
      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.saveBtn,
          { opacity: pressed || saving ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <Feather name="check" size={20} color={Colors.white} />
        <Text style={styles.saveBtnText}>{existing ? 'Update' : 'Save Product'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  row: { gap: 12 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  unitRow: { flexDirection: 'row', gap: 6 },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  unitChipActive: { backgroundColor: Colors.primary },
  unitText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  unitTextActive: { color: Colors.white },
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
