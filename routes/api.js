const Router = require('express').Router;

const ApiRouter = (regModel, teaModel, stuModel) => {

    const {Registration} = regModel;
    const {Teacher} = teaModel;
    const {Student} = stuModel;
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
    
        // Initialize objects
        let teacher = new Teacher();
        let student = new Student();
        let reg = new Registration();

        // Data from request
        let teacher_email = req.body.teacher;
        let students_email = req.body.students;

        if(teacher_email == undefined || teacher_email == '')
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty teacher email."
            })

        if(students_email == undefined || students_email == '')
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty students email array"
            })

        // Get teacher_id
        let teacher_id = 0;
        let rsTeacher = await teacher.get_teacher_by_email(teacher_email);
        
        if(rsTeacher['Status'] == 'Success') {
            if(rsTeacher['Data'] != '') {
                teacher_id = rsTeacher['Data'][0]['id'];
            } else {
                // Add teacher when not found
                let rs = await teacher.add_teacher(teacher_email);
                
                if(rs['Status'] == 'Success')
                    teacher_id = rs['Data'];
                else 
                    res.send(rs);
            }
        } else 
            res.send(rsTeacher);

        // Find and add student
        let student_id = 0;

        for(let i=0; i<students_email.length; i++) {    
            let rsStudent = await student.get_student_by_email(students_email[i]);
            
            if(rsStudent['Status'] == 'Success') {
                if(rsStudent['Data'] != '') {
                    student_id = rsStudent['Data'][0]['id'];
                } else {
                    // Add teacher when not found
                    let rs = await student.add_student(students_email[i]);

                    if(rs['Status'] == 'Success')
                        student_id = rs['Data'];
                    else 
                        res.send(rs);
                }
            } else 
                res.send(rsStudent); // Send error message


            let result = await reg.add_registration(teacher_id, student_id);
            if(result['Status'] == "Fail") {
                res.send(result);
                break;
            }
        }

        res.send(204); 
    });

    /*
    * Funtion: Suspend student
    * Description: Suspend student based on email 
    * Route: POST /api/suspend
    * Param: {"student": student@email.com}
    * Return: 204 if success, else error message.
    */
    router.post('/suspend', async function(req, res, next) {

        let teacher = new Teacher();
        
        if(req.body.student == undefined || req.body.student == '')
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty student email."
            });

        let rs = await teacher.suspend_student(req.body.student);

        if(rs['Status'] == "Fail") {
            res.status(500).send({
                "Status": "Fail",
                "Message": rs['Message']
            })
        }
        else {
            if(rs['Data'] == 0) {
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
        
        let teacher = new Teacher();

        let teacher_email = req.body.teacher;
        let message = req.body.notification;

        if(teacher_email == undefined || teacher_email == '')
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty teacher email."
            })

        if(message == undefined || message == '')
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty notification string."
            })

        // Get registered student
        let registered_student = await teacher.get_registered_student(teacher_email);
        if(registered_student['Status'] == "Fail")
            res.status(400).send({
                "Status": "Fail",
                "Message": registered_student['Message']
            })
        
        // Get student being @mentioned
        let arrStudent = [];
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

        for (row of registered_student['Data']) {
            arrStudent.push(row.email);
        }

        res.send({
            "recipient": arrStudent
        });
    })



    /**         GET METHOD            **/

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
        let teacher = new Teacher();
        let student = new Student();

        if(req.query.teacher == undefined)
            res.status(400).send({
                "Status": "Fail",
                "Message": "Empty teacher array"
            })

        let rs = await teacher.get_common_students(req.query.teacher)

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
        }

        
    })
    

    return router;
}

module.exports = ApiRouter;
