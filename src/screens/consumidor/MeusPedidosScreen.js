import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
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
  const { pedidosDoConsumidor } = usePedidos();
  const { jaAvaliouPedido } = useAvaliacoes();

  const meusPedidos = pedidosDoConsumidor(usuario?.id);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus Pedidos</Text>

      <FlatList
        data={meusPedidos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          const jaAvaliado = jaAvaliouPedido(item.id);
          return (
            <View style={styles.card}>
              <Text style={styles.codigo}>Pedido #{item.id}</Text>
              <Text style={styles.status}>{ROTULOS_STATUS[item.status] || item.status}</Text>
              <Text style={styles.valor}>R$ {item.valorTotal.toFixed(2)}</Text>

              {jaAvaliado ? (
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