import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EstadoLista from '../../components/EstadoLista';
import ProdutoCard from '../../components/ProdutoCard';
import { useProdutos } from '../../context/ProdutoContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { calcularDistanciaEntreCidades } from '../../utils/distanciaCidades';

const CATEGORIAS = [
  { nome: 'Todos', icone: '🌾' },
  { nome: 'Verduras', icone: '🥬' },
  { nome: 'Legumes', icone: '🥕' },
  { nome: 'Frutas', icone: '🍎' },
  { nome: 'Derivados', icone: '🍯' },
];

export default function CatalogoScreen({ navigation }) {
  const { produtos, carregando, erro, recarregar } = useProdutos();
  const { usuario, logout } = useAuth();
  const { itens } = useCart();
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

 const produtosFiltrados = produtos
  .filter((p) => {
    const bateBusca = `${p.nome} ${p.nomeProdutor || ''} ${p.nomeFazenda || ''}`.toLowerCase().includes(busca.toLowerCase());
    const bateCategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
    return bateBusca && bateCategoria;
  })
  .sort((a, b) => {
    const distanciaA = calcularDistanciaEntreCidades(usuario?.cidade, a.cidadeProdutor);
    const distanciaB = calcularDistanciaEntreCidades(usuario?.cidade, b.cidadeProdutor);
    return distanciaA - distanciaB; // menor distância primeiro
  });

  useFocusEffect(useCallback(() => { recarregar(); }, [recarregar]));
  async function handleSair() {
    try { await logout(); }
    catch { Alert.alert('Sessão local encerrada', 'A conexão com o servidor estava indisponível.'); }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <View>
          <View style={styles.usuarioLinha}>
            <Text style={styles.saudacao}>Olá, {usuario?.nome?.split(' ')[0] || 'Consumidor'} 👋</Text>
            <Pressable onPress={handleSair} style={styles.sairBotao}>
              <Text style={styles.sairTexto}>Sair</Text>
            </Pressable>
          </View>
          <Text style={styles.subSaudacao}>O que vamos colher hoje?</Text>
        </View>

        <Pressable onPress={() => navigation.navigate('Carrinho')} style={styles.carrinhoBotao}>
          <Text style={styles.carrinhoTexto}>🛒</Text>
          {itens.length > 0 && (
            <View style={styles.carrinhoBadge}>
              <Text style={styles.carrinhoBadgeTexto}>{itens.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 24, padding: 16 }}>
        <Text style={{ color: '#2E8B57' }} onPress={() => navigation.navigate('MeuPerfil')}>Meu Perfil</Text>
        <Text style={{ color: '#2E8B57' }} onPress={() => navigation.navigate('MeusPedidos')}>Meus Pedidos</Text>
      </View>
      <EstadoLista carregando={carregando} erro={erro} recarregar={recarregar} />
      <TextInput
        style={styles.busca}
        placeholder="Buscar produtos, produtores..."
        value={busca}
        onChangeText={setBusca}
      />

      <View style={styles.destaque}>
        <Text style={styles.destaqueTitulo}>🌾 Direto do produtor</Text>
        <Text style={styles.destaqueTexto}>Sem intermediários, colhido recentemente</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIAS}
        keyExtractor={(item) => item.nome}
        contentContainerStyle={styles.categorias}
        renderItem={({ item }) => {
          const ativa = categoriaAtiva === item.nome;
          return (
            <Pressable
              onPress={() => setCategoriaAtiva(item.nome)}
              style={[styles.categoriaBotao, ativa && styles.categoriaBotaoAtivo]}
            >
              <Text style={styles.categoriaBotaoIcone}>{item.icone}</Text>
              <Text style={[styles.categoriaBotaoTexto, ativa && styles.categoriaBotaoTextoAtivo]}>
                {item.nome}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        refreshing={carregando} onRefresh={recarregar}
        data={produtosFiltrados}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 14 }}
        renderItem={({ item }) => (
          <ProdutoCard
            produto={item}
            onPress={() => navigation.navigate('DetalheProduto', { produto: item })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum produto encontrado.</Text>
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
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 12,
  },
  usuarioLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saudacao: { fontSize: 19, fontWeight: '800', color: '#1F5E3D' },
  subSaudacao: { fontSize: 13, color: '#6A7A6F', marginTop: 2 },
  sairBotao: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FDE8E8',
    borderRadius: 6,
  },
 sairBotao: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FDE8E8',
    borderRadius: 6,
    marginLeft: 4, // Dá um respiro adicional do emoji
  },
  carrinhoBotao: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  carrinhoTexto: { fontSize: 18 },
  carrinhoBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#2E8B57',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  carrinhoBadgeTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  busca: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  destaque: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: '#1F5E3D',
    borderRadius: 16,
    padding: 16,
  },
  destaqueTitulo: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  destaqueTexto: { color: '#CFE8DA', fontSize: 13, marginTop: 4 },
  categorias: { paddingHorizontal: 20, paddingVertical: 16 },
  categoriaBotao: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9E5',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    minWidth: 68,
  },
  categoriaBotaoAtivo: { backgroundColor: '#EAF3EC', borderColor: '#2E8B57' },
  categoriaBotaoIcone: { fontSize: 22, marginBottom: 4 },
  categoriaBotaoTexto: { fontSize: 12, color: '#6A6A6A', fontWeight: '600' },
  categoriaBotaoTextoAtivo: { color: '#1F5E3D' },
  vazio: { textAlign: 'center', color: '#888888', marginTop: 40 },
});