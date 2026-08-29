import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CatalogoScreen from '../screens/consumidor/CatalogoScreen';
import DetalheProdutoScreen from '../screens/consumidor/DetalheProdutoScreen';
import CarrinhoScreen from '../screens/consumidor/CarrinhoScreen';
import MeusPedidosScreen from '../screens/consumidor/MeusPedidosScreen';
import AvaliarProdutorScreen from '../screens/consumidor/AvaliarProdutorScreen';

const Stack = createNativeStackNavigator();

export default function ConsumidorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: '#1F5E3D' }}>
      <Stack.Screen name="Catalogo" component={CatalogoScreen} options={{ title: 'Catálogo' }} />
      <Stack.Screen name="DetalheProduto" component={DetalheProdutoScreen} options={{ title: 'Detalhes do Produto' }} />
      <Stack.Screen name="Carrinho" component={CarrinhoScreen} options={{ title: 'Carrinho' }} />
      <Stack.Screen name="MeusPedidos" component={MeusPedidosScreen} options={{ title: 'Meus Pedidos' }} />
      <Stack.Screen
        name="AvaliarProdutor"
        component={AvaliarProdutorScreen}
        options={{ title: 'Avaliar Produtor' }}
      />
    </Stack.Navigator>
  );
}