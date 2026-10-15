import React, { useState } from 'react';
import { ScrollView, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import SeletorCidade from '../../components/SeletorCidade';
import BotaoPrimario from '../../components/BotaoPrimario';
export default function PerfilScreen({ navigation }) {
  const { usuario, atualizarPerfil } = useAuth();
  const [dados, setDados] = useState({ nome: usuario.nome || '', cidade: usuario.cidade || '',
    nomeFazenda: usuario.nomeFazenda || '', cnpj: usuario.cnpj || '', enderecoFazenda: usuario.enderecoFazenda || '',
    enderecoEntrega: usuario.enderecoEntrega || '' });
  const [salvando, setSalvando] = useState(false);
  const campo = (nome, valor) => setDados((atual) => ({ ...atual, [nome]: valor }));
  async function salvar() {
    if (salvando) return;
    setSalvando(true);
    try { await atualizarPerfil(dados); Alert.alert('Perfil atualizado', 'Seus dados foram salvos.'); navigation.goBack(); }
    catch (erro) { Alert.alert('Não foi possível salvar', erro.message); }
    finally { setSalvando(false); }
  }
  const texto = (nome, rotulo, extra = {}) => <><Text style={styles.rotulo}>{rotulo}</Text>
    <TextInput style={styles.input} value={dados[nome]} onChangeText={(v) => campo(nome, v)} editable={!salvando} {...extra} /></>;
  return <ScrollView contentContainerStyle={styles.pagina} keyboardShouldPersistTaps="handled">
    <Text style={styles.titulo}>Minha conta</Text><Text>{usuario.email} · {usuario.tipoUsuario}</Text>
    {texto('nome', 'Nome completo')}
    <Text style={styles.rotulo}>Cidade</Text>
    <SeletorCidade cidadeSelecionada={dados.cidade} onSelecionar={(v) => campo('cidade', v)} />
    {usuario.tipoUsuario === 'produtor' ? <>
      {texto('nomeFazenda', 'Nome da fazenda/sítio')}{texto('cnpj', 'CNPJ', { keyboardType: 'numeric' })}
      {texto('enderecoFazenda', 'Endereço da fazenda')}
    </> : texto('enderecoEntrega', 'Endereço de entrega')}
    <BotaoPrimario titulo={salvando ? 'Salvando...' : 'Salvar perfil'} disabled={salvando} onPress={salvar} />
    <BotaoPrimario titulo="Alterar senha" disabled={salvando} onPress={() => navigation.navigate('AlterarSenha')} />
  </ScrollView>;
}
const styles = StyleSheet.create({ pagina: { padding: 24, gap: 12, backgroundColor: '#FFF', flexGrow: 1 },
  titulo: { color: '#1F5E3D', fontSize: 24, fontWeight: '700' }, rotulo: { color: '#4A4A4A', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#CBD8D0', borderRadius: 12, padding: 14, fontSize: 16 } });
