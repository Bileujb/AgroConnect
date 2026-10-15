import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Image } from 'react-native';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useCart } from '../../context/CartContext';

export default function DetalheProdutoScreen({ route, navigation }) {
  const { produto } = route.params;
  const { adicionarItem } = useCart();
  const [quantidade, setQuantidade] = useState(1);

  function diminuir() {
    setQuantidade((atual) => Math.max(1, atual - 1));
  }

  function aumentar() {
    setQuantidade((atual) => Math.min(produto.quantidadeEstoque, atual + 1));
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imagemPlaceholder}>
        <>{produto.imagem ? <Image source={{ uri: produto.imagem }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : <Text style={{ fontSize: 56 }}>🌱</Text>}</>
      </View>

      <View style={styles.conteudo}>
        <Text style={styles.nome}>{produto.nome}</Text>
        <Text style={styles.preco}>R$ {produto.preco.toFixed(2)}</Text>
        <Text style={styles.categoria}>{produto.categoria}</Text>
        <Text>{produto.nomeFazenda || produto.nomeProdutor} · {produto.cidadeProdutor}</Text>
        {produto.notaMedia != null && <Text>⭐ {Number(produto.notaMedia).toFixed(1)}</Text>}

        {!!produto.descricao && <Text style={styles.descricao}>{produto.descricao}</Text>}

        <View style={styles.rastreabilidade}>
          <Text style={styles.rastreabilidadeTitulo}>📍 Direto do produtor</Text>
          <Text style={styles.rastreabilidadeTexto}>
            Produzido por um agricultor familiar cadastrado no AgroConnect, sem intermediários.
          </Text>
        </View>

        <Text style={styles.estoque}>
          {produto.quantidadeEstoque > 0
            ? `${produto.quantidadeEstoque} disponíveis`
            : 'Sem estoque no momento'}
        </Text>

        {produto.quantidadeEstoque > 0 && (
          <View style={styles.seletorQuantidade}>
            <Text style={styles.rotuloQuantidade}>Quantidade</Text>
            <View style={styles.controles}>
              <Pressable onPress={diminuir} style={styles.botaoQtd}>
                <Text style={styles.botaoQtdTexto}>−</Text>
              </Pressable>
              <Text style={styles.quantidadeValor}>{quantidade}</Text>
              <Pressable onPress={aumentar} style={styles.botaoQtd}>
                <Text style={styles.botaoQtdTexto}>+</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <BotaoPrimario
            titulo={`Adicionar ${quantidade}x ao carrinho`}
            disabled={produto.quantidadeEstoque <= 0}
            onPress={() => {
              try { adicionarItem(produto, quantidade); navigation.navigate('Carrinho'); }
              catch (erro) { Alert.alert('Confira a quantidade', erro.message); }
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  imagemPlaceholder: {
    height: 200,
    backgroundColor: '#E8F3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: { padding: 20 },
  nome: { fontSize: 22, fontWeight: '800', color: '#1F5E3D' },
  preco: { fontSize: 20, fontWeight: '700', color: '#2E8B57', marginTop: 4 },
  categoria: { fontSize: 14, color: '#666666', marginTop: 2 },
  descricao: { fontSize: 15, color: '#4A4A4A', marginTop: 14, lineHeight: 22 },
  rastreabilidade: { marginTop: 20, backgroundColor: '#E8F3EC', borderRadius: 12, padding: 14 },
  rastreabilidadeTitulo: { fontWeight: '700', color: '#1F5E3D', marginBottom: 6 },
  rastreabilidadeTexto: { fontSize: 14, color: '#333333', lineHeight: 20 },
  estoque: { fontSize: 14, color: '#666666', marginTop: 16 },
  seletorQuantidade: { marginTop: 20 },
  rotuloQuantidade: { fontSize: 14, color: '#4A4A4A', marginBottom: 8 },
  controles: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  botaoQtd: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E8B57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoQtdTexto: { fontSize: 22, color: '#2E8B57', fontWeight: '700' },
  quantidadeValor: { fontSize: 18, fontWeight: '700', color: '#1F1F1F', minWidth: 30, textAlign: 'center' },
});