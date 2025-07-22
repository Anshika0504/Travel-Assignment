const express = require('express');
const app = express();
const path = require('path');
const router = require('./routes/router');
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

app.use('/details', router);

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});
