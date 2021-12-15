const express = require('express');
const router = express.Router();
const {testing,getVideo,insertVideo} = require('../controller/keyword')
router.route('/:Id').get(getVideo).post(insertVideo);
module.exports = router