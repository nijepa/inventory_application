require('dotenv').config();
const Category = require('../models/category');
const Item = require('../models/item');
const validator = require("express-validator");
const SECRET_PASS_MODIFY = process.env.SECRET_PASS;

// Display list of all category.
exports.category_list = async (req, res, next) => {
  try {
    const list_categories = await Category.find().exec();
    const items = await Promise.all(list_categories.map(category => Item.find({ category: category }).exec()));
    res.render("category_list", { title: "Category List", items: items, category_list: list_categories });
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific category.
exports.category_detail = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    const category_items = await Item.find({ category: req.params.id }).exec();
    res.render("category_detail", { title: 'Category Detail', category: category, category_items: category_items });
  } catch (err) {
    return next(err);
  }
};

// Display category create form on GET.
exports.category_create_get = async (req, res, next) => {     
  try {
    const categories = await Category.find().exec();
    res.render("category_form", { title: "Create category", categories: categories });
  } catch (err) {
    return next(err);
  }
};

// Handle category create on POST.
exports.category_create_post =  [
  // Validate and sanitize category
  validator.body("name", "Category name required").trim().isLength({ min: 1 }).escape(),
  async (req, res, next) => {
    const errors = validator.validationResult(req);
    const categories = await Category.find().exec();
    const category = new Category({ name: req.body.name });
    if (!errors.isEmpty()) {
      res.render("category_form", { title: "Create Category", category: category, categories: categories, errors: errors.array() });
    } else {
      try {
        // Check if Category with same name already exists
        const result = await Category.findOne({ name: req.body.name }).exec();
        if (result) {
          res.redirect(result.url);
        } else {
          // Category saved. Redirect to category detail page
          const newCategory = await category.save();
          res.redirect(newCategory.url);
        }
      } catch (err) {
          return next(err);
      }
    }
  }
];

// Display category delete form on GET.
exports.category_delete_get = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    const categories_items = await Item.find({ category: req.params.id });
    res.render("category_delete", { title: `Delete Category`, category_items: categories_items, category: category });
  } catch (err) {
    return next(err);
  }
};

// Handle category delete on POST.
exports.category_delete_post =  [
  validator.body("password", "Wrong password!").notEmpty().custom(value => value === SECRET_PASS_MODIFY),
  async (req, res, next) => {
    try {
      const categories = await Category.find().exec();
      const category = await Category.findById(req.body.categoryid);
      const categories_items = await Item.find({ category: req.body.categoryid });
      if (categories_items.length > 0) {
        // Category has items
        res.render("category_delete", { title: `Delete Category`, category_items: categories_items, category: category, categories: categories });
      } else if (!validator.validationResult(req).isEmpty()) {
          res.render("category_delete", { title: `Delete Category`, category_items: categories_items, error: true, category: category, categories: categories });
      } else {
        // Category has no items. Delete object and redirect to the list of categories.
        await Category.findByIdAndRemove(req.body.categoryid);
        res.redirect("/inventory/categories");
      }
    } catch (err) {
      return next(err);
    }
  }
];

// Display category update form on GET.
exports.category_update_get = async (req, res, next) => {
  try {
    // Get category for form
    const category = await Category.findById(req.params.id);
    res.render("category_form", { title: "Update Category", category: category, edit: true });
  } catch (err) {
    return next(err);
  }
};

// Handle category update on POST.
exports.category_update_post = [
  // Validate and sanitize fields
  validator.body("password", "Wrong password!").notEmpty().custom(value => value === SECRET_PASS_MODIFY),
  validator.body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const errors = validator.validationResult(req);
    const category = new Category({ name: req.body.name, description: req.body.description, _id: req.params.id });
    if (!errors.isEmpty()) {
      res.render("category_form", { title: "Update Category", category: category, errors: errors.array(), edit: true });
    } else {
      // Process request after validation and sanitization
      try {
        const result = await Category.findByIdAndUpdate(req.params.id, category).exec();
        res.redirect(result.url);
      } catch (err) {
        return next(err);
      }
    }
  }
];