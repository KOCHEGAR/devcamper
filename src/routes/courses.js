const express = require("express");
const {
  getCourses,
  getCourse,
  createCourse,
  deleteCourse,
  updateCourse,
  getCoursesForBootcamp
} = require("../controllers/courses");
const filterResults = require("../middleware/advanceFiltering");
const Course = require("../models/Course");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getCoursesForBootcamp, filterResults(Course), getCourses)
  .post(createCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;
