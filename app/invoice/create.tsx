import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { generateId, formatCurrency } from '@/lib/utils';
import type { Invoice, InvoiceItem } from '@/lib/types';
import FormField from '@/components/FormField';

export default function CreateInvoiceScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { clients, products, business, invoices, saveInvoice, getNextInvoiceNumber } = useData();
  const currency = business?.currency || 'USD';

  const existingInvoice = editId ? invoices.find((i) => i.id === editId) : null;

  const [selectedClientId, setSelectedClientId] = useState(existingInvoice?.clientId || '');
  const [items, setItems] = useState<InvoiceItem[]>(existingInvoice?.items || []);
  const [notes, setNotes] = useState(existingInvoice?.notes || '');
  const [discount, setDiscount] = useState(String(existingInvoice?.discount || '0'));
  const [taxRate, setTaxRate] = useState(String(existingInvoice?.taxRate || business?.taxRate || '0'));
  const [dueDate, setDueDate] = useState(
    existingInvoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.total, 0), [items]);
  const discountNum = parseFloat(discount) || 0;
  const taxRateNum = parseFloat(taxRate) || 0;
  const taxableAmount = subtotal - discountNum;
  const taxAmount = taxableAmount * (taxRateNum / 100);
  const total = taxableAmount + taxAmount;

  const addItem = (description: string, quantity: number, price: number) => {
    const newItem: InvoiceItem = {
      id: generateId(),
      description,
      quantity,
      price,
      total: quantity * price,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addProductAsItem = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addItem(product.name, 1, product.price);
    }
    setShowProductPicker(false);
  };

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');

  const handleAddCustomItem = () => {
    if (!newItemDesc.trim() || !newItemPrice.trim()) return;
    const qty = parseFloat(newItemQty) || 1;
    const price = parseFloat(newItemPrice) || 0;
    addItem(newItemDesc.trim(), qty, price);
    setNewItemDesc('');
    setNewItemQty('1');
    setNewItemPrice('');
  };

  const handleSave = async (status: 'draft' | 'sent') => {
    if (!selectedClientId) {
      Alert.alert('Error', 'Please select a client');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    setSaving(true);
    try {
      const invoiceNumber = existingInvoice
        ? existingInvoice.invoiceNumber
        : await getNextInvoiceNumber();

      const invoice: Invoice = {
        id: existingInvoice?.id || generateId(),
        invoiceNumber,
        clientId: selectedClientId,
        clientName: selectedClient?.name || '',
        status,
        items,
        payments: existingInvoice?.payments || [],
        subtotal,
        taxRate: taxRateNum,
        taxAmount,
        discount: discountNum,
        total,
        amountPaid: existingInvoice?.amountPaid || 0,
        amountDue: total - (existingInvoice?.amountPaid || 0),
        notes,
        dueDate,
        issueDate: existingInvoice?.issueDate || new Date().toISOString(),
        createdAt: existingInvoice?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveInvoice(invoice);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save invoice');
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client</Text>
        {showClientPicker ? (
          <View style={styles.pickerList}>
            {clients.length === 0 ? (
              <Text style={styles.emptyText}>No clients yet. Add one from the Clients tab.</Text>
            ) : (
              clients.map((client) => (
                <Pressable
                  key={client.id}
                  onPress={() => {
                    setSelectedClientId(client.id);
                    setShowClientPicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.pickerItem,
                    selectedClientId === client.id && styles.pickerItemActive,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={styles.pickerItemText}>{client.name}</Text>
                  {client.email ? (
                    <Text style={styles.pickerItemSub}>{client.email}</Text>
                  ) : null}
                </Pressable>
              ))
            )}
            <Pressable onPress={() => setShowClientPicker(false)} style={styles.cancelPicker}>
              <Text style={styles.cancelPickerText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowClientPicker(true)}
            style={styles.selectButton}
          >
            {selectedClient ? (
              <View style={styles.selectedClient}>
                <View style={styles.selectedAvatar}>
                  <Text style={styles.selectedAvatarText}>
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.selectedName}>{selectedClient.name}</Text>
                  {selectedClient.email ? (
                    <Text style={styles.selectedEmail}>{selectedClient.email}</Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <View style={styles.placeholderRow}>
                <Feather name="user" size={18} color={Colors.textTertiary} />
                <Text style={styles.placeholder}>Select a client</Text>
              </View>
            )}
            <Feather name="chevron-down" size={18} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Due Date</Text>
        <FormField
          label=""
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>
          {products.length > 0 && (
            <Pressable
              onPress={() => setShowProductPicker(!showProductPicker)}
              style={styles.addFromCatalog}
            >
              <Feather name="package" size={14} color={Colors.primary} />
              <Text style={styles.addFromCatalogText}>From Catalog</Text>
            </Pressable>
          )}
        </View>

        {showProductPicker && (
          <View style={styles.pickerList}>
            {products.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => addProductAsItem(product.id)}
                style={({ pressed }) => [
                  styles.pickerItem,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.pickerItemText}>{product.name}</Text>
                <Text style={styles.pickerItemSub}>
                  {formatCurrency(product.price, currency)} / {product.unit}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemDesc} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={styles.itemDetail}>
                {item.quantity} x {formatCurrency(item.price, currency)}
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              {formatCurrency(item.total, currency)}
            </Text>
            <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
              <Feather name="x" size={18} color={Colors.danger} />
            </Pressable>
          </View>
        ))}

        <View style={styles.addItemForm}>
          <TextInput
            style={styles.addItemInput}
            placeholder="Description"
            placeholderTextColor={Colors.textTertiary}
            value={newItemDesc}
            onChangeText={setNewItemDesc}
          />
          <View style={styles.addItemRow}>
            <TextInput
              style={[styles.addItemInput, styles.addItemSmall]}
              placeholder="Qty"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={newItemQty}
              onChangeText={setNewItemQty}
            />
            <TextInput
              style={[styles.addItemInput, styles.addItemSmall]}
              placeholder="Price"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
            />
            <Pressable
              onPress={handleAddCustomItem}
              style={({ pressed }) => [
                styles.addItemBtn,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="plus" size={20} color={Colors.white} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional</Text>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <FormField
              label="Discount"
              value={discount}
              onChangeText={setDiscount}
              keyboardType="numeric"
              placeholder="0.00"
            />
          </View>
          <View style={styles.halfField}>
            <FormField
              label="Tax Rate (%)"
              value={taxRate}
              onChangeText={setTaxRate}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>
        <FormField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Payment terms, thank you note..."
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' as const }}
        />
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatCurrency(subtotal, currency)}</Text>
        </View>
        {discountNum > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={[styles.totalValue, { color: Colors.danger }]}>
              -{formatCurrency(discountNum, currency)}
            </Text>
          </View>
        )}
        {taxRateNum > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({taxRateNum}%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(taxAmount, currency)}</Text>
          </View>
        )}
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(total, currency)}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          onPress={() => handleSave('draft')}
          disabled={saving}
          style={({ pressed }) => [
            styles.draftBtn,
            { opacity: pressed || saving ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.draftBtnText}>Save Draft</Text>
        </Pressable>
        <Pressable
          onPress={() => handleSave('sent')}
          disabled={saving}
          style={({ pressed }) => [
            styles.sendBtn,
            { opacity: pressed || saving ? 0.7 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Feather name="send" size={18} color={Colors.white} />
          <Text style={styles.sendBtnText}>Create & Send</Text>
        </Pressable>
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
    padding: 20,
    gap: 24,
    paddingBottom: Platform.OS === 'web' ? 54 : 40,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  placeholder: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textTertiary,
  },
  selectedClient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedAvatarText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  selectedName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  selectedEmail: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  pickerList: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pickerItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerItemActive: {
    backgroundColor: Colors.surfaceSecondary,
  },
  pickerItemText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  pickerItemSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cancelPicker: {
    padding: 14,
    alignItems: 'center',
  },
  cancelPickerText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  addFromCatalog: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  addFromCatalogText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemDesc: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  itemDetail: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  addItemForm: {
    gap: 8,
  },
  addItemInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addItemSmall: {
    flex: 1,
  },
  addItemBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  totalSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  grandTotalValue: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  draftBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  draftBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  sendBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  sendBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  emptyText: {
    padding: 20,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
