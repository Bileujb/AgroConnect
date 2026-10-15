import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PedidosProdutorScreen from '../screens/produtor/PedidosProdutorScreen';
import HomeProdutorScreen from '../screens/produtor/HomeProdutorScreen';
import CadastrarProdutoScreen from '../screens/produtor/CadastrarProdutoScreen';
import EditarProdutoScreen from '../screens/produtor/EditarProdutoScreen';

const Stack = createNativeStackNavigator();

export default function ProdutorStack() {
  return (
    <Stack.Navigator initialRouteName="HomeProdutor" screenOptions={{ headerTintColor: '#1F5E3D' }}>
      <Stack.Screen name="PedidosProdutor" component={PedidosProdutorScreen} options={{ title: "Pedidos recebidos" }} />
      <Stack.Screen name="HomeProdutor" component={HomeProdutorScreen} options={{ title: 'Início' }} />
      <Stack.Screen
        name="CadastrarProduto"
        component={CadastrarProdutoScreen}
        options={{ title: 'Cadastrar Produto' }}
      />
      <Stack.Screen
        name="EditarProduto"
        component={EditarProdutoScreen}
        options={{ title: 'Editar Produto' }}
      />
    </Stack.Navigator>
  );
}