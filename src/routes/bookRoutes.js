import express from "express";
import Book from "../models/Book.js";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, ratings, image } = req.body;
    //check if any of them is not provided
    if (!title || !caption || !ratings || !image) {
      return res.status(400).json({ error: "All fields are required!" });
    }
    //upload image
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    //save to db
    const newBook = new Book({
      title,
      caption,
      ratings,
      image: imageUrl,
      author: req.user._id,
    });
    await newBook.save();
    res.status(201).json({ newBook });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error!" });
    console.error(error);
  }
});

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .populate("author", "username email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBooks = await Book.countDocuments();

    res.send({
      books,
      totalBooks,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error!" });
    console.error(error);
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found!" });
    }
    if (book.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this book!" });
    }

    //delete image from cloudinary as well
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error(deleteError);
      }
    }

    await book.deleteOne();
    res.json({ message: "Book deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error!" });
    console.error(error);
  }
});

//get the books published by current logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ author: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ books });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error!" });
    console.error(error);
  }
});

export default router;
