var express = require('express');
var router = express.Router();
var multer  = require('multer')
var upload = multer({ dest: './public/images/' })

// Require controller modules.
var item_controller = require('../controllers/itemController');
var category_controller = require('../controllers/categoryController');

/// ITEM ROUTES ///

// GET inventory home page.
router.get('/', item_controller.index);

// GET request for creating a Item. NOTE This must come before routes that display Item (uses id).
router.get('/item/create', item_controller.item_create_get);

// POST request for creating Item.
router.post('/item/create', item_controller.item_create_post);

// GET request to delete Item.
router.get('/item/:id/delete', item_controller.item_delete_get);

// POST request to delete Item.
router.post('/item/:id/delete', item_controller.item_delete_post);

// GET request to update Item.
router.get('/item/:id/update', item_controller.item_update_get);

// POST request to update Item.
router.post('/item/:id/update', item_controller.item_update_post);

// GET request for one Item.
router.get('/item/:id', item_controller.item_detail);

// GET request for list of all Item.
router.get('/items', item_controller.item_list);

/// CATEGORY ROUTES ///

// GET request for creating a Category. NOTE This must come before route that displays Category (uses id).
router.get('/category/create', category_controller.category_create_get);

//POST request for creating category.
router.post('/category/create', category_controller.category_create_post);

// GET request to delete category.
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete category.
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update category.
router.get('/category/:id/update', category_controller.category_update_get);

// POST request to update category.
router.post('/category/:id/update', category_controller.category_update_post);

// GET request for one category.
router.get('/category/:id', category_controller.category_detail);

// GET request for list of all category.
router.get('/categories', category_controller.category_list);


module.exports = router;
