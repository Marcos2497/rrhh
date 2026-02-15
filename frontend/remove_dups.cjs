const fs = require('fs');

const content = fs.readFileSync('src/services/api.js', 'utf8');
const lines = content.split('\n');

console.log('Total líneas:', lines.length);

// Eliminar desde la línea 959 hasta el final (las funciones duplicadas que acabo de agregar)
const newLines = lines.slice(0, 958);

fs.writeFileSync('src/services/api.js', newLines.join('\n'), 'utf8');
console.log('Líneas después:', newLines.length);
console.log('Duplicados eliminados');
