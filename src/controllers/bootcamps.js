const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const geocoder = require("../utils/geocoder");
// const queryFiltering = require("../utils/complexFiltering");

// @desc        get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.filteredResults);
});

// @desc        get single bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc            create new bootcamp
// @route           POST /api/v1/bootcamps/
// @access          Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`You cannot publish more than one bootcamp`, 400)
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc            update bootcamp
// @route           PUT /api/v1/bootcamps/:id
// @access          Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  console.log("1");
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  console.log("2");

  // check ownership
  if (!bootcamp.checkOwnership(req.user.id) && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`You are not authorized to update bootcamp`, 403)
    );
  }
  console.log("3");

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    context: "query"
  });
  console.log("4");

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc            delete bootcamp
// @route           POST /api/v1/bootcamps/:id
// @access          Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // check ownership
  if (!bootcamp.checkOwnership(req.user.id) && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`You are not authorized to delete bootcamp`, 403)
    );
  }

  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc            get bootcamps within radius
// @route           POST /api/v1/bootcamps/radius/:zipcode/:distance
// @access          Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // divide distance by radius of earth. Earth radius 3963 miles
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

exports.bootcampUploadPhoto = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const files = req.files;

  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));
  }

  if (!bootcamp.checkOwnership(req.user.id) && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`You are not authorized to update bootcamp`, 403)
    );
  }

  console.log(files);

  if (!(files && files.file && files.file.mimetype.startsWith("image/"))) {
    return next(new ErrorResponse("Please, upload an image file", 400));
  }
  const file = files.file;

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please, upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`,
        400
      )
    );
  }

  // Custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log("Something went wrong while processing an image ", err);
      return next(
        new ErrorResponse("Something went wrong while processing an image", 500)
      );
    }

    await Bootcamp.findByIdAndUpdate(id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
