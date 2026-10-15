import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';

export default function ProdutoCard({ produto, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imagem}>
        <>{produto.imagem ? <Image source={{ uri: produto.imagem }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : <Text style={styles.imagemEmoji}>🌿</Text>}</>
        <View style={styles.tagCategoria}>
          <Text style={styles.tagCategoriaTexto}>{produto.categoria}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={1}>{produto.nome}</Text>
        <View style={styles.linhaInferior}>
          <Text style={styles.preco}>R$ {produto.preco.toFixed(2)}</Text>
          <View style={styles.botaoAdd}>
            <Text style={styles.botaoAddTexto}>+</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imagem: {
    height: 110,
    backgroundColor: '#E8F3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagemEmoji: { fontSize: 40 },
  tagCategoria: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(31,94,61,0.85)',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  tagCategoriaTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  info: { padding: 12 },
  nome: { fontSize: 15, fontWeight: '700', color: '#1F1F1F', marginBottom: 8 },
  linhaInferior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  preco: { fontSize: 16, fontWeight: '800', color: '#2E8B57' },
  botaoAdd: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2E8B57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAddTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', lineHeight: 18 },
});