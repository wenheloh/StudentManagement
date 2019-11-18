'use strict';
module.exports = (sequelize, DataTypes) => {
  const Registration = sequelize.define('Registration', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
  }, {});
  Registration.associate = function(models) {
    // associations can be defined here
  };
  return Registration;
};