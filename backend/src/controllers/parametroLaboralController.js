const { ParametroLaboral } = require('../models');

// Obtener parámetros laborales por espacio de trabajo
const get = async (req, res) => {
    try {
        const { espacioTrabajoId } = req.query;

        if (!espacioTrabajoId) {
            return res.status(400).json({ error: 'espacioTrabajoId es requerido' });
        }

        // Buscar el parámetro de límite de ausencia para este espacio
        let parametro = await ParametroLaboral.findOne({
            where: {
                espacioTrabajoId: parseInt(espacioTrabajoId),
                tipo: 'limite_ausencia_injustificada'
            }
        });

        // Si no existe, crear con valor por defecto
        if (!parametro) {
            parametro = await ParametroLaboral.create({
                tipo: 'limite_ausencia_injustificada',
                valor: '1',
                descripcion: 'Límite de ausencias injustificadas permitidas por mes',
                esObligatorio: true,
                espacioTrabajoId: parseInt(espacioTrabajoId)
            });
        }

        // Devolver en formato compatible con frontend
        res.json({
            limiteAusenciaInjustificada: parseInt(parametro.valor)
        });
    } catch (error) {
        console.error('Error al obtener parámetros laborales:', error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar parámetros laborales
const update = async (req, res) => {
    try {
        const { limiteAusenciaInjustificada, espacioTrabajoId } = req.body;

        if (!espacioTrabajoId) {
            return res.status(400).json({ error: 'espacioTrabajoId es requerido' });
        }

        // Buscar el parámetro existente
        let parametro = await ParametroLaboral.findOne({
            where: {
                espacioTrabajoId: parseInt(espacioTrabajoId),
                tipo: 'limite_ausencia_injustificada'
            }
        });

        if (!parametro) {
            // Crear si no existe
            parametro = await ParametroLaboral.create({
                tipo: 'limite_ausencia_injustificada',
                valor: limiteAusenciaInjustificada !== undefined ? limiteAusenciaInjustificada.toString() : '1',
                descripcion: 'Límite de ausencias injustificadas permitidas por mes',
                esObligatorio: true,
                espacioTrabajoId: parseInt(espacioTrabajoId)
            });
        } else {
            // Actualizar
            if (limiteAusenciaInjustificada !== undefined) {
                parametro.valor = limiteAusenciaInjustificada.toString();
            }
            await parametro.save();
        }

        res.json({
            message: 'Parámetros laborales actualizados exitosamente',
            limiteAusenciaInjustificada: parseInt(parametro.valor)
        });
    } catch (error) {
        console.error('Error al actualizar parámetros laborales:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    get,
    update,
};
