'use strict';

const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

var connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSERNAME,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME
})

module.exports = connection; 