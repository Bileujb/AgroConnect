import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePedidos } from '../../context/PedidoContext';
import { useProdutos } from '../../context/ProdutoContext';
import EstadoLista from '../../components/EstadoLista';
const PROXIMO = { aguardando: ['confirmado', 'Confirmar pedido'], confirmado: ['em_rota', 'Iniciar entrega'], em_rota: ['entregue', 'Marcar entregue'] };
export default function PedidosProdutorScreen() {
  const { pedidos, carregando, erro, recarregar, atualizarStatus } = usePedidos();
  const { recarregar: recarregarProdutos } = useProdutos();
  const [enviando, setEnviando] = useState(null);
  useFocusEffect(useCallback(() => { recarregar(); }, [recarregar]));
  async function mudar(pedido, status) {
    if (enviando) return;
    setEnviando(pedido.id);
    try { await atualizarStatus(pedido.id, status); if (status === 'cancelado') await recarregarProdutos(); }
    catch (falha) { Alert.alert('Não foi possível atualizar', falha.message); }
    finally { setEnviando(null); }
  }
  return <View style={{ flex: 1, backgroundColor: '#FFF' }}>
    <EstadoLista carregando={carregando} erro={erro} recarregar={recarregar} />
    <FlatList data={pedidos} keyExtractor={(p) => p.id} refreshing={carregando} onRefresh={recarregar}
      contentContainerStyle={{ padding: 20, gap: 16 }} ListEmptyComponent={<Text>Nenhum pedido recebido.</Text>}
      renderItem={({ item }) => <View style={{ padding: 16, borderWidth: 1, borderColor: '#CBD8D0', borderRadius: 12, gap: 10 }}>
        <Text style={{ fontWeight: '700', color: '#1F5E3D' }}>Pedido #{item.id.slice(0, 8)}</Text>
        <Text>{item.nomeConsumidor} · {item.status}</Text><Text>{item.enderecoEntrega} · {item.cidadeEntrega}</Text>
        {item.itens.map((i) => <Text key={i.id}>{i.quantidade}x {i.nome} — R$ {i.precoUnitario.toFixed(2)}</Text>)}
        <Text>Total: R$ {item.valorTotal.toFixed(2)}</Text>
        {PROXIMO[item.status] && <Pressable disabled={!!enviando} onPress={() => mudar(item, PROXIMO[item.status][0])}>
          <Text style={{ color: '#2E8B57', fontWeight: '700' }}>{enviando === item.id ? 'Atualizando...' : PROXIMO[item.status][1]}</Text>
        </Pressable>}
        {['aguardando', 'confirmado'].includes(item.status) && <Pressable disabled={!!enviando} onPress={() =>
          Alert.alert('Cancelar pedido?', 'O estoque será devolvido.', [{ text: 'Voltar' }, { text: 'Cancelar pedido', onPress: () => mudar(item, 'cancelado') }])}>
          <Text style={{ color: '#B3261E' }}>Cancelar pedido</Text>
        </Pressable>}
      </View>} />
  </View>;
}
