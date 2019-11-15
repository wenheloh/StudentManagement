'use strict';
const connection = require('./db');

class Registration {
    constructor() {
        connection.on('error', (err) => {
            res.status(500).send({
                "Status": "Fail",
                "Message": err
            })
        })
    }

    add_registration(teacher_id, student_id) {
        return new Promise((resolve, rej) => {
            let sql = "INSERT INTO ?? (??, ??) VALUES (?, ?)";
            let inserts = ['registration', 'teacher_id', 'student_id', teacher_id, student_id];
            sql = connection.format(sql, inserts);
            
            connection.query(sql, (err, res) => {
                if(err) {
                    console.log(Date() + ": " + err.code + " - " + err.sqlMessage);

                    resolve({
                        "Status": "Fail",
                        "Message": err.code
                    })
                } else {
                    resolve({
                        "Status": "Success",
                        "Data": res.insertId
                    })
                }
            });
        })
        
    }
}

module.exports = Registration;