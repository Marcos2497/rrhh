const cron = require('node-cron');
const { Op } = require('sequelize');
const Contrato = require('../models/Contrato');

cron.schedule('0 0 * * *', async () => { // todos los días a las 00:00
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    await Contrato.update(
        { estado: 'pendiente' },
        { where: { fechaInicio: { [Op.gt]: hoy } } }
    );

    await Contrato.update(
        { estado: 'en_curso' },
        {
            where: {
                fechaInicio: { [Op.lte]: hoy },
                fechaFin: { [Op.gte]: hoy },
            }
        }
    );

    await Contrato.update(
        { estado: 'finalizado' },
        {
            where: {
                fechaFin: { [Op.lt]: hoy }
            }
        }
    );
});

module.exports = {
    startContratoCron: () => {
        console.log('✅ Cron de contratos iniciado');
    }
};
