#! /usr/bin/env node

console.log('This script populates some test items and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var categories = []

function categoryCreate(name, cb) {
  var category = new Category({ name: name });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function itemCreate(name, price, description, numberInStock, category, cb) {
  itemdetail = { 
    name: name,
    price: price,
    description: description,
    numberInStock: numberInStock
  }
  if (category != false) itemdetail.category = category
    
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}

function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate("Monitor", callback);
        },
        function(callback) {
          categoryCreate("Mouse", callback);
        },
        function(callback) {
          categoryCreate("Keyboard", callback);
        },
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('AW3420DW', '1022.08', 'Alienware NEW Curved 34 Inch WQHD 3440 X 1440 120Hz, NVIDIA G-SYNC, IPS LED Edgelight, Monitor - Lunar Light, AW3420DW', 3, [categories[0],], callback);
        },
        function(callback) {
          itemCreate("34GL750-B", '449.99', 'LG 34GL750-B 34 inch 21: 9 Ultragear Curved Wfhd (2560 X 1080) IPS 144Hz G-SYNC Compatible Gaming Monitor,Black', 2, [categories[0],], callback);
        },
        function(callback) {
          itemCreate("G2 Series", '989.75', 'AOC CU34G2X 34" Curved Frameless Immersive Gaming Monitor, UltraWide QHD 3440x1440, VA Panel, 1ms 144Hz Freesync, Height Adjustable, 3-Yr Zero Dead Pixels', 1, [categories[0],], callback);
        },
        function(callback) {
          itemCreate("X35 bmiphzx", '1874.99', "Acer Predator X35 bmiphzx 1800R Curved 35 UltraWide QHD Gaming Monitor with NVIDIA G-SYNC Ultimate, Quantum Dot, 200Hz, VESA Certified DisplayHDR 1000, (Display Port & HDMI Port),Black", 4, [categories[1],], callback);
        },
        function(callback) {
          itemCreate("Basilisk Ultimate - Wireless", '169.99', "Razer Basilisk Ultimate HyperSpeed Wireless Gaming Mouse w/ Charging Dock: Fastest Gaming Mouse Switch - 20K DPI Optical Sensor - Chroma RGB - 11 Programmable Buttons - 100 Hr Battery - Classic Black", 5, [categories[1],], callback);
        },
        function(callback) {
          itemCreate('Corsair Nightsword RGB', '79.99', 'Corsair Nightsword RGB - Comfort Performance Tunable FPS/MOBA Optical Ergonomic Gaming Mouse with Backlit RGB LED, 18000 DPI, Black ', 2, [categories[0],categories[1]], callback);
        },
        function(callback) {
          itemCreate('Razer Huntsman Elite Gaming Keyboard', '149.99', 'Razer Huntsman Elite Gaming Keyboard: Fastest Keyboard Switches Ever - Clicky Optical Switches - Chroma RGB Lighting - Magnetic Plush Wrist Rest - Dedicated Media Keys & Dial - Classic Black ', 3, [categories[2],], callback)
        }
        ],
        // optional callback
        cb);
}



async.series([
    createCategories,
    createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        //console.log('BOOKInstances: '+bookinstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});





