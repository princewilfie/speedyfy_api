const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        reg_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        event_id: { type: DataTypes.INTEGER, allowNull: false },
        acc_id: { type: DataTypes.INTEGER, allowNull: false },
        acc_name: { type: DataTypes.STRING, allowNull: false },
        date_registered: { type: DataTypes.DATE, allowNull: false },
        payment_status: { type: DataTypes.STRING, allowNull: false }
    };

    const options = {
        timestamps: false // Optionally, you can define timestamps behavior here
    };

    return sequelize.define('Registration', attributes, options);
}
