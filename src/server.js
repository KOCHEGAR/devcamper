const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require(`../config/db`);
const errorHandler = require('./middleware/error');

// load env vars
dotenv.config({ path: `${process.cwd()}/config/config.env` });

// Route files
const bootcampRoutes = require(`../src/routes/bootcamps`);

connectDB();

const app = express();
// body-parser
app.use(express.json());

// Dev logger middlevare
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// url mappings
app.use('/api/v1/bootcamps', bootcampRoutes);

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode in port:${PORT}`.green.bold.underline
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error ${err.message}`.red);
  // close server and exit process
  server.close(() => process.exit(1));
});
