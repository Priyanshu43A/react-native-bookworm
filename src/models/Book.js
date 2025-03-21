import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 200,
    },
    caption: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 500,
    },
    ratings: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    image: {
      type: String,
      required: true,
      
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
