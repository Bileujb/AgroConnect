import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import EstadoLista from '../../components/EstadoLista';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { usePedidos } from '../../context/PedidoContext';
import { useAvaliacoes } from '../../context/AvaliacaoContext';

const ROTULOS_STATUS = {
  aguardando: 'Aguardando confirmação',
  confirmado: 'Confirmado',
  em_rota: 'Em rota de entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export default function MeusPedidosScreen({ navigation }) {
  const { usuario } = useAuth();
  const { pedidosDoConsumidor, recarregar, carregando, erro, atualizarStatus } = usePedidos();
  const { jaAvaliouPedido, recarregar: recarregarAvaliacoes } = useAvaliacoes();
  const [cancelando, setCancelando] = useState(null);
  useFocusEffect(useCallback(() => { recarregar(); recarregarAvaliacoes(); }, [recarregar, recarregarAvaliacoes]));
  async function cancelar(id) {
    if (cancelando) return;
    setCancelando(id);
    try { await atualizarStatus(id, "cancelado"); }
    catch (erro) { Alert.alert("Não foi possível cancelar", erro.message); }
    finally { setCancelando(null); }
  }

  const meusPedidos = pedidosDoConsumidor(usuario?.id);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus Pedidos</Text>

      <EstadoLista carregando={carregando} erro={erro} recarregar={recarregar} />
      <FlatList
        refreshing={carregando} onRefresh={recarregar}
        data={meusPedidos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          const jaAvaliado = jaAvaliouPedido(item.id);
          return (
            <View style={styles.card}>
              <Text style={styles.codigo}>Pedido #{item.id.slice(0, 8)}</Text>
              <Text style={styles.status}>{ROTULOS_STATUS[item.status] || item.status}</Text>
              {!!item.nomeProdutor && <Text>Produtor: {item.nomeProdutor}</Text>}
              {item.itens?.map((produto) => <Text key={produto.id} style={{ marginTop: 6 }}>
                {produto.quantidade}x {produto.nome} — R$ {produto.precoUnitario.toFixed(2)} cada
              </Text>)}
              <Text style={styles.valor}>R$ {item.valorTotal.toFixed(2)}</Text>

              {item.status === 'aguardando' && <Pressable disabled={!!cancelando} onPress={() => cancelar(item.id)}>
                <Text style={{ color: '#B3261E', marginVertical: 12 }}>{cancelando === item.id ? 'Cancelando...' : 'Cancelar pedido'}</Text>
              </Pressable>}
              {item.status !== 'entregue' ? null : jaAvaliado ? (
                <Text style={styles.avaliado}>✓ Você já avaliou este pedido</Text>
              ) : (
                <Pressable
                  style={styles.botaoAvaliar}
                  onPress={() => navigation.navigate('AvaliarProdutor', { pedido: item })}
                >
                  <Text style={styles.botaoAvaliarTexto}>⭐ Avaliar Produtor</Text>
                </Pressable>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.vazio}>Você ainda não fez nenhum pedido.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },
  titulo: { fontSize: 20, fontWeight: '700', color: '#1F5E3D', padding: 20, paddingBottom: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E3E9E5' },
  codigo: { fontSize: 14, color: '#666666' },
  status: { fontSize: 16, fontWeight: '700', color: '#1F5E3D', marginTop: 4 },
  valor: { fontSize: 15, fontWeight: '700', color: '#2E8B57', marginTop: 4 },
  botaoAvaliar: {
    marginTop: 12,
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: '#F5A623',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botaoAvaliarTexto: { color: '#B8791E', fontWeight: '700', fontSize: 13 },
  avaliado: { marginTop: 12, color: '#2E8B57', fontSize: 13, fontWeight: '600' },
  vazio: { textAlign: 'center', color: '#888888', marginTop: 40 },
});
