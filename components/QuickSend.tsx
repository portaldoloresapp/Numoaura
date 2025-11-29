import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Plus } from 'lucide-react-native';

const contacts = [
  { id: 1, name: 'Fandr', image: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Naye', image: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Mae', image: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, name: 'Chairo', image: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, name: 'Kfpd', image: 'https://i.pravatar.cc/150?u=5' },
];

export default function QuickSend() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Envio Rápido</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver tudo</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        <TouchableOpacity style={styles.addItem}>
             <View style={styles.addCircle}>
                <Plus size={20} color={COLORS.black} />
             </View>
             <Text style={styles.name}>Novo</Text>
        </TouchableOpacity>

        {contacts.map((contact) => (
          <TouchableOpacity key={contact.id} style={styles.item}>
            <Image source={{ uri: contact.image }} style={styles.avatar} />
            <Text style={styles.name}>{contact.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
  },
  list: {
    gap: SPACING.l,
  },
  item: {
    alignItems: 'center',
    gap: 8,
  },
  addItem: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  addCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.white,
  },
  name: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
  },
});
