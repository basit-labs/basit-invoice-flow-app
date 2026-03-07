import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  badge?: number;
}

function MenuItem({ icon, label, subtitle, color, bgColor, onPress, badge }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: bgColor }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.menuTextCol}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.menuRight}>
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
      </View>
    </Pressable>
  );
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { products, expenses } = useData();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 12, paddingBottom: Platform.OS === 'web' ? 34 : 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>More</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Manage</Text>
        <View style={styles.sectionCards}>
          <MenuItem
            icon="package"
            label="Products & Services"
            subtitle="Manage your catalog"
            color="#8B5CF6"
            bgColor="#F3EEFF"
            badge={products.length}
            onPress={() => router.push('/products')}
          />
          <MenuItem
            icon="minus-circle"
            label="Expenses"
            subtitle="Track spending"
            color={Colors.danger}
            bgColor={Colors.dangerLight}
            badge={expenses.length}
            onPress={() => router.push('/expenses')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Insights</Text>
        <View style={styles.sectionCards}>
          <MenuItem
            icon="bar-chart-2"
            label="Reports"
            subtitle="Revenue & analytics"
            color={Colors.primary}
            bgColor="#E6F4F5"
            onPress={() => router.push('/reports')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Settings</Text>
        <View style={styles.sectionCards}>
          <MenuItem
            icon="briefcase"
            label="Business Profile"
            subtitle="Company details & branding"
            color="#D97706"
            bgColor="#FEF3C7"
            onPress={() => router.push('/settings')}
          />
        </View>
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
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  sectionCards: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
