const { Solicitud, Vacaciones, Licencia, HorasExtras, Renuncia } = require('../models');
const { Op } = require('sequelize');
const { condicionSolapamientoFechas, condicionFechaEnRango, calcularDiasEntre } = require('../utils/solapamiento');

/**
 * Valida creación/edición de vacaciones
 * @param {number} contratoId - ID del contrato
 * @param {object} datos - Datos de la solicitud
 * @param {number|null} solicitudIdActual - ID de solicitud actual (para edición)
 * @returns {object} - { valido: boolean, error?: string }
 */
const validarVacaciones = async (contratoId, datos, solicitudIdActual = null) => {
    const { fechaInicio, fechaFin } = datos;

    // Condición para excluir la solicitud actual (para edición)
    const excludeCondition = solicitudIdActual
        ? { id: { [Op.ne]: solicitudIdActual } }
        : {};

    // 1. Verificar si hay vacaciones pendientes
    const pendiente = await Solicitud.findOne({
        where: {
            contratoId,
            tipoSolicitud: 'vacaciones',
            activo: true,
            ...excludeCondition
        },
        include: [{
            model: Vacaciones,
            as: 'vacaciones',
            where: { estado: 'pendiente' }
        }]
    });

    if (pendiente) {
        return { valido: false, error: 'Ya existe una solicitud de vacaciones pendiente para este contrato' };
    }

    // 2. Verificar solapamiento con vacaciones aprobadas
    const vacacionesAprobadas = await Solicitud.findOne({
        where: {
            contratoId,
            tipoSolicitud: 'vacaciones',
            activo: true,
            ...excludeCondition
        },
        include: [{
            model: Vacaciones,
            as: 'vacaciones',
            where: {
                estado: 'aprobada',
                ...condicionSolapamientoFechas(fechaInicio, fechaFin)
            }
        }]
    });

    if (vacacionesAprobadas) {
        return { valido: false, error: 'Las fechas se solapan con vacaciones aprobadas existentes' };
    }

    // 3. Verificar solapamiento con licencias justificadas
    const licenciasJustificadas = await Solicitud.findOne({
        where: {
            contratoId,
            tipoSolicitud: 'licencia',
            activo: true
        },
        include: [{
            model: Licencia,
            as: 'licencia',
            where: {
                estado: 'justificada',
                ...condicionSolapamientoFechas(fechaInicio, fechaFin)
            }
        }]
    });

    if (licenciasJustificadas) {
        return { valido: false, error: 'Las fechas se solapan con una licencia justificada existente' };
    }

    // 4. Verificar solapamiento con horas extras aprobadas
    const horasExtrasAprobadas = await Solicitud.findOne({
        where: {
            contratoId,
            tipoSolicitud: 'horas_extras',
            activo: true
        },
        include: [{
            model: HorasExtras,
            as: 'horasExtras',
            where: {
                estado: 'aprobada',
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            }
        }]
    });

    if (horasExtrasAprobadas) {
        return { valido: false, error: 'Las fechas incluyen un día con horas extras aprobadas' };
    }

    return { valido: true };
};

/**
 * Ejecuta acciones al aprobar vacaciones
 * @param {number} contratoId - ID del contrato
 * @param {number} diasAprobados - Cantidad de días de vacaciones
 * @param {object} transaction - Transacción de Sequelize
 */
const onAprobacion = async (contratoId, diasAprobados, transaction) => {
    // Si hay renuncia aprobada, sumar días a fechaBajaEfectiva
    const renunciaAprobada = await Solicitud.findOne({
        where: {
            contratoId,
            tipoSolicitud: 'renuncia',
            activo: true
        },
        include: [{
            model: Renuncia,
            as: 'renuncia',
            where: { estado: 'aceptada' }
        }]
    });

    if (renunciaAprobada && renunciaAprobada.renuncia) {
        const fechaBaja = new Date(renunciaAprobada.renuncia.fechaBajaEfectiva);
        fechaBaja.setDate(fechaBaja.getDate() + diasAprobados);

        await renunciaAprobada.renuncia.update({
            fechaBajaEfectiva: fechaBaja.toISOString().split('T')[0]
        }, { transaction });
    }
};

module.exports = {
    validarVacaciones,
    onAprobacion
};
