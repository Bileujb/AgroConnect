import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useAvaliacoes } from '../../context/AvaliacaoContext';
import { useAuth } from '../../context/AuthContext';

export default function AvaliarProdutorScreen({ route, navigation }) {
  const { pedido } = route.params; // recebe o pedido que está sendo avaliado
  const { avaliarProdutor } = useAvaliacoes();
  const { usuario } = useAuth();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');

  function handleEnviar() {
    if (nota === 0) {
      Alert.alert('Escolha uma nota', 'Toque nas estrelas para avaliar de 1 a 5.');
      return;
    }

    avaliarProdutor({
      produtorId: pedido.produtorId,
      consumidorId: usuario?.id,
      pedidoId: pedido.id,
      nota,
      comentario,
    });

    Alert.alert('Obrigado!', 'Sua avaliação foi enviada.');
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Avaliar Produtor</Text>
      <Text style={styles.subtitulo}>Pedido #{pedido.id}</Text>

      <Text style={styles.rotulo}>Sua nota</Text>
      <View style={styles.estrelas}>
        {[1, 2, 3, 4, 5].map((valor) => (
          <Pressable key={valor} onPress={() => setNota(valor)}>
            <Text style={[styles.estrela, valor <= nota && styles.estrelaAtiva]}>★</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.rotulo}>Comentário (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Como foi sua experiência com esse produtor?"
        value={comentario}
        onChangeText={setComentario}
        multiline
      />

      <View style={{ marginTop: 20 }}>
        <BotaoPrimario titulo="Enviar avaliação" onPress={handleEnviar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24 },
  titulo: { fontSize: 22, fontWeight: '700', color: '#1F5E3D' },
  subtitulo: { fontSize: 14, color: '#8A8A8A', marginTop: 4, marginBottom: 24 },
  rotulo: { fontSize: 14, color: '#4A4A4A', marginBottom: 8, fontWeight: '600' },
  estrelas: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  estrela: { fontSize: 40, color: '#E3E9E5' },
  estrelaAtiva: { color: '#F5A623' },
  input: {
    borderWidth: 1,
    borderColor: '#CBD8D0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});