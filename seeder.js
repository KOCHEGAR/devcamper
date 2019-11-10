const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");

dotenv.config({ path: "./config/config.env" });

const Bootcamp = require("./src/models/Bootcamp");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    console.log(
      `MongoDB connected to: ${conn.connection.host}`.green.bold.underline
    );
  } catch (error) {
    console.error("ERROR!!");
    console.error(`${error["reason"] || error}`.bgRed);
  }
};
connectDB();

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

// import to DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log("Data imported...".green.underline);
    process.exit();
  } catch (e) {
    console.error(e);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log("Data destroyed...".green.underline);
    process.exit();
  } catch (e) {
    console.error(e);
  }
};

const arg = process.argv[2];
if (arg === "-i") {
  importData();
} else if (arg === "-d") {
  deleteData();
}
