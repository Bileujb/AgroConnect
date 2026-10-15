import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ProdutoProvider } from './src/context/ProdutoContext';
import { CartProvider } from './src/context/CartContext';
import { PedidoProvider } from './src/context/PedidoContext';
import { AvaliacaoProvider } from './src/context/AvaliacaoContext';

function DadosDaConta() {
  const { usuario } = useAuth();
  // Ao trocar a conta, todos os dados temporários e o carrinho são recriados.
  return <ProdutoProvider key={usuario?.id || 'sem-conta'}>
    <PedidoProvider><AvaliacaoProvider><CartProvider>
      <RootNavigator /><StatusBar style="dark" />
    </CartProvider></AvaliacaoProvider></PedidoProvider>
  </ProdutoProvider>;
}
export default function App() { return <AuthProvider><DadosDaConta /></AuthProvider>; }
