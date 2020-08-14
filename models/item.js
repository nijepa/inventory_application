const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    numberInStock: {type: Number, required: true},
    category: [{type: Schema.Types.ObjectId, ref: 'Category'}],
    image: { type: String }
  }
);

// Virtual for Item's URL
ItemSchema
  .virtual('url')
  .get(function () {
    return '/inventory/item/' + this._id;
});

// Virtual for Item's Image
ItemSchema.virtual("imageUrl")
  .get(function () {
    return this.image ? "/uploads/" + this.image : "";
  });

//Export model
module.exports = mongoose.model('Item', ItemSchema);