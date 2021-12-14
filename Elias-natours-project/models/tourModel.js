const mongoose = require("mongoose");
const slugify = require("slugify");
// const User = require("./userModel");
const validator = require("validator");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      maxLength: [40, "A tour name cant have more than 40 characters"],
      minLength: [10, "A name must have at least 10 characters"],
      // validate: [validator.isAlpha, "Only letters for the name"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating is at least 1"],
      max: [5, "rating is at max 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: function (val) {
        return val < this.price;
      },
      message: "Discount {VALUE} cant be greater than the price",
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover images"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    secretTour: {
      type: Boolean,
      default: false,
    },
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//VIRTUAL populate for showing the child (has parent refs) where the parent does NOT have reference to them
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// tourSchema.virtual("durationWeeks").get(function () {
//   return this.duration / 7;
// });

//DOC MIDDLEWARE: runs before on .save and .create ONLY
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//this is how we embed. We retrive the users, find their info and embed it inside
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre("save", function (next) {
//   console.log("will save doc...");
//   next();
// });

// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(Date.now() - this.start);
  next();
});

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
