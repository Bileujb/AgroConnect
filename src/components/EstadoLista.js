import React from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
export default function EstadoLista({ carregando, erro, recarregar }) {
  if (!carregando && !erro) return null;
  return <View style={{ padding: 16, alignItems: 'center', gap: 8 }}>
    {carregando && <ActivityIndicator color="#2E8B57" />}
    {!!erro && <><Text style={{ color: '#B3261E', textAlign: 'center' }}>{erro}</Text>
      <Pressable onPress={recarregar}><Text style={{ color: '#2E8B57', fontWeight: '700' }}>Tentar novamente</Text></Pressable></>}
  </View>;
}
