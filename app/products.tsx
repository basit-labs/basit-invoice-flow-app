import React from 'react';
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
import { formatCurrency } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';

export default function ProductsScreen() {
  const { products, business, removeProduct } = useData();
  const currency = business?.currency || 'USD';

  const sorted = [...products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Product', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeProduct(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.push('/product/create')}
        style={({ pressed }) => [
          styles.addBtn,
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <Feather name="plus" size={18} color={Colors.white} />
        <Text style={styles.addBtnText}>Add Product / Service</Text>
      </Pressable>

      {sorted.length === 0 ? (
        <EmptyState
          icon="package"
          title="No products yet"
          subtitle="Add products or services to quickly add them to invoices"
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
              onPress={() => router.push({ pathname: '/product/create', params: { editId: item.id } })}
              onLongPress={() => handleDelete(item.id, item.name)}
              style={({ pressed }) => [
                styles.productCard,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <View style={styles.productIcon}>
                <Feather name="package" size={18} color="#8B5CF6" />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>
                ) : null}
                {item.category ? (
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{item.category}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.productPricing}>
                <Text style={styles.productPrice}>{formatCurrency(item.price, currency)}</Text>
                <Text style={styles.productUnit}>/ {item.unit}</Text>
              </View>
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
  productCard: {
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
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  productDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: Colors.surfaceSecondary,
    marginTop: 4,
  },
  categoryTagText: { fontSize: 10, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  productPricing: { alignItems: 'flex-end' },
  productPrice: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.text },
  productUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textTertiary },
});
