'use strict';

const mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'locst',
    user: 'root',
    password: '',
    database: 'express'
})

module.exports = connection; 