const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    console.log(`MongoDB connected to: ${conn.connection.host}`.green.bold.underline);
  } catch (error) {
    console.error('ERROR!!');
    console.error(`${error['reason'] || error}`.bgRed);
  }
};

module.exports = connectDB;
