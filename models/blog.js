const mongoose = require('mongoose'); // Erase if already required
// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    numberViews: {
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    disLikes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    images: {
        type: String,
        default: 'https://img.freepik.com/free-photo/flat-lay-workstation-with-copy-space-laptop_23-2148430879.jpg?w=1060&t=st=1702980780~exp=1702981380~hmac=c70e92c486594d236316c003fde7903648cce67d5f28a6c2041a915fd7d82eda'
    },
    author: {
        type: String,
        default: "Admin"
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//Export the model
module.exports = mongoose.model('Blog', blogSchema);