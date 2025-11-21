export function NotFoundError(req, res, next) {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
}
export function handleEmptyResponse(req, res, next) {
  if (!res.locals.data) {
    res.status(404).json({ message: "Data not found" });
  } else {
    next();
  }
}
export function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err,
  });
}
