const fs = require('fs');

const content = fs.readFileSync('src/services/api.js', 'utf8');
const lines = content.split('\n');

console.log('Total líneas:', lines.length);

// Mantener solo hasta la línea 957 (antes del segundo bloque de conceptos)
const newLines = lines.slice(0, 957);

fs.writeFileSync('src/services/api.js', newLines.join('\n'), 'utf8');
console.log('Líneas después:', newLines.length);
console.log('Archivo limpiado');
