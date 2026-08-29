import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ProdutoProvider } from './src/context/ProdutoContext';
import { CartProvider } from './src/context/CartContext';
import { PedidoProvider } from './src/context/PedidoContext';
import { AvaliacaoProvider } from './src/context/AvaliacaoContext';

// Imports usados no teste do banco de dados (mantidos comentados para reativar depois)
// import { Alert } from 'react-native';
// import { getDb } from './src/database/db';
// import { inserirProduto, listarProdutos } from './src/database/produtoRepository';

export default function App() {
  // TESTE DO BANCO DE DADOS (SQLite) — já validado, comentado para não rodar toda vez que o app abre.
  // Reativar quando formos conectar o ProdutoContext no banco de verdade.
  //
  // useEffect(() => {
  //   async function testarBanco() {
  //     try {
  //       await getDb();
  //       const produtos = await listarProdutos();
  //       console.log('📦 Produtos no banco:', produtos);
  //       Alert.alert(
  //         'Banco de dados OK! ✅',
  //         `Produtos encontrados: ${produtos.length}\nPrimeiro: ${produtos[0]?.nome || 'nenhum'}`
  //       );
  //     } catch (erro) {
  //       console.log('❌ Erro no teste do banco:', erro);
  //       Alert.alert('Erro no banco de dados', String(erro));
  //     }
  //   }
  //   testarBanco();
  // }, []);

  return (
    <AuthProvider>
      <ProdutoProvider>
        <PedidoProvider>
          <AvaliacaoProvider>
            <CartProvider>
              <RootNavigator />
              <StatusBar style="dark" />
            </CartProvider>
          </AvaliacaoProvider>
        </PedidoProvider>
      </ProdutoProvider>
    </AuthProvider>
  );
}