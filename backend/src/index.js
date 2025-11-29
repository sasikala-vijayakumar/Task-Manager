// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));

// Example protected route using roleCheck
const auth = require('./middleware/auth');
const roleCheck = require('./middleware/roleCheck');

app.get('/api/admin-only', auth, roleCheck(['admin']), (req, res) => {
  res.json({ msg: 'hello admin' });
});

app.get('/api/teamlead-or-admin', auth, roleCheck(['teamlead']), (req, res) => {
  res.json({ msg: 'teamlead or admin allowed' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
