import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { CURRENCIES } from '@/lib/types';
import type { BusinessProfile } from '@/lib/types';
import FormField from '@/components/FormField';

export default function SettingsScreen() {
  const { business, saveBusiness } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [taxId, setTaxId] = useState('');
  const [website, setWebsite] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState('0');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name);
      setEmail(business.email);
      setPhone(business.phone);
      setAddress(business.address);
      setCity(business.city);
      setState(business.state);
      setZip(business.zip);
      setCountry(business.country);
      setTaxId(business.taxId);
      setWebsite(business.website);
      setCurrency(business.currency);
      setTaxRate(String(business.taxRate));
      setInvoicePrefix(business.invoicePrefix);
    }
  }, [business]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const profile: BusinessProfile = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        country: country.trim(),
        taxId: taxId.trim(),
        website: website.trim(),
        currency,
        taxRate: parseFloat(taxRate) || 0,
        invoicePrefix: invoicePrefix.trim() || 'INV',
        nextInvoiceNumber: business?.nextInvoiceNumber || 1001,
      };
      await saveBusiness(profile);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Business profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to save profile');
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
        <View style={styles.sectionHeader}>
          <Feather name="briefcase" size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Company Details</Text>
        </View>
        <FormField label="Business Name" value={name} onChangeText={setName} placeholder="Your Business Name" />
        <FormField label="Email" value={email} onChangeText={setEmail} placeholder="business@email.com" keyboardType="email-address" autoCapitalize="none" />
        <FormField label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
        <FormField label="Website" value={website} onChangeText={setWebsite} placeholder="www.example.com" autoCapitalize="none" />
        <FormField label="Tax ID / GST" value={taxId} onChangeText={setTaxId} placeholder="Tax identification number" />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="map-pin" size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Address</Text>
        </View>
        <FormField label="Street" value={address} onChangeText={setAddress} placeholder="Street address" />
        <View style={styles.row}>
          <View style={styles.halfField}>
            <FormField label="City" value={city} onChangeText={setCity} placeholder="City" />
          </View>
          <View style={styles.halfField}>
            <FormField label="State" value={state} onChangeText={setState} placeholder="State" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <FormField label="ZIP" value={zip} onChangeText={setZip} placeholder="ZIP" />
          </View>
          <View style={styles.halfField}>
            <FormField label="Country" value={country} onChangeText={setCountry} placeholder="Country" />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="settings" size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Invoice Settings</Text>
        </View>
        <Text style={styles.fieldLabel}>Currency</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((cur) => (
              <Pressable
                key={cur.code}
                onPress={() => setCurrency(cur.code)}
                style={[styles.currencyChip, currency === cur.code && styles.currencyChipActive]}
              >
                <Text style={[styles.currencySymbol, currency === cur.code && styles.currencyTextActive]}>
                  {cur.symbol}
                </Text>
                <Text style={[styles.currencyCode, currency === cur.code && styles.currencyTextActive]}>
                  {cur.code}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <FormField label="Default Tax Rate (%)" value={taxRate} onChangeText={setTaxRate} placeholder="0" keyboardType="numeric" />
          </View>
          <View style={styles.halfField}>
            <FormField label="Invoice Prefix" value={invoicePrefix} onChangeText={setInvoicePrefix} placeholder="INV" />
          </View>
        </View>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.saveBtn,
          { opacity: pressed || saving ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <Feather name="check" size={20} color={Colors.white} />
        <Text style={styles.saveBtnText}>Save Profile</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 24, paddingBottom: 54 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  currencyRow: { flexDirection: 'row', gap: 8 },
  currencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 60,
  },
  currencyChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  currencySymbol: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.text },
  currencyCode: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.textSecondary, marginTop: 2 },
  currencyTextActive: { color: Colors.white },
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
