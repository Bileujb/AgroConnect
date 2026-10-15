import React, { useState } from 'react';
import { ScrollView, Text, TextInput, Alert } from 'react-native';
import BotaoPrimario from '../../components/BotaoPrimario';
import { requisicaoPublica } from '../../services/api';
export default function RecuperarSenhaScreen({ route }) {
  const [email, setEmail] = useState(route.params?.email || '');
  const [enviando, setEnviando] = useState(false);
  async function enviar() {
    if (enviando || !email.trim()) return;
    setEnviando(true);
    try {
      const resposta = await requisicaoPublica('/auth/recuperar', { method: 'POST', body: { email: email.trim() } });
      Alert.alert('Confira seu e-mail', resposta.mensagem);
    } catch (erro) { Alert.alert('Não foi possível solicitar', erro.message); }
    finally { setEnviando(false); }
  }
  return <ScrollView contentContainerStyle={{ padding: 24, gap: 20, backgroundColor: '#FFF', flexGrow: 1 }}>
    <Text>Informe seu e-mail. Você receberá um link para escolher uma nova senha.</Text>
    <TextInput value={email} onChangeText={setEmail} placeholder="E-mail cadastrado" keyboardType="email-address" autoCapitalize="none"
      style={{ borderWidth: 1, borderColor: '#CBD8D0', padding: 16, borderRadius: 12 }} />
    <BotaoPrimario titulo={enviando ? 'Enviando...' : 'Enviar link'} disabled={enviando} onPress={enviar} />
  </ScrollView>;
}
