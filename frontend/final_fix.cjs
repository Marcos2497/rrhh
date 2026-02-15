const fs = require('fs');

const content = fs.readFileSync('src/services/api.js', 'utf8');
const lines = content.split('\n');

console.log('Total líneas al inicio:', lines.length);

// Encontrar todas las líneas con declaraciones de getConceptosSalariales
const conceptosLines = [];
const parametrosLines = [];

lines.forEach((line, index) => {
    if (line.match(/^export const getConceptosSalariales/)) {
        conceptosLines.push(index + 1);
    }
    if (line.match(/^export const getParametrosLaborales/)) {
        parametrosLines.push(index + 1);
    }
});

console.log('getConceptosSalariales encontrado en líneas:', conceptosLines);
console.log('getParametrosLaborales encontrado en líneas:', parametrosLines);

if (conceptosLines.length > 1) {
    // Mantener solo la primera declaración, eliminar desde la segunda en adelante
    const firstConceptos = conceptosLines[0];
    const secondConceptos = conceptosLines[1];

    console.log(`\nManteniendo funciones en línea ${firstConceptos}`);
    console.log(`Eliminando desde línea ${secondConceptos} hasta el final`);

    // Eliminar desde la segunda declaración de conceptos hasta el final
    const newLines = lines.slice(0, secondConceptos - 1);

    fs.writeFileSync('src/services/api.js', newLines.join('\n'), 'utf8');
    console.log('Total líneas al final:', newLines.length);
    console.log('¡Archivo limpiado!');
} else {
    console.log('No hay duplicados');
}
