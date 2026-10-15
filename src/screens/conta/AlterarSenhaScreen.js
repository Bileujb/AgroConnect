import React, { useState } from 'react';
import { ScrollView, TextInput, Text, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import BotaoPrimario from '../../components/BotaoPrimario';
export default function AlterarSenhaScreen({ navigation }) {
  const { alterarSenha } = useAuth();
  const [senhaAtual, setAtual] = useState('');
  const [novaSenha, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  async function salvar() {
    if (salvando) return;
    if (novaSenha.length < 8 || novaSenha !== confirmacao) { Alert.alert('Confira a senha', 'Use pelo menos 8 caracteres e confirme a nova senha.'); return; }
    setSalvando(true);
    try { await alterarSenha(senhaAtual, novaSenha); Alert.alert('Senha alterada', 'Use a nova senha no próximo login.'); navigation.goBack(); }
    catch (erro) { Alert.alert('Não foi possível alterar', erro.message); }
    finally { setSalvando(false); }
  }
  return <ScrollView contentContainerStyle={{ padding: 24, gap: 20, backgroundColor: '#FFF', flexGrow: 1 }}>
    <Text>Confirme sua senha atual antes de definir a nova senha.</Text>
    {[[senhaAtual, setAtual, 'Senha atual'], [novaSenha, setNova, 'Nova senha'], [confirmacao, setConfirmacao, 'Confirmar nova senha']].map(([valor, mudar, rotulo]) =>
      <TextInput key={rotulo} value={valor} onChangeText={mudar} placeholder={rotulo} secureTextEntry editable={!salvando}
        style={{ borderWidth: 1, borderColor: '#CBD8D0', padding: 16, borderRadius: 12 }} />)}
    <BotaoPrimario titulo={salvando ? 'Alterando...' : 'Alterar senha'} disabled={salvando} onPress={salvar} />
  </ScrollView>;
}
