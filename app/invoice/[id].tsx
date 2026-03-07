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
import { formatCurrency, formatDate, getDaysUntilDue, generateId } from '@/lib/utils';
import type { InvoiceStatus, Payment } from '@/lib/types';
import { PAYMENT_METHODS } from '@/lib/types';
import { shareInvoice, printInvoice } from '@/lib/pdf';
import StatusBadge from '@/components/StatusBadge';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, business, saveInvoice, removeInvoice } = useData();
  const invoice = invoices.find((i) => i.id === id);
  const currency = business?.currency || 'USD';

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentNotes, setPaymentNotes] = useState('');

  if (!invoice) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Invoice not found</Text>
      </View>
    );
  }

  const daysLeft = getDaysUntilDue(invoice.dueDate);

  const handleStatusChange = async (status: InvoiceStatus) => {
    const updated = { ...invoice, status, updatedAt: new Date().toISOString() };
    await saveInvoice(updated);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const payment: Payment = {
      id: generateId(),
      amount,
      method: paymentMethod,
      date: new Date().toISOString(),
      notes: paymentNotes,
    };

    const newAmountPaid = invoice.amountPaid + amount;
    const newAmountDue = invoice.total - newAmountPaid;
    const newStatus: InvoiceStatus =
      newAmountDue <= 0 ? 'paid' : 'partial';

    const updated = {
      ...invoice,
      payments: [...invoice.payments, payment],
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, newAmountDue),
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    await saveInvoice(updated);
    setShowPaymentForm(false);
    setPaymentAmount('');
    setPaymentNotes('');
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = () => {
    Alert.alert('Delete Invoice', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeInvoice(invoice.id);
          router.back();
        },
      },
    ]);
  };

  const handleShare = async () => {
    if (!business) return;
    if (Platform.OS === 'web') {
      Alert.alert('Share', 'PDF sharing is available on mobile devices');
      return;
    }
    try {
      await shareInvoice(invoice, business);
    } catch (e: any) {
      if (!e.message?.includes('dismissed')) {
        Alert.alert('Error', 'Failed to share invoice');
      }
    }
  };

  const handlePrint = async () => {
    if (!business) return;
    if (Platform.OS === 'web') {
      Alert.alert('Print', 'PDF printing is available on mobile devices');
      return;
    }
    try {
      await printInvoice(invoice, business);
    } catch {
      Alert.alert('Error', 'Failed to print invoice');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topCard}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.clientName}>{invoice.clientName}</Text>
          </View>
          <StatusBadge status={invoice.status} size="medium" />
        </View>

        <View style={styles.amountRow}>
          <View>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={styles.amount}>{formatCurrency(invoice.total, currency)}</Text>
          </View>
          {invoice.amountDue > 0 && invoice.amountDue !== invoice.total && (
            <View style={styles.amountDueCol}>
              <Text style={styles.amountLabel}>Amount Due</Text>
              <Text style={[styles.amountDue]}>{formatCurrency(invoice.amountDue, currency)}</Text>
            </View>
          )}
        </View>

        <View style={styles.datesRow}>
          <View style={styles.dateItem}>
            <Feather name="calendar" size={14} color={Colors.textTertiary} />
            <Text style={styles.dateLabel}>Issued</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.issueDate)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Feather name="clock" size={14} color={daysLeft < 0 ? Colors.danger : Colors.textTertiary} />
            <Text style={styles.dateLabel}>Due</Text>
            <Text style={[styles.dateValue, daysLeft < 0 && { color: Colors.danger }]}>
              {formatDate(invoice.dueDate)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {invoice.status === 'draft' && (
          <Pressable
            onPress={() => handleStatusChange('sent')}
            style={({ pressed }) => [styles.actionBtn, styles.primaryActionBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Feather name="send" size={16} color={Colors.white} />
            <Text style={styles.primaryActionText}>Mark Sent</Text>
          </Pressable>
        )}
        {(invoice.status === 'sent' || invoice.status === 'overdue' || invoice.status === 'partial') && (
          <Pressable
            onPress={() => setShowPaymentForm(true)}
            style={({ pressed }) => [styles.actionBtn, styles.primaryActionBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Feather name="dollar-sign" size={16} color={Colors.white} />
            <Text style={styles.primaryActionText}>Record Payment</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.actionBtn, styles.outlineBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Feather name="share-2" size={16} color={Colors.primary} />
        </Pressable>
        <Pressable
          onPress={handlePrint}
          style={({ pressed }) => [styles.actionBtn, styles.outlineBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Feather name="printer" size={16} color={Colors.primary} />
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: '/invoice/create', params: { editId: invoice.id } })}
          style={({ pressed }) => [styles.actionBtn, styles.outlineBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Feather name="edit-2" size={16} color={Colors.primary} />
        </Pressable>
      </View>

      {showPaymentForm && (
        <View style={styles.paymentForm}>
          <Text style={styles.paymentTitle}>Record Payment</Text>
          <TextInput
            style={styles.paymentInput}
            placeholder={`Amount (max ${formatCurrency(invoice.amountDue, currency)})`}
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodScroll}>
            <View style={styles.methodRow}>
              {PAYMENT_METHODS.map((method) => (
                <Pressable
                  key={method}
                  onPress={() => setPaymentMethod(method)}
                  style={[
                    styles.methodChip,
                    paymentMethod === method && styles.methodChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.methodText,
                      paymentMethod === method && styles.methodTextActive,
                    ]}
                  >
                    {method}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <TextInput
            style={styles.paymentInput}
            placeholder="Notes (optional)"
            placeholderTextColor={Colors.textTertiary}
            value={paymentNotes}
            onChangeText={setPaymentNotes}
          />
          <View style={styles.paymentActions}>
            <Pressable
              onPress={() => setShowPaymentForm(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleRecordPayment}
              style={({ pressed }) => [
                styles.recordBtn,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.recordBtnText}>Record</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Line Items</Text>
        <View style={styles.itemsTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Item</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' as const }]}>Qty</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' as const }]}>Price</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' as const }]}>Total</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' as const }]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' as const }]}>
                {formatCurrency(item.price, currency)}
              </Text>
              <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right' as const }]}>
                {formatCurrency(item.total, currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal, currency)}</Text>
          </View>
          {invoice.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={[styles.totalValue, { color: Colors.danger }]}>
                -{formatCurrency(invoice.discount, currency)}
              </Text>
            </View>
          )}
          {invoice.taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount, currency)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total, currency)}</Text>
          </View>
        </View>
      </View>

      {invoice.payments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          {invoice.payments.map((p) => (
            <View key={p.id} style={styles.paymentRow}>
              <View style={styles.paymentIcon}>
                <Feather name="check-circle" size={16} color={Colors.success} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentAmount}>
                  {formatCurrency(p.amount, currency)}
                </Text>
                <Text style={styles.paymentDetail}>
                  {p.method} {p.notes ? `- ${p.notes}` : ''}
                </Text>
              </View>
              <Text style={styles.paymentDate}>{formatDate(p.date)}</Text>
            </View>
          ))}
        </View>
      )}

      {invoice.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={handleDelete}
        style={({ pressed }) => [
          styles.deleteBtn,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="trash-2" size={16} color={Colors.danger} />
        <Text style={styles.deleteBtnText}>Delete Invoice</Text>
      </Pressable>
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
    gap: 16,
    paddingBottom: Platform.OS === 'web' ? 54 : 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  topCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNumber: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  clientName: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginTop: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginTop: 2,
  },
  amountDueCol: {
    alignItems: 'flex-end',
  },
  amountDue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.warning,
    marginTop: 2,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 20,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textTertiary,
  },
  dateValue: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryActionBtn: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  primaryActionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  itemsTable: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
  },
  tableHeaderText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tableCell: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
  },
  tableCellBold: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  totalsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    paddingTop: 10,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  grandTotalValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
  },
  paymentForm: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  paymentTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  paymentInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
  },
  methodScroll: {
    marginHorizontal: -4,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 4,
  },
  methodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
  },
  methodChipActive: {
    backgroundColor: Colors.primary,
  },
  methodText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  methodTextActive: {
    color: Colors.white,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  recordBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Colors.success,
  },
  recordBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  paymentDetail: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paymentDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textTertiary,
  },
  notesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.dangerLight,
    marginTop: 8,
  },
  deleteBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.danger,
  },
});
