import feriadosData from '../data/feriados.json';

/**
 * Valida si una fecha es un día hábil (lunes a viernes, excluyendo feriados argentinos)
 * VALIDACIÓN SÍNCRONA usando JSON local
 */
export const esDiaHabilSincrono = (fechaStr) => {
    if (!fechaStr) return false;

    const fecha = new Date(fechaStr + 'T00:00:00');
    const diaSemana = fecha.getDay();

    console.log('🔍 Validando fecha:', {
        fechaStr,
        fecha: fecha.toISOString(),
        diaSemana,
        nombreDia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana]
    });

    // Validar fin de semana
    if (diaSemana === 0 || diaSemana === 6) {
        console.log('❌ Es fin de semana!');
        return false; // Domingo o Sábado
    }

    // Extraer mes-día en formato MM-DD
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const mesdia = `${month}-${day}`;

    // Combinar feriados fijos y móviles
    const todosFeriados = [
        ...feriadosData.feriados_fijos,
        ...feriadosData.feriados_moviles_aproximados
    ];

    // Validar si es feriado
    if (todosFeriados.includes(mesdia)) {
        console.log('❌ Es feriado!');
        return false; // Es feriado
    }

    console.log('✅ Es día hábil');
    return true; // Es día hábil
};

/**
 * Obtener información sobre por qué una fecha no es hábil
 */
const obtenerRazonNoHabil = (fechaStr) => {
    if (!fechaStr) return 'fecha no proporcionada';

    const fecha = new Date(fechaStr + 'T00:00:00');
    const diaSemana = fecha.getDay();

    if (diaSemana === 0) return 'es domingo';
    if (diaSemana === 6) return 'es sábado';

    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const mesdia = `${month}-${day}`;

    const todosFeriados = [
        ...feriadosData.feriados_fijos,
        ...feriadosData.feriados_moviles_aproximados
    ];

    if (todosFeriados.includes(mesdia)) {
        const descripcion = feriadosData.descripcion[mesdia] || 'feriado';
        return `es feriado (${descripcion})`;
    }

    return 'no es día hábil';
};

/**
 * Valida que una fecha sea día hábil y lanza error si no lo es
 * FUNCIÓN SÍNCRONA para usar en onChange
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} nombreCampo - Nombre del campo para el mensaje de error
 * @throws {Error} Si la fecha no es un día hábil
 */
export const validarDiaHabil = (fecha, nombreCampo) => {
    console.log('📅 validarDiaHabil llamada con:', { fecha, nombreCampo });

    if (!fecha) {
        throw new Error(`${nombreCampo} es requerida`);
    }

    if (!esDiaHabilSincrono(fecha)) {
        const razon = obtenerRazonNoHabil(fecha);
        const error = `${nombreCampo} debe ser un día hábil (lunes a viernes, excluyendo feriados). La fecha seleccionada ${razon}.`;
        console.log('❌ Lanzando error:', error);
        throw new Error(error);
    }

    console.log('✅ Validación exitosa');
};
