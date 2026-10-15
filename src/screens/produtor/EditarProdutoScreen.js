import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useProdutos } from '../../context/ProdutoContext';

const CATEGORIAS = ['Verduras', 'Legumes', 'Frutas', 'Derivados'];

export default function EditarProdutoScreen({ route, navigation }) {
  const { produto } = route.params;
  const { atualizarProduto } = useProdutos();

  const [nome, setNome] = useState(produto.nome);
  const [descricao, setDescricao] = useState(produto.descricao || '');
  const [preco, setPreco] = useState(String(produto.preco));
  const [quantidadeEstoque, setQuantidadeEstoque] = useState(String(produto.quantidadeEstoque));
  const [categoria, setCategoria] = useState(produto.categoria);
  const [imagem, setImagem] = useState(produto.imagem || '');
  const [enviando, setEnviando] = useState(false);

  async function handleSalvar() {
    if (enviando) return;
    const precoNumero = Number(preco.replace(',', '.'));
    const estoqueNumero = Number(quantidadeEstoque);
    if (!nome.trim() || !Number.isFinite(precoNumero) || precoNumero <= 0) {
      Alert.alert('Dados inválidos', 'Informe nome e um preço válido maior que zero.'); return;
    }
    if (!Number.isInteger(estoqueNumero) || estoqueNumero < 0) {
      Alert.alert('Estoque inválido', 'Informe uma quantidade inteira maior ou igual a zero.'); return;
    }
    const dados = { nome, descricao, preco: precoNumero, quantidadeEstoque: estoqueNumero, categoria, imagem: imagem.trim() || null };
    setEnviando(true);
    try {
      await atualizarProduto(produto.id, dados);
      Alert.alert('Produto salvo!', `${nome} foi salvo no banco.`);
      navigation.goBack();
    } catch (erro) { Alert.alert('Não foi possível salvar', erro.message); }
    finally { setEnviando(false); }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Editar Produto</Text>

      <Text style={styles.rotulo}>Nome do produto</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} />

      <Text style={styles.rotulo}>Descrição</Text>
      <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} multiline />

      <Text style={styles.rotulo}>Categoria</Text>
      <View style={styles.categorias}>
        {CATEGORIAS.map((cat) => (
          <Text
            key={cat}
            onPress={() => setCategoria(cat)}
            style={[styles.chip, categoria === cat && styles.chipSelecionado]}
          >
            {cat}
          </Text>
        ))}
      </View>

      <Text style={styles.rotulo}>Preço (R$)</Text>
      <TextInput
        style={styles.input}
        value={preco}
        onChangeText={setPreco}
        keyboardType="decimal-pad"
      />

      <Text style={styles.rotulo}>Quantidade em estoque</Text>
      <TextInput
        style={styles.input}
        value={quantidadeEstoque}
        onChangeText={setQuantidadeEstoque}
        keyboardType="numeric"
      />

      <Text style={styles.rotulo}>URL da imagem (opcional)</Text>
      <TextInput style={styles.input} value={imagem} onChangeText={setImagem} autoCapitalize="none" />
      <View style={{ height: 24 }} />
      <BotaoPrimario titulo={enviando ? "Salvando..." : "Salvar alterações"} disabled={enviando} onPress={handleSalvar} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#FFFFFF', flexGrow: 1 },
  titulo: { fontSize: 22, fontWeight: '700', color: '#1F5E3D', marginBottom: 20 },
  rotulo: { fontSize: 14, color: '#4A4A4A', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD8D0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    borderWidth: 1,
    borderColor: '#CBD8D0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#4A4A4A',
    overflow: 'hidden',
  },
  chipSelecionado: {
    backgroundColor: '#2E8B57',
    borderColor: '#2E8B57',
    color: '#FFFFFF',
    fontWeight: '700',
  },
});