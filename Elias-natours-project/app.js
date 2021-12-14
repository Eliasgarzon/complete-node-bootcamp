const express = require("express");
const app = express();
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");

//GLOBAL MIDDLEWHERE
//set security HTTP headers
app.use(helmet());

//developmnet login
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//body parser
app.use(express.json({ limit: "10kb" }));

//data sanitization against NoSQL query injection
app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

//serving static files
app.use(express.static(`${__dirname}/public`));

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Limit request from same IP
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// this is how to serve static files
// app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

//any request here is only if any of the routes was not met

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on the server!`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on the server!`);
  // err.status = "fail";
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
