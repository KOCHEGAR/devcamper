const express = require("express");
const {
  getCourses,
  getCourse,
  createCourse,
  deleteCourse,
  updateCourse,
  getCoursesForBootcamp
} = require("../controllers/courses");

const { protectRoute, authorizeUser } = require("../middleware/auth");
const filterResults = require("../middleware/advanceFiltering");
const Course = require("../models/Course");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getCoursesForBootcamp, filterResults(Course), getCourses)
  .post(protectRoute, authorizeUser("publisher", "admin"), createCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protectRoute, authorizeUser("publisher", "admin"), updateCourse)
  .delete(protectRoute, authorizeUser("publisher", "admin"), deleteCourse);

module.exports = router;
