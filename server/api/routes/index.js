const express = require('express');
const user = require('./user');
const admin = require('./admin');
const doctor = require('./doctor');
const router = express.Router();

router.use('/user', user)
router.use('/admin', admin)
router.use('/doctor', doctor)
router.options('*', (req, res) =>
{
    return res.send(204).send({})
})

module.exports = router;