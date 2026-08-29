import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ route, navigation }) {
  const perfil = route.params?.perfil || 'consumidor';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Campos obrigatórios', 'Informe e-mail e senha.');
      return;
    }

    login({
      nome: email.split('@')[0],
      email,
      tipoUsuario: perfil,
    });

    const destino = perfil === 'produtor' ? 'ProdutorApp' : 'ConsumidorApp';
    navigation.reset({ index: 0, routes: [{ name: destino }] });
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A2818', '#1F5E3D']} style={styles.topo}>
        <Pressable style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={styles.botaoVoltarTexto}>‹</Text>
        </Pressable>
        <Text style={styles.folhaTopo}>🌿</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.titulo}>Bem-vindo de volta</Text>
        <Text style={styles.subtitulo}>
          Entrar como {perfil === 'produtor' ? 'Produtor' : 'Consumidor'}
        </Text>

        <View style={styles.campo}>
          <Text style={styles.campoIcone}>✉️</Text>
          <TextInput
            style={styles.campoInput}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.campoIcone}>🔒</Text>
          <TextInput
            style={styles.campoInput}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        <Text style={styles.esqueciSenha}>Esqueci minha senha</Text>

        <View style={{ marginTop: 12 }}>
          <BotaoPrimario titulo="Entrar" onPress={handleLogin} />
        </View>

        <View style={styles.divisorLinha}>
          <View style={styles.linha} />
          <Text style={styles.divisorTexto}>ou</Text>
          <View style={styles.linha} />
        </View>

        <Pressable
          style={styles.botaoGoogle}
          onPress={() => Alert.alert('Em breve', 'Login com Google será implementado em breve.')}
        >
          <Text style={styles.botaoGoogleIcone}>G</Text>
          <Text style={styles.botaoGoogleTexto}>Continuar com Google</Text>
        </Pressable>

        <Text style={styles.link} onPress={() => navigation.navigate('Cadastro', { perfil })}>
          Não tenho conta — <Text style={styles.linkDestaque}>Cadastrar</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topo: {
    height: 200,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  botaoVoltar: {
    marginTop: 50,
    marginLeft: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoVoltarTexto: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginTop: -2 },
  folhaTopo: { position: 'absolute', fontSize: 120, opacity: 0.12, right: -10, bottom: -20 },
  card: { flex: 1, paddingHorizontal: 28, paddingTop: 32 },
  titulo: { fontSize: 26, fontWeight: '800', color: '#1F5E3D' },
  subtitulo: { fontSize: 14, color: '#8A8A8A', marginTop: 4, marginBottom: 28 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3EC',
    borderRadius: 30,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  campoIcone: { fontSize: 15, marginRight: 10 },
  campoInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1F1F1F' },
  esqueciSenha: { textAlign: 'right', color: '#2E8B57', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  divisorLinha: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  linha: { flex: 1, height: 1, backgroundColor: '#E3E9E5' },
  divisorTexto: { marginHorizontal: 12, color: '#8A8A8A', fontSize: 13 },
  botaoGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9E5',
    borderRadius: 30,
    paddingVertical: 15,
    gap: 10,
  },
  botaoGoogleIcone: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4285F4',
    backgroundColor: '#FFFFFF',
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
    overflow: 'hidden',
  },
  botaoGoogleTexto: { fontSize: 15, fontWeight: '600', color: '#333333' },
  link: { marginTop: 24, textAlign: 'center', color: '#6A6A6A', fontSize: 14 },
  linkDestaque: { color: '#2E8B57', fontWeight: '700' },
});