import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EstadoLista from '../../components/EstadoLista';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useAuth } from '../../context/AuthContext';
import { useProdutos } from '../../context/ProdutoContext';

export default function HomeProdutorScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const { produtosDoProdutor, removerProduto, carregando, erro, recarregar } = useProdutos();

  const meusProdutos = produtosDoProdutor(usuario?.id);

  function confirmarExclusao(produto) {
    Alert.alert(
      'Excluir produto',
      `Tem certeza que deseja excluir "${produto.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => { try { await removerProduto(produto.id); } catch (erro) { Alert.alert('Não foi possível excluir', erro.message); } } },
      ]
    );
  }

  useFocusEffect(useCallback(() => { recarregar(); }, [recarregar]));
  async function handleSair() {
    try { await logout(); }
    catch { Alert.alert('Sessão local encerrada', 'A conexão com o servidor estava indisponível.'); }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.saudacao}>Olá, {usuario?.nome || 'Produtor'} 👋</Text>
        <Text style={styles.link} onPress={handleSair}>Sair</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 24, padding: 16 }}>
        <Text style={styles.link} onPress={() => navigation.navigate('MeuPerfil')}>Meu Perfil</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('PedidosProdutor')}>Pedidos recebidos</Text>
      </View>
      <EstadoLista carregando={carregando} erro={erro} recarregar={recarregar} />
      <View style={styles.cardMetrica}>
        <Text style={styles.metricaValor}>{meusProdutos.length}</Text>
        <Text style={styles.metricaLabel}>Produtos cadastrados</Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <BotaoPrimario
          titulo="+ Cadastrar Produto"
          onPress={() => navigation.navigate('CadastrarProduto')}
        />
      </View>

      <FlatList
        style={{ marginTop: 20 }}
        refreshing={carregando} onRefresh={recarregar}
        data={meusProdutos}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          meusProdutos.length > 0 ? <Text style={styles.subtitulo}>Meus produtos</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.itemProduto}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemCategoria}>{item.categoria}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.itemPreco}>R$ {item.preco.toFixed(2)}</Text>
              <Text style={styles.itemEstoque}>Estoque: {item.quantidadeEstoque}</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                <Pressable onPress={() => navigation.navigate('EditarProduto', { produto: item })}>
                  <Text style={styles.editar}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => confirmarExclusao(item)}>
                  <Text style={styles.excluir}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum produto cadastrado ainda. Toque em "Cadastrar Produto" acima.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  saudacao: { fontSize: 20, fontWeight: '700', color: '#1F5E3D' },
  link: { color: '#B23A3A', fontSize: 14 },
  cardMetrica: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E9E5',
    marginBottom: 16,
  },
  metricaValor: { fontSize: 28, fontWeight: '800', color: '#2E8B57' },
  metricaLabel: { fontSize: 13, color: '#4A4A4A', marginTop: 4 },
  subtitulo: { fontSize: 16, fontWeight: '700', color: '#1F5E3D', paddingHorizontal: 20, marginBottom: 8 },
  itemProduto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  itemNome: { fontSize: 15, fontWeight: '600', color: '#1F1F1F' },
  itemCategoria: { fontSize: 13, color: '#666666', marginTop: 2 },
  itemPreco: { fontSize: 15, fontWeight: '700', color: '#2E8B57' },
  itemEstoque: { fontSize: 13, color: '#666666', marginTop: 2 },
  editar: { color: '#2E8B57', fontSize: 13, fontWeight: '600' },
  excluir: { color: '#B23A3A', fontSize: 13, marginTop: 6, fontWeight: '600' },
  vazio: { textAlign: 'center', color: '#888888', marginTop: 40, paddingHorizontal: 40 },
});