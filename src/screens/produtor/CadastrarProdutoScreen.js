import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useProdutos } from '../../context/ProdutoContext';
import { useAuth } from '../../context/AuthContext';

const CATEGORIAS = [
  { nome: 'Verduras', icone: '🥬' },
  { nome: 'Legumes', icone: '🥕' },
  { nome: 'Frutas', icone: '🍎' },
  { nome: 'Derivados', icone: '🍯' },
];

export default function CadastrarProdutoScreen({ navigation }) {
  const { cadastrarProduto } = useProdutos();
  const { usuario } = useAuth();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidadeEstoque, setQuantidadeEstoque] = useState('');
  const [categoria, setCategoria] = useState('Verduras');

  function handleSalvar() {
    const precoNumero = Number(preco.replace(',', '.'));
    const estoqueNumero = Number(quantidadeEstoque);

    if (!nome || !precoNumero || precoNumero <= 0) {
      Alert.alert('Dados inválidos', 'Informe nome e um preço maior que zero.');
      return;
    }

    cadastrarProduto(
  {
    nome,
    descricao,
    preco: precoNumero,
    quantidadeEstoque: estoqueNumero || 0,
    categoria,
    imagem: null,
    cidadeProdutor: usuario?.cidade || '',
  },
  usuario?.id || 'produtor-teste'
);
    Alert.alert('Produto cadastrado!', `${nome} já está disponível no catálogo.`);
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient colors={['#0A2818', '#1F5E3D']} style={styles.topo}>
        <Text style={styles.folhaTopo}>🌱</Text>
        <Text style={styles.tituloTopo}>Novo Produto</Text>
        <Text style={styles.subtituloTopo}>Preencha os dados abaixo</Text>
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.campo}>
          <Text style={styles.campoIcone}>🏷️</Text>
          <TextInput
            style={styles.campoInput}
            placeholder="Nome do produto"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.campoIcone}>📝</Text>
          <TextInput
            style={styles.campoInput}
            placeholder="Descrição (opcional)"
            value={descricao}
            onChangeText={setDescricao}
          />
        </View>

        <Text style={styles.rotuloSecao}>Categoria</Text>
        <View style={styles.categoriasGrid}>
          {CATEGORIAS.map((cat) => {
            const ativa = categoria === cat.nome;
            return (
              <Pressable
                key={cat.nome}
                style={[styles.categoriaCard, ativa && styles.categoriaCardAtiva]}
                onPress={() => setCategoria(cat.nome)}
              >
                <Text style={styles.categoriaIcone}>{cat.icone}</Text>
                <Text style={[styles.categoriaTexto, ativa && styles.categoriaTextoAtiva]}>
                  {cat.nome}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.linhaDupla}>
          <View style={[styles.campo, styles.campoMetade]}>
            <Text style={styles.campoIcone}>💵</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="Preço"
              value={preco}
              onChangeText={setPreco}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.campo, styles.campoMetade]}>
            <Text style={styles.campoIcone}>📦</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="Estoque"
              value={quantidadeEstoque}
              onChangeText={setQuantidadeEstoque}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <BotaoPrimario titulo="Salvar produto" onPress={handleSalvar} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topo: {
    height: 140,
    paddingHorizontal: 24,
    paddingTop: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  folhaTopo: { position: 'absolute', fontSize: 100, opacity: 0.12, right: -10, bottom: -20 },
  tituloTopo: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  subtituloTopo: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  card: { paddingHorizontal: 24, paddingTop: 24 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3EC',
    borderRadius: 30,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  campoIcone: { fontSize: 15, marginRight: 10 },
  campoInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1F1F1F' },
  rotuloSecao: { fontSize: 13, color: '#6A6A6A', fontWeight: '600', marginBottom: 10, marginTop: 4 },
  categoriasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  categoriaCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3E9E5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  categoriaCardAtiva: { backgroundColor: '#EAF3EC', borderColor: '#2E8B57' },
  categoriaIcone: { fontSize: 26, marginBottom: 6 },
  categoriaTexto: { fontSize: 13, color: '#6A6A6A', fontWeight: '600' },
  categoriaTextoAtiva: { color: '#1F5E3D' },
  linhaDupla: { flexDirection: 'row', gap: 12 },
  campoMetade: { flex: 1 },
});