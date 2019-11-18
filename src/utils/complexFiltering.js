const bootstrapFilters = async function(
  requestQuery,
  mongooseModel,
  populate,
  defaultFieldToSortBy = "-createdAt"
) {
  const reqQuery = { ...requestQuery };

  const fieldsToRemove = ["select", "sort", "page", "limit"];

  let fieldsToSelectInDocument = "";
  let sortDocumentsByFields = defaultFieldToSortBy;

  // remove fields that don't need to be processed by mongo
  fieldsToRemove.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);

  // transform to valid mongo filters for further processing
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  if (requestQuery.select) {
    fieldsToSelectInDocument = requestQuery.select.split(",").join(" ");
  }

  if (requestQuery.sort) {
    sortDocumentsByFields = requestQuery.sort.split(",").join(" ");
  }

  // pagination
  const page = parseInt(requestQuery.page, 10) || 1;
  const limit = parseInt(requestQuery.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = limit * page;

  const totalOfDocuments = await mongooseModel.countDocuments();

  let query = mongooseModel
    .find(JSON.parse(queryStr))
    .select(fieldsToSelectInDocument)
    .sort(sortDocumentsByFields)
    .skip(startIndex)
    .limit(limit)
    .populate(populate);

  // if (populate) {
  //   query = query.populate(populate);
  // }

  const pagination = {
    next: endIndex < totalOfDocuments ? page + 1 : -1,
    prev: startIndex > 0 ? page - 1 : -1,
    limit
  };

  return {
    query,
    pagination
  };
};

module.exports = bootstrapFilters;
