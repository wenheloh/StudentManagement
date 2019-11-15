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
            let sql = "INSERT INTO ?? (??) VALUES (?)";
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
                        "Data": res.insertId
                    })
                }
            });

        })
    }
}

module.exports = Student;