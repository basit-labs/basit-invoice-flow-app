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
import type { Client } from '@/lib/types';
import FormField from '@/components/FormField';

export default function CreateClientScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { clients, saveClient } = useData();
  const existing = editId ? clients.find((c) => c.id === editId) : null;

  const [name, setName] = useState(existing?.name || '');
  const [email, setEmail] = useState(existing?.email || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [address, setAddress] = useState(existing?.address || '');
  const [city, setCity] = useState(existing?.city || '');
  const [state, setState] = useState(existing?.state || '');
  const [zip, setZip] = useState(existing?.zip || '');
  const [country, setCountry] = useState(existing?.country || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Client name is required');
      return;
    }
    setSaving(true);
    try {
      const client: Client = {
        id: existing?.id || generateId(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        country: country.trim(),
        notes: notes.trim(),
        createdAt: existing?.createdAt || new Date().toISOString(),
      };
      await saveClient(client);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save client');
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
      <FormField label="Name *" value={name} onChangeText={setName} placeholder="Client or company name" />
      <FormField label="Email" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
      <FormField label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
      <FormField label="Address" value={address} onChangeText={setAddress} placeholder="Street address" />
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
          <FormField label="ZIP" value={zip} onChangeText={setZip} placeholder="ZIP Code" />
        </View>
        <View style={styles.halfField}>
          <FormField label="Country" value={country} onChangeText={setCountry} placeholder="Country" />
        </View>
      </View>
      <FormField
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Internal notes about this client"
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
        <Text style={styles.saveBtnText}>{existing ? 'Update Client' : 'Save Client'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16, paddingBottom: Platform.OS === 'web' ? 54 : 40 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
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
