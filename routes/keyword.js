const express = require('express');
const router = express.Router();
const {testing,getVideo,insertVideo,insertKey} = require('../controller/keyword')
router.route('/:Id').get(getVideo).post(insertVideo);
router.route('/key/:Id').post(insertKey);
module.exports = router