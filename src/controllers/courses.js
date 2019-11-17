const Course = require("../models/Course");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Bootcamp = require("../models/Bootcamp");

// @desc        get courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  const populate = { path: "bootcamp", select: "name description" };
  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId }).populate(populate);
  } else {
    query = Course.find().populate(populate);
  }
  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc        get single course
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc        get single course
// @route       POST /api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.bootcampId;
  req.body.bootcamp = id;

  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(new ErrorResponse(`No bootcamp with id ${id}`));
  }

  const course = await Course.create(req.body);

  // res.status(200)
  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc        update course
// @route       PUT /api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  let course = await Course.findById(id);
  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${id}`, 404));
  }

  course = await Course.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc        delete course
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const course = await Course.findById(id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${id}`, 404));
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
