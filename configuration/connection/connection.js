const mongose = require('mongoose');
const DB = process.env.DATABASE;
mongose.connect(DB)
  .then(() => {
    console.log('Database connection established Successfully');
  })
  .catch((error) => console.log('DATABASE connection error'));

