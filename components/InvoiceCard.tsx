import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import type { Invoice } from '@/lib/types';
import { formatCurrency, formatDateShort, getDaysUntilDue } from '@/lib/utils';
import StatusBadge from './StatusBadge';

interface InvoiceCardProps {
  invoice: Invoice;
  currency?: string;
  onPress: () => void;
}

export default function InvoiceCard({ invoice, currency = 'USD', onPress }: InvoiceCardProps) {
  const daysLeft = getDaysUntilDue(invoice.dueDate);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.clientInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {invoice.clientName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.nameCol}>
            <Text style={styles.clientName} numberOfLines={1}>
              {invoice.clientName}
            </Text>
            <Text style={styles.invoiceNum}>{invoice.invoiceNumber}</Text>
          </View>
        </View>
        <StatusBadge status={invoice.status} />
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.amountCol}>
          <Text style={styles.amount}>{formatCurrency(invoice.total, currency)}</Text>
          {invoice.amountDue > 0 && invoice.amountDue !== invoice.total && (
            <Text style={styles.due}>
              Due: {formatCurrency(invoice.amountDue, currency)}
            </Text>
          )}
        </View>
        <View style={styles.dateCol}>
          {invoice.status !== 'paid' && invoice.status !== 'draft' && (
            <Text
              style={[
                styles.daysText,
                daysLeft < 0
                  ? { color: Colors.danger }
                  : daysLeft <= 7
                    ? { color: Colors.warning }
                    : { color: Colors.textTertiary },
              ]}
            >
              {daysLeft < 0
                ? `${Math.abs(daysLeft)}d overdue`
                : daysLeft === 0
                  ? 'Due today'
                  : `${daysLeft}d left`}
            </Text>
          )}
          <Text style={styles.dateText}>{formatDateShort(invoice.issueDate)}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  nameCol: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  invoiceNum: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textTertiary,
    marginTop: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountCol: {
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  due: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.warning,
    marginTop: 2,
  },
  dateCol: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  daysText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
