const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:3000', // or your frontend URL
  methods: ['GET', 'POST', 'DELETE'],
};

module.exports = cors(corsOptions);
