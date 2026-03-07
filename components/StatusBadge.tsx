import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import type { InvoiceStatus } from '@/lib/types';
import { getStatusLabel } from '@/lib/utils';

interface StatusBadgeProps {
  status: InvoiceStatus;
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const colorMap: Record<InvoiceStatus, { bg: string; text: string }> = {
    draft: { bg: Colors.status.draftBg, text: Colors.status.draft },
    sent: { bg: Colors.status.sentBg, text: Colors.status.sent },
    paid: { bg: Colors.status.paidBg, text: Colors.status.paid },
    overdue: { bg: Colors.status.overdueBg, text: Colors.status.overdue },
    partial: { bg: Colors.status.partialBg, text: Colors.status.partial },
  };

  const colors = colorMap[status];
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg },
        isSmall ? styles.badgeSmall : styles.badgeMedium,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: colors.text }]} />
      <Text
        style={[
          styles.text,
          { color: colors.text },
          isSmall ? styles.textSmall : styles.textMedium,
        ]}
      >
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  badgeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 11,
  },
});
