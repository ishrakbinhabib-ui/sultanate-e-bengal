'use strict';
const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
  res.json({
    categories: ['Mosque','Scholar','Historical Event','Movement','Manuscript',
                 'Architecture','Sufi Order','Dynasty','Cultural Practice'],
    eras: ['Medieval Bengal (8th-12th C.)','Bengal Sultanate (1338-1576)',
           'Mughal Period (1576-1757)','Colonial Period (1757-1947)',
           'Post-Independence (1947-1971)','Modern Bangladesh (1971-Present)']
  });
});

module.exports = router;
