'use strict';
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    email: DataTypes.STRING,
    suspended: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
  }, {});
  Student.associate = function(models) {
    // associations can be defined here
  };
  return Student;
};