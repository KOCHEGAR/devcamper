const advanceFiltering = model => async (req, res, next) => {
  const reqQuery = { ...req.query };
  const fieldsToRemove = ["select", "sort", "page", "limit", "populate"];

  let fieldsToSelectInDocument = "";
  let sortDocumentsByFields = "-createdAt";
  const populate = req.query.populate || "";

  // remove fields that don't need to be processed by mongo
  fieldsToRemove.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);

  // transform to valid mongo filters for further processing
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  if (req.query.select) {
    fieldsToSelectInDocument = req.query.select.split(",").join(" ");
  }

  if (req.query.sort) {
    sortDocumentsByFields = req.query.sort.split(",").join(" ");
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = limit * page;

  const totalOfDocuments = await model.countDocuments();

  let resultObjects = await model
    .find(JSON.parse(queryStr))
    .select(fieldsToSelectInDocument)
    .sort(sortDocumentsByFields)
    .skip(startIndex)
    .limit(limit)
    .populate(populate);

  const pagination = {
    next: endIndex < totalOfDocuments ? page + 1 : -1,
    prev: startIndex > 0 ? page - 1 : -1,
    limit
  };

  res.filteredResults = {
    success: true,
    count: resultObjects.length,
    pagination,
    data: resultObjects
  };

  console.log("Query is ... ", req.query);
  // console.log("Result Objects is ...", resultObjects);
  next();
};

module.exports = advanceFiltering;
