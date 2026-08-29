export class SensorIoT {
  constructor({ id, produtorId, tipo, valor, dataLeitura, viaSMS }) {
    this.id = id;
    this.produtorId = produtorId;
    this.tipo = tipo; // 'umidade' | 'ph'
    this.valor = valor;
    this.dataLeitura = dataLeitura || new Date().toISOString();
    this.viaSMS = viaSMS ?? true;
  }

  static simularEnvioSMS(produtorId) {
    const umidade = Math.round(30 + Math.random() * 50);
    const ph = (5.5 + Math.random() * 2).toFixed(1);
    const textoSimulado = `UMID:${umidade};PH:${ph};ID:${produtorId}`;
    return SensorIoT.parseSMS(textoSimulado, produtorId);
  }

  static parseSMS(texto, produtorId) {
    const campos = Object.fromEntries(
      texto.split(';').map((par) => par.split(':'))
    );
    return [
      new SensorIoT({ id: null, produtorId, tipo: 'umidade', valor: Number(campos.UMID) }),
      new SensorIoT({ id: null, produtorId, tipo: 'ph', valor: Number(campos.PH) }),
    ];
  }
}