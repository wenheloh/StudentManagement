const Router = require('express').Router;

const ApiRouter = (Registration, Teacher, Student) => {

    const router = new Router();


    /**         POST METHOD            **/

    /*
    * Funtion: Add Register
    * Description: Add teacher or student if user doesn't exist
    * Route: POST /api/register
    * Param: {teacher_email, [student_email1, student_email2, ...]}
    * Return: 204 if success, else error message.
    */
    router.post('/register', async function(req, res, next) {
    
        let bResult = true;

        // Data from request
        let teacher_email = req.body.teacher;
        let students_email = req.body.students;

        if(teacher_email == undefined || teacher_email == '') {
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty teacher email."
            })

            bResult = fasle;
        } else if(students_email == undefined || students_email == '') {
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty students email array"
            })

            bResult = false;
        }

        if(bResult) {
            // Get teacher_id

            let [rsTeacher, created] = await Teacher.findOrCreate({
                where: {email: teacher_email}, 
                defaults: {email: teacher_email}
            });
            
            let teacher_id = rsTeacher.get().id;

            // Find and add student
            let student_id = 0;
            let sErrorMsg = [];

            for(let i=0; i<students_email.length; i++) {   
                
                let [rsStudent, created] = await Student.findOrCreate({
                    attributes: ['id', 'suspended'],
                    where: {email: students_email[i]}, 
                    defaults: {email: students_email[i]}
                });
                
                student_id = rsStudent.get().id;

                if(!created) {
                    // Should the system unsuspend suspended student? 
                }
                
                try {
                    await Registration.create({
                        TeacherId: teacher_id,
                        StudentId: student_id
                    })
                } catch(err) {
                    if(err.name == 'SequelizeUniqueConstraintError')
                        sErrorMsg.push("Duplicate entry for student: " + students_email[i])
                    
                    bResult = false;
                }
            }

            if(sErrorMsg != '') {
                res.send({
                    "Status": "Fail",
                    "Message": sErrorMsg
                })
            }
        }

        if(bResult)
            res.status(204).send(); 
    });

    /*
    * Funtion: Suspend student
    * Description: Suspend student based on email 
    * Route: POST /api/suspend
    * Param: {"student": student@email.com}
    * Return: 204 if success, else error message.
    */
    router.post('/suspend', async function(req, res, next) {

        let bResult = true;
        
        if(req.body.student == undefined || req.body.student == '') {
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty student email."
            });

            bResult = false;
        }
            
        if(bResult) {
            let rs = await Student.update(
                { suspended: '1' },
                { where: {email: req.body.student }}    
            )

            if(rs[0] == 0) {
                res.status(400).send({
                    "Status": "Fail",
                    "Message": "No student has been updated, please make sure the email is correct."
                })
            } else {
                res.status(204).send();
            }
        }
        
    })

    /*
    * Funtion: Get ID for notification
    * Description: Get student id to send notification to
    * Route: POST /api/retrievefornotification
    * Param: {"teacher": teacheremail, "notification": message}
    * Return: {"recipient": [email1, email2, ...]}
    */
    router.post('/retrievefornotifications', async function(req, res, next) {
        
        let bResult = true;

        let teacher_email = req.body.teacher;
        let message = req.body.notification;

        if(teacher_email == undefined || teacher_email == '') {
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty teacher email."
            })

            bResult = false;
        } else if(message == undefined || message == '') {
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty notification string."
            })

            bResult = false;
        }
            
        if(bResult) {
            // Get registered student
            let arrStudent = [];

            let registered_student = await Student.findAll( {
                include: [{
                    includeIgnoreAttributes: false,
                    model: Teacher,
                    through: {
                        model: Registration
                    },
                    where: {email: teacher_email}
                }],
                attributes: ['email'],
                where: {suspended: 0}
            } )

            if(registered_student != '') {
                for (student of registered_student) {
                    arrStudent.push(student.email);
                }
            }
            
            // Get student being @mentioned
            message = message + " "; // Add space to end to make sure the algo below works.

            const search = (arrStudent, message, student_email) => {
                if(message.indexOf("@") > -1) {
                    message = message.substr(message.indexOf("@") + 1);
                    student_email = message.substr(0, message.indexOf(" "));
                    arrStudent.push(student_email);

                    // Remove the pushed email, get the left of the string
                    message = message.substr(message.indexOf(" ") + 1);
                    
                    search(arrStudent, message, '');
                }
            }
            search(arrStudent, message, '');

            res.send({
                "recipient": arrStudent
            });
            
        }
    })





    /*************         GET METHOD      *****************/

    /*
    * Funtion: Find common students
    * Description: Find common student among the given teacher
    * Route: GET /api/commonstudents
    * Param: {[teacher1, teacher2, ...]}
    * Return: {[student1, student2]}
    */
    router.get('/commonstudents', async function(req, res, next) {

        // Eg: ["teacherjohn@example.com","teacherjohn3@example.com"]
        
        // Initialize objects
        let bResult = true;

        if(req.query.teacher == undefined) {
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty teacher array"
            })

            bResult = false;
        }
            
        if(bResult) {
            if(typeof(req.query.teacher) == 'object') {
                let arrStudent = [];
                let arrStudentNew = [];
                let rs = '';

                for (teacher of req.query.teacher) { 
                    rs = await Student.findAll({
                        includeIgnoreAttributes: false,
                        include: [{
                            model: Teacher,
                            through: {
                                model: Registration
                            },
                            where: {email: teacher}
                        }],
                        attributes: ['email'],
                        where: {
                            suspended: 0
                        }
                    })

                    
                    if(rs.length != 0) {
                        if(arrStudent == '') {
                            // First email, first array, to be filtered later
                            for (student of rs) {
                                arrStudent.push(student.email);
                            }
                        } else {
                            arrStudentNew = [];
                            
                            for (student of rs) {
                                arrStudentNew.push(student.email);
                            }
    
                            arrStudent = arrStudent.filter(value => arrStudentNew.includes(value));
                        }
                    } else {
                        // One of the teacher has 0 student registered.
                        arrStudent = [];
                        break;
                    }
                }

                res.send({
                    "students": arrStudent
                })
            } else {
                let rs = await Student.findAll({
                    includeIgnoreAttributes: false,
                    include: [{
                        model: Teacher,
                        through: {
                            model: Registration
                        },
                        where: {email: req.query.teacher}
                    }],
                    attributes: ['email'],
                    where: {
                        suspended: 0
                    }
                })

                // Format data before send
                let arrStudent = [];
                for (student of rs) {
                    arrStudent.push(student.email);
                }

                res.send({
                    "students": arrStudent
                })
            }
            

            /* let rs = await teacher.get_common_students(req.query.teacher)

            if(rs['Status'] == 'Fail') {
                res.status(500).send({
                    "Status": "Fail",
                    "Message": rs['Message']
                })
            } else {
                // Format data before response
                let arrStudent = [];
                for (row of rs['Data']) {
                    arrStudent.push(row.email);
                }
    
                res.send(arrStudent);
            } */
        }
    })
    

    return router;
}

module.exports = ApiRouter;
