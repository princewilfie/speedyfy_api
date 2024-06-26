const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false },
        location: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        category: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.FLOAT, allowNull: false },
        image: { type: DataTypes.STRING, allowNull: true } // Change the type to STRING to store the image path
    };

    const options = {
        timestamps: false // Optionally, you can define timestamps behavior here
    };

    return sequelize.define('Event', attributes, options);
}
