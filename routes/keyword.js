const express = require('express');
const router = express.Router();
const {testing} = require('../controller/keyword')
router.route('/:Id').get(testing);
module.exports = router