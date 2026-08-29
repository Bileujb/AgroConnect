import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🌾</Text>
        </View>
        <Text style={styles.titulo}>AgroConnect</Text>
        <Text style={styles.subtitulo}>Conectando o Campo à Cidade</Text>
        <View style={styles.divisor} />
      </View>

      <View style={styles.faixaVerde}>
        <View style={styles.folhaDecorativa1}>
          <Text style={styles.folhaEmoji}>🌿</Text>
        </View>
        <View style={styles.folhaDecorativa2}>
          <Text style={styles.folhaEmoji}>🍃</Text>
        </View>

        <Text style={styles.chamada}>Escolha como você quer começar</Text>

        <Pressable
          style={styles.botaoPilula}
          onPress={() => navigation.navigate('Login', { perfil: 'produtor' })}
        >
          <Text style={styles.botaoPilulaTexto}>Sou Produtor</Text>
        </Pressable>

        <Pressable
          style={[styles.botaoPilula, styles.botaoPilulaOutline]}
          onPress={() => navigation.navigate('Login', { perfil: 'consumidor' })}
        >
          <Text style={[styles.botaoPilulaTexto, styles.botaoPilulaOutlineTexto]}>
            Sou Consumidor
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  topo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: '#2E8B57',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  logoEmoji: { fontSize: 40 },
  titulo: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1F5E3D',
    letterSpacing: 0.3,
  },
  subtitulo: {
    fontSize: 15,
    color: '#8A8A8A',
    marginTop: 6,
  },
  divisor: {
    width: 60,
    height: 3,
    backgroundColor: '#2E8B57',
    borderRadius: 2,
    marginTop: 20,
  },
  faixaVerde: {
    backgroundColor: '#1F5E3D',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 44,
    overflow: 'hidden',
  },
  folhaDecorativa1: {
    position: 'absolute',
    top: -10,
    right: 20,
    opacity: 0.15,
  },
  folhaDecorativa2: {
    position: 'absolute',
    bottom: 10,
    left: -10,
    opacity: 0.12,
  },
  folhaEmoji: { fontSize: 70 },
  chamada: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  botaoPilula: {
    backgroundColor: '#2E8B57',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoPilulaOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 0,
  },
  botaoPilulaTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  botaoPilulaOutlineTexto: {
    color: '#FFFFFF',
  },
});