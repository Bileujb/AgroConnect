import React from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { usePedidos } from '../../context/PedidoContext';

export default function CarrinhoScreen({ navigation }) {
  const { itens, removerItem, valorTotal, limparCarrinho } = useCart();
  const { usuario } = useAuth();
  const { criarPedido } = usePedidos();

  function finalizarPedido() {
    if (itens.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos antes de finalizar.');
      return;
    }

    const pedido = criarPedido({
      consumidorId: usuario?.id,
      itens,
      valorTotal,
    });

    limparCarrinho();
    Alert.alert('Pedido realizado!', `Pedido #${pedido.id} criado. Total: R$ ${valorTotal.toFixed(2)}`, [
      { text: 'Ver meus pedidos', onPress: () => navigation.navigate('MeusPedidos') },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meu Carrinho</Text>

      <FlatList
        data={itens}
        keyExtractor={(item) => item.produtoId}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <View style={styles.itemLinha}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemQuantidade}>Qtd: {item.quantidade}</Text>
            </View>
            <Text style={styles.itemValor}>R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</Text>
            <Pressable onPress={() => removerItem(item.produtoId)} style={{ marginLeft: 12 }}>
              <Text style={styles.remover}>Remover</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Seu carrinho está vazio.</Text>}
      />

      <View style={styles.rodape}>
        <Text style={styles.total}>Total: R$ {valorTotal.toFixed(2)}</Text>
        <BotaoPrimario titulo="Finalizar pedido" onPress={finalizarPedido} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  titulo: { fontSize: 20, fontWeight: '700', color: '#1F5E3D', padding: 20, paddingBottom: 10 },
  itemLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E9E5',
  },
  itemNome: { fontSize: 15, color: '#1F1F1F' },
  itemQuantidade: { fontSize: 13, color: '#666666', marginTop: 2 },
  itemValor: { fontSize: 15, fontWeight: '700', color: '#2E8B57' },
  remover: { color: '#B23A3A', fontSize: 13 },
  vazio: { textAlign: 'center', color: '#888888', marginTop: 40 },
  rodape: { padding: 20, borderTopWidth: 1, borderTopColor: '#E3E9E5' },
  total: { fontSize: 18, fontWeight: '800', color: '#1F5E3D', marginBottom: 12, textAlign: 'right' },
});