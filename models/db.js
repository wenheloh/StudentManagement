'use strict';

const mysql = require('mysql');

/* var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'express'
}) */

var connection = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12312172',
    password: 'aFz5xysVdB',
    database: 'sql12312172'
})

module.exports = connection; 