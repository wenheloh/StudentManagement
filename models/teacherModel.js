'use strict';
const connection = require('./db');

class Teacher {
    constructor(){}

    get_teacher_by_email(email) {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM ?? WHERE ?? = ?";
            let inserts = ['teacher', 'email', email];
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

    add_teacher(email) {
        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO ?? (??) VALUES (?)";
            let inserts = ['teacher', 'email', email];
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

    get_common_students(arrEmail) {
        return new Promise((resolve, reject) => {

            // Create view for easier query
            let sql_view = "CREATE VIEW ?? AS SELECT stu.email, reg.teacher_id FROM ?? AS stu JOIN ?? AS reg ON (stu.id = reg.student_id) WHERE stu.suspended != 1";
            let inserts = ['vw_stu_reg', 'student', 'registration'];
            sql_view = connection.format(sql_view, inserts);
            connection.query(sql_view);

            // Main query
            let sql = "SELECT email FROM ?? WHERE teacher_id = (SELECT id FROM ?? WHERE email = ?)";
            inserts = ['vw_stu_reg', 'teacher', arrEmail[0]];
            sql = connection.format(sql, inserts);

            // initialize variable out of for loop
            let sql_filter = '';

            for(let i=1; i<arrEmail.length; i++) {
                // filter string
                sql_filter = " AND email IN (SELECT email FROM ?? WHERE teacher_id = (SELECT id FROM ?? WHERE email = ?))";
                inserts = ['vw_stu_reg', 'teacher', arrEmail[i]];
                sql_filter = connection.format(sql_filter, inserts);

                sql += sql_filter;
            }

            connection.query(sql, (err, res) => {

                // Drop view 
                let drop = "DROP VIEW vw_stu_reg";
                connection.query(drop);

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

    suspend_student(email) {
        return new Promise((resolve, reject) => {
            let sql = "UPDATE ?? SET suspended = 1 WHERE email = ? LIMIT 1"
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

    get_registered_student(email) {
        return new Promise((resolve, reject) => {
            let sql = "SELECT stu.email FROM ?? AS stu, ?? AS reg, ?? AS tea ";
            sql += "WHERE stu.id = reg.student_id AND reg.teacher_id = tea.id AND tea.email = ?";
            let inserts = ['student', 'registration', 'teacher', email];
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
}

module.exports = Teacher;