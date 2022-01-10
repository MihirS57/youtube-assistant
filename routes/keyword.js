const express = require('express');
const router = express.Router();
const {testing,getVideo,getTopResults,insertVideo,insertKey} = require('../controller/keyword')
router.route('/:Id').get(getVideo).post(insertVideo);
router.route('/key/:Id').post(insertKey).get(getTopResults);
module.exports = router