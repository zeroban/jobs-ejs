const express = require('express')
const router = express.Router()

const { getAllTires, createTire, getCreate, getTire, updateTire, deleteTire } = require('../controllers/jobs')

router.route('/')
    // GET /jobs (display all the job listings belonging to this user)
    .get(getAllTires)
    // POST /jobs (Add a new job listing)
    .post(createTire)


router.route('/new')
    // GET /jobs/new (Put up the form to create a new entry)
    .get(getCreate)


router.route('/edit/:id')
    // GET /jobs/edit/:id (Get a particular entry and show it in the edit box)
    .get(getTire)


router.route('/updateTire/:id')
    // POST /jobs/update/:id (Update a particular entry)
    .post(updateTire)


router.route('/delete/:id')
    // POST /jobs/delete/:id (Delete an entry)
    .post(deleteTire)


module.exports = router