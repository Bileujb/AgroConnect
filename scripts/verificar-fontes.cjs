const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
let total = 0;
function visitar(pasta) {
  for (const entrada of fs.readdirSync(pasta, { withFileTypes: true })) {
    const arquivo = path.join(pasta, entrada.name);
    if (entrada.isDirectory()) visitar(arquivo);
    else if (arquivo.endsWith('.js')) {
      const codigo = fs.readFileSync(arquivo, 'utf8');
      const arvore = parser.parse(codigo, { sourceType: 'module', plugins: ['jsx'] });
      for (const no of arvore.program.body) {
        if (no.type === 'ImportDeclaration' && no.source.value.startsWith('.')) {
          const destino = path.resolve(path.dirname(arquivo), no.source.value);
          if (![destino, `${destino}.js`, path.join(destino, 'index.js')].some(fs.existsSync)) throw new Error(`Import ausente: ${arquivo} -> ${no.source.value}`);
        }
      }
      total += 1;
    }
  }
}
visitar('src');
parser.parse(fs.readFileSync('App.js', 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
console.log(`Sintaxe e imports locais conferidos: ${total + 1} arquivos.`);
