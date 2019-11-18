'use strict';
const connection = require('./db.js');

class Student {
    constructor(){}

    get_student_by_email(email) {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM ?? WHERE ?? = ?";
            let inserts = ['student', 'email', email];
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
                        "Data": res
                    })
                }
            })

        })
    }

    add_student(email) {
        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO ?? (??, ??, ??) VALUES (?, NOW(), NOW())";
            let inserts = ['student', 'email', 'modified_time', 'created_time', email];
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

    suspend_student(email) {
        return new Promise((resolve, reject) => {
            let sql = "UPDATE ?? SET suspended = 1, modified_time = NOW() WHERE email = ? LIMIT 1"
            let inserts = ['student', email];
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
                        "Data": res.affectedRows
                    })
                }
            })
        })
    }
}

module.exports = Student;