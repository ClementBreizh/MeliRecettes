const express = require("express");
const Recipe = require("../models/recipe");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "impage/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Type de fichier invalide");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, resp, next) => {
    const url = req.protocol + "://" + req.get("host");
    const recipe = new Recipe({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId,
    });
    recipe.save().then((createdRecipe) => {
      resp.status(201).json({
        message: "Recipe added success",
        recipe: {
          id: createdRecipe.id,
          title: createdRecipe.title,
          content: createdRecipe.content,
          imagePath: createdRecipe.imagePath,
        },
      });
    });
  }
);

router.get("", checkAuth, (req, resp, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const recipeQuery = Recipe.find();
  let fetchedRecipes;
  // mise en place de la pagination
  if (pageSize && currentPage) {
    recipeQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  //
  recipeQuery
    .then((documents) => {
      fetchedRecipes = documents;
      return Recipe.count();
    })
    .then((count) => {
      resp.status(200).json({
        message: "Recipes fetched succes",
        recipes: fetchedRecipes,
        maxRecipes: count,
      });
    });
});

router.get("/:id", checkAuth, (req, resp, next) => {
  Recipe.findById(req.params.id).then((recipe) => {
    if (recipe) {
      resp.status(200).json({
        message: "Recipe found",
        recipe: {
          //...recipe,
          id: recipe._id,
          title: recipe.title,
          content: recipe.content,
          imagePath: recipe.imagePath,
        },
      });
    } else {
      resp.status(404).json({ message: "Recipes not found" });
    }
  });
});

router.delete("/:id", checkAuth, (req, resp, next) => {
  Recipe.deleteOne( { _id: req.params.id, creator: req.userData.userId }
  ).then((result) => {
    if (result.n > 0) {
      resp.status(200).json({
        message: "Recipes delete succes",
      });
    } else {
      resp.status(401).json({
        message: "Not authorization to delete Recipes ",
      });
    }
  });
});

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, resp, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const recipe = new Recipe({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId
    });
    Recipe.updateOne(
      { _id: req.params.id, creator: req.userData.userId },
      recipe
    ).then((result) => {
      if (result.nModified > 0) {
        resp.status(200).json({
          message: "Recipes update succes",
        });
      } else {
        resp.status(401).json({
          message: "Not authorization to update Recipes ",
        });
      }
    });
  }
);

module.exports = router;
