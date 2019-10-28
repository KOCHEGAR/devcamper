const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require(`../config/db`);

// Route files
const bootcamps = require(`../src/routes/bootcamps`);

// load env vars
dotenv.config({ path: `${process.cwd()}/config/config.env` });

connectDB();

const app = express();

// Dev logger middlevare
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode in port:${PORT}`.white
      .bgGreen
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error ${err.message}`.red);
  // close server and exit process
  server.close(() => process.exit(1));
});
