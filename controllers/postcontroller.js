const { body, validationResult } = require("express-validator");
const Post = require("../models/post");

// GET all blog posts
exports.all_posts_get = async (req, res, next) => {
  try {
    const posts = await Post.find({}).populate("author");
    if (!posts) {
      res.status(404).send({
        err: "no posts found",
      });
    }
    res.status(200).send({
      posts,
    });
  } catch (err) {
    next(err);
  }
};

// GET a single blog post
exports.one_post_get = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId).populate("author");

    if (!post) {
      res.status(404).send({
        err: "post not found",
      });
    }
    res.status(200).send({
      post,
    });
  } catch (err) {
    next(err);
  }
};

exports.one_post_delete = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    console.log(await post);
    res.status(200).send({
      success: true,
      message: "Post deleted.",
      id: post._id,
    });
  } catch (err) {
    res.status(404).send({
      success: false,
      message: "ID not found",
    });
  }
};

exports.one_post_patch = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.postId, {
      published: req.body.published,
    });
    if (post) {
      try {
        const updatedPost = await Post.findById(req.params.postId).populate(
          "author"
        );
        if (!updatedPost) {
          res.status(404).send({
            success: false,
            message: "no post found",
          });
        }
        res.status(200).send({
          success: true,
          updatedPost,
        });
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    res.status(404).send({
      success: false,
      error: err,
    });
  }
};

exports.one_post_put = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.postId, {
      _id: req.body._id,
      author: req.body.author,
      title: req.body.title,
      text: req.body.text,
      imgUrl: req.body.imgUrl,
      published: req.body.published,
      timestamp: req.body.timestamp,
    });
    console.log(post);
    return res.status(200).send({
      success: true,
      message: "Post updated",
    });
  } catch (err) {
    return res.status(123).send({
      success: false,
      error: err,
    });
  }
};

exports.user_posts_get = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId });

    // better to filter on backend or frontend?
    const published = posts.filter((post) => post.published);
    const unpublished = posts.filter((post) => !post.published);

    return res.status(200).send({
      success: true,
      posts: {
        published: published,
        unpublished: unpublished,
      },
    });
  } catch (err) {
    return res.status(401).send({
      success: false,
      error: err,
    });
  }
};

exports.create_post_post = [
  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Text must be specified."),
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title must be specified."),

  (req, res, next) => {
    console.log(req.body.author);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({
        success: false,
        errors: errors,
      });
    } else {
      const post = new Post({
        author: req.body.author,
        // comments: [],
        imgUrl: req.body.imgUrl,
        published: req.body.published,
        text: req.body.text,
        timestamp: new Date(),
        title: req.body.title,
      });

      console.log(post);

      post.save((err) => {
        console.log(err);
        if (err) {
          return next(err);
        }
        res.send({
          success: true,
          post: post,
        });
      });
    }
  },
];
