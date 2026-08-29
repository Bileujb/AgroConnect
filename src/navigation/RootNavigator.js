import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import CadastroScreen from '../screens/auth/CadastroScreen';
import ProdutorStack from './ProdutorStack';
import ConsumidorStack from './ConsumidorStack';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="ProdutorApp" component={ProdutorStack} />
        <Stack.Screen name="ConsumidorApp" component={ConsumidorStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}