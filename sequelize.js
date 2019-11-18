'use strict'
const Sequelize = require('sequelize');
const TeacherModel = require('./models/teacher');
const RegistrationModel = require('./models/registration');
const StudentModel = require('./models/student');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSERNAME, process.env.DBPASSWORD, {
    host: process.env.DBHOST,
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

const Teacher = TeacherModel(sequelize, Sequelize);
const Registration = RegistrationModel(sequelize, Sequelize);
const Student = StudentModel(sequelize, Sequelize);

Teacher.belongsToMany(Student, {through: Registration})
Student.belongsToMany(Teacher, {through: Registration})

sequelize.sync({force: false})
    .then(() => {
        console.log("Database created / updated")
    })

module.exports = {
    Teacher,
    Registration,
    Student
}