const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        registration_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        event_id: { type: DataTypes.INTEGER, allowNull: false},
        acc_id: { type: DataTypes.INTEGER, allowNull: false },
        date_registered: { type: DataTypes.DATE, allowNull: false },
        payment_status: { type: DataTypes.STRING, allowNull: false },
        ticket_number: { type: DataTypes.STRING, allowNull: true }
    };

    const options = {
        timestamps: false 
    };

    return sequelize.define('Registration', attributes, options);
}