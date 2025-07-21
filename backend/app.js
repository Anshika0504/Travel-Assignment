const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const router = require('./routes/router');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/details', router);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
