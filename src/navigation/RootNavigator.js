import React from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import CadastroScreen from '../screens/auth/CadastroScreen';
import RecuperarSenhaScreen from '../screens/auth/RecuperarSenhaScreen';
import PerfilScreen from '../screens/conta/PerfilScreen';
import AlterarSenhaScreen from '../screens/conta/AlterarSenhaScreen';
import ProdutorStack from './ProdutorStack';
import ConsumidorStack from './ConsumidorStack';
const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { usuario, carregando, erroInicial, restaurar } = useAuth();
  if (carregando) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color="#2E8B57" /></View>;
  if (erroInicial) return <View style={{ flex: 1, justifyContent: 'center', padding: 28, gap: 16 }}>
    <Text>{erroInicial}</Text><Button title="Tentar conectar novamente" onPress={restaurar} />
  </View>;
  return <NavigationContainer><Stack.Navigator screenOptions={{ headerShown: false }}>
    {usuario ? <>
      <Stack.Screen name={usuario.tipoUsuario === 'produtor' ? 'ProdutorApp' : 'ConsumidorApp'}
        component={usuario.tipoUsuario === 'produtor' ? ProdutorStack : ConsumidorStack} />
      <Stack.Screen name="MeuPerfil" component={PerfilScreen} options={{ headerShown: true, title: 'Meu Perfil' }} />
      <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} options={{ headerShown: true, title: 'Alterar Senha' }} />
    </> : <>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} options={{ headerShown: true, title: 'Recuperar Senha' }} />
    </>}
  </Stack.Navigator></NavigationContainer>;
}
