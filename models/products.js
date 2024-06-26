const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    // create link : dong-ho-apple
    slug: {
        type: String,
        required: true,
        // unique: true,
        lowercase: true
    },
    description: {
        type: Array,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    thumb: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        require: true,
    },
    quantity: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    images: {
        type: Array
    },
    color: {
        type: String,
        require: true,
    },
    ratings: [
        {
            star: { type: Number },
            postedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
            comment: { type: String },
            updateAt: {
                type: Date,
            }
        }
    ],
    totalRatings: {
        type: Number,
        default: 0
    },
    variants: [
        {
            color: String,
            price: Number,
            thumb: String,
            images: Array,
            title: String,
            sku: String,
            sold: Number,
            quantity: Number,
        }
    ]
}, {
    timestamps: true,
});

//Export the model
module.exports = mongoose.model('Product', productSchema);