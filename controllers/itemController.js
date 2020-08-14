const Item = require('../models/item');
const Category = require('../models/category');
const validator = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const filePath = "public/uploads/";
const upload = multer({ dest: filePath });
const SECRET_PASS_MODIFY = process.env.SECRET_PASS;

exports.index = async (req, res, next) => { 
	const item_count = await Item.countDocuments({});
	const category_count = await Category.countDocuments({});
	let results = {};
	try {
		results = {item_count, category_count}; 
	} catch (err) {
		return next(err);
	}
	res.render('index', { title: 'Inventory Home', data: results });
};

// Display list of all Items.
exports.item_list = async (req, res, next) => {
  try {
    const list_items = await Item.find().sort([['name', 'ascending']]).exec();
    res.render("item_list", { title: "Item List", item_list: list_items });
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific item.
exports.item_detail = async (req, res, next) => {
	try {
		const categories = await Category.find().exec();
		const item = await Item.findById(req.params.id)
			.populate("category")
			.exec();
		res.render("item_detail", { title: item.name, item: item, categories: categories });
	} catch (err) {
		return next(err);
	}
};

// Display item create form on GET.
exports.item_create_get = async (req, res, next) => { 
	try {
		const categories = await Category.find().exec();
		res.render("item_form", { title: "Create Item", categories: categories });
	} catch (err) {
		return next(err);
	}
};

// Handle item create on POST.
exports.item_create_post = [
	upload.single("image"),
	// Validate and sanitize fields
  validator.body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  validator.body("description", "Description must not be empty.").trim().isLength({ min: 1 }).escape(),
  validator.body("price", "Price must be decimal number and not be empty.").trim().isDecimal().escape(),
  validator.body("numberInStock", "Stock must be an integer and not be empty.").trim().isInt().escape(),

	async (req, res, next) => {
		const errors = validator.validationResult(req);
		// Convert the categories to an array.
		if(!(req.body.category instanceof Array)){
			if(typeof req.body.category==='undefined')
				req.body.category=[];
			else
				req.body.category=new Array(req.body.category);
		}

		const categories = await Category.find().exec();
		const item = new Item({
			category: req.body.category,
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
			numberInStock: req.body.numberInStock,
			image: req.file?.filename
		});
		if (!errors.isEmpty()) {
			// Mark our selected categories as checked.
			for (let i = 0; i < results.categories.length; i++) {
				if (item.category.indexOf(results.categories[i]._id) > -1) {
					results.categories[i].checked='true';
				}
			}
			res.render("item_form", { title: "Create Item", item: item, categories: categories, errors: errors.array() });
		} else {
			try {
				const result = await Item.findOne({ name: req.body.name }).exec();
				if (result) {
					res.redirect(result.url);
				} else {
					const newItem = await item.save();
					res.redirect(newItem.url);
				}
			} catch (err) {
				return next(err);
			}
		}
  }
];

// Display item delete form on GET.
exports.item_delete_get = async (req, res, next) => {
	try {
		const item = await Item.findById(req.params.id);
		res.render("item_delete", { title: `Delete Item`, item: item });
	} catch (err) {
		return next(err);
	}
};

// Handle item delete on POST.
exports.item_delete_post = [
	validator.body("password", "Wrong password!").notEmpty().custom(value => value === SECRET_PASS_MODIFY),

	async (req, res, next) => {
		try {
			if (!validator.validationResult(req).isEmpty()) {
				const categories = await Category.find().exec();
				const item = await Item.findById(req.params.id);
				res.render("item_delete", { title: `Delete Item`, item: item, categories: categories, error: true });
			} else {
				const item = await Item.findById(req.body.itemid);
				if (item.image) {
					fs.unlink(filePath + item.image, err => {
						if (err) { return next(err); }
					});
				}
				await item.remove();
				res.redirect("/inventory/items");
			}
		} catch (err) {
			return next(err);
		}
	}
];

// Display item update form on GET.
exports.item_update_get = async (req, res, next) => {
	try {
		const categories = await Category.find().exec();
		const item = await Item.findById(req.params.id)
			.populate("category")
			.exec();
		// Mark our selected categories as checked.
		for (var all_g_iter = 0; all_g_iter < categories.length; all_g_iter++) {
			for (var item_g_iter = 0; item_g_iter < item.category.length; item_g_iter++) {
				if (categories[all_g_iter]._id.toString()==item.category[item_g_iter]._id.toString()) {
					categories[all_g_iter].checked='true';
				}
			}
		}
		res.render("item_form", { title: `Update Item`, categories: categories, item: item, edit: true });
	} catch (err) {
		return next(err);
	}
};

// Handle item update on POST.
exports.item_update_post = [
	upload.single("image"),
	validator.body("password", "Wrong password!").notEmpty().custom(value => value === SECRET_PASS_MODIFY),
	validator.body("name", "Item must not be empty.").trim().isLength({ min: 1 }),
	validator.body("description", "Description must not be empty.").trim().isLength({ min: 1 }),
	validator.body("price", "Price must be a decimal number and not be empty.").trim().isDecimal(),
	validator.body("numberInStock", "Stock must be an integer and not be empty.").trim().isInt(),
	validator.body("*").escape(),

	async (req, res, next) => {
		const errors = validator.validationResult(req);
		const categories = await Category.find().exec();
		const currentItem = await Item.findById(req.params.id);
		if (req.file && req.file.filename !== currentItem.image) {
			fs.unlink(filePath + currentItem.image, err => {
				if (err) { return next(err); }
			});
		}
		const item = new Item({
			category: req.body.category,
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
			numberInStock: req.body.numberInStock,
			_id: req.params.id,
			image: req.file?.filename || currentItem.image
		});
		if (!errors.isEmpty()) {
			if (req.file) {
				fs.unlink(filePath + req.file.filename, err => {
					if (err) {
						return next(err);
					}
				});
			}
			// Mark our selected genres as checked.
			for (let i = 0; i < categories.length; i++) {
				if (item.category.indexOf(categories[i]._id) > -1) {
					categories[i].checked='true';
				}
			}
			res.render("item_form", { title: `Edit Item`, item: item, categories: categories, edit: true, errors: errors.array() });
		} else {
			try {
				const result = await Item.findByIdAndUpdate(req.params.id, item);
				res.redirect(result.url);
			} catch (err) {
				return next(err);
			}
		}
	}
];