const chai = require('chai');
const chaiHttp = require('chai-http');
/* const dotenv = require('dotenv');
dotenv.config(); */
const app = require('../bin/www');

chai.use(chaiHttp);
chai.should();

// 
describe("Register", () => {
    describe("POST /api/register", () => {
        // Test registration process
        it("Should register students to the specified teacher", (done) => {
            chai.request(app)
                .post('/api/register')
                .set("Content-Type", "application/json")
                .send({
                    "teacher": "teacherron@example.com", 
                    "students": ["studentTest@example.com", "studentTest3@example.com"]
                })
                .end((err, res) => {
                    //res.should.have.status(204);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                })
        })
    })
})


describe("Common Student", () => {
    describe("GET /api/commonstudents", () => {
        // Test retrieve common students process
        it("Should return list of students", (done) => {
            chai.request(app)
                .get('/api/commonstudents')
                .query("teacher=teacherjohn@example.com&teacher=teacherjohn3@example.com")
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('array')
                    done();
                })
        })
    })
})


describe("Suspend", () => {
    describe("POST /api/suspend", () => {
        // Test suspend process
        it("Should suspend a student", (done) => {
            chai.request(app)
                .post('/api/suspend')
                .send({
                    "student": "studentsde@example.com"
                })
                .end((err, res) => {
                    res.should.have.status(204)
                    done();
                })
        })
    })
})


describe("Recipients for Notification", () => {
    describe("POST /api/retrievefornotifications", () => {
        // Test get recipients list
        it("Should return a list of recipients", (done) => {
            chai.request(app)
                .post('/api/retrievefornotifications')
                .send({
                    'teacher': 'teacherjohn@example.com',
                    'notification': 'Hello students! @studentagnes@example.com @studentmiche@example.com'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                })
        })
    })
})