import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function BotaoPrimario({ titulo, onPress, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.botao,
        disabled && styles.desabilitado,
        pressed && styles.pressionado,
      ]}
    >
      <Text style={styles.texto}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#2E8B57',
    minHeight: 48,
    minWidth: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pressionado: {
    opacity: 0.8,
  },
  desabilitado: {
    backgroundColor: '#A9C9B8',
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});