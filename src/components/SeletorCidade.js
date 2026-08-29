import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CIDADES = [
  'Curitiba',
  'Araucária',
  'Colombo',
  'Pinhais',
  'Campo Largo',
  'Almirante Tamandaré',
  'São José dos Pinhais',
  'Campo Magro',
  'Piraquara',
  'Fazenda Rio Grande',
  'Quatro Barras',
  'Campina Grande do Sul',
  'Itaperuçu',
  'Rio Branco do Sul',
  'Bocaiúva do Sul',
  'Mandirituba',
  'Lapa',
  'Balsa Nova',
];

export default function SeletorCidade({ cidadeSelecionada, onSelecionar }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoIcone}>🏙️</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={cidadeSelecionada}
          onValueChange={onSelecionar}
          style={styles.picker}
          dropdownIconColor="#2E8B57"
          mode="dropdown"
          accessibilityLabel="Selecionar cidade"
        >
          <Picker.Item label="Selecione sua cidade..." value="" color="#999999" />
          {CIDADES.map((cidade) => (
            <Picker.Item key={cidade} label={cidade} value={cidade} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3EC',
    borderRadius: 30,
    paddingLeft: 18,
    marginBottom: 14,
  },
  campoIcone: { fontSize: 15, zIndex: 1 },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    color: '#1F1F1F',
    width: '100%',
    height: Platform.OS === 'ios' ? 180 : 52,
  },
});