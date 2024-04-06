const Product = require('../models/products');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const { options } = require('../routes/product');

const createProduct = asyncHandler(async (req, res) => {
    const { title, price, description, brand, category, color } = req.body
    if (!(title && price && description && brand && category && color)) throw new Error('Missing inputs')
    const thumb = req?.files?.thumb[0]?.path
    const images = req?.files?.images?.map(el => el.path)
    req.body.slug = slugify(title)
    if (thumb) req.body.thumb = thumb
    if (images) req.body.images = images
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        mes: newProduct ? "Created product successfully !!!" : "Cannot create new product. Try again !!!"
    })
})

const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    const product = await Product.findById(pid).populate({
        path: 'ratings',
        populate: {
            path: 'postedBy',
            select: 'firstName lastName avatar'
        }
    })
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : "Cannot get product"
    })
})

//Filtering, sorting && pagination
const getProducts = asyncHandler(async (req, res) => {
    const queries = { ...req.query }

    // Tách các trường đặt biệt ra khỏi querry
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(el => delete queries[el])

    // Format lai cac operator cho dung cu phap cua MongoDB
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`)
    const formatQueries = JSON.parse(queryString)
    let colorQueryObj = {}
    //Filtering
    if (queries?.title) formatQueries.title = { $regex: queries.title, $options: 'i' }
    if (queries?.category) formatQueries.category = { $regex: queries.category, $options: 'i' }
    if (queries?.color) {
        delete formatQueries.color;
        const colorArr = queries.color?.split(',');
        const colorQuery = colorArr.map(el => ({ color: { $regex: el, $options: 'i' } }));
        colorQueryObj = { $or: colorQuery };
    }
    let queryObject = {}
    if (queries?.q) {
        delete formatQueries.q
        queryObject = {
            $or: [
                { color: { $regex: queries.q, $options: 'i' } },
                { title: { $regex: queries.q, $options: 'i' } },
                { category: { $regex: queries.q, $options: 'i' } },
                { brand: { $regex: queries.q, $options: 'i' } },
            ]
        }
    }

    const qr = { ...colorQueryObj, ...formatQueries, ...queryObject }
    let queryCommand = Product.find(qr)


    //Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        queryCommand = queryCommand.sort(sortBy)
    }
    // Fields limiting

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }

    //Pagination
    // + limit: Số object lấy về 1 gọi API
    // Skip: 2
    // 1 2 /3 ... 10
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)
    //Execute query
    // So luong san pham thoa man dieu kien !== so luong san pham tra ve 1 lan goi API
    queryCommand.then(async (response) => {
        const counts = await Product.find(qr).countDocuments()
        return res.status(200).json({
            success: response ? true : false,
            counts,
            products: response ? response : "Cannot get products",
        })
    }).catch((err) => {
        if (err) throw new Error(err.message)
    })
})

const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    const files = req?.files

    if (files?.thumb) req.body.thumb = files?.thumb[0]?.path
    if (files?.images) req.body.images = files?.images?.map(el => el.path)
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const updateProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true })
    return res.status(200).json({
        success: updateProduct ? true : false,
        mes: updateProduct ? "Updated Product" : "Cannot update product"
    })
})

const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    if (!pid) throw new Error('Missing inputs')
    const deleteProduct = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: deleteProduct ? true : false,
        mes: deleteProduct ? "Deleted Product" : "Cannot delete product"
    })
})

const ratings = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { star, comment, pid, updatedAt } = req.query
    if (!star || !pid) throw new Error('Missing Inputs')
    const ratingProduct = await Product.findById(pid)
    const alreadyRating = ratingProduct?.ratings?.find(el => el.postedBy.toString() === _id)
    if (alreadyRating) {
        await Product.updateOne({
            ratings: { $elemMatch: alreadyRating }
        }, {
            $set: { "ratings.$.star": star, "ratings.$.comment": comment, "ratings.$.updatedAt": updatedAt }
        }, { new: true })
        //Update star & comment
    } else {
        // add star & comment
        await Product.findByIdAndUpdate(pid, {
            $push: { ratings: { star, comment, postedBy: _id, updatedAt } }
        }, { new: true })

    }

    // Sum ratings

    const updateProduct = await Product.findById(pid)
    const ratingCount = updateProduct.ratings.length
    const sumRatings = updateProduct.ratings.reduce((sum, el) => sum + +el.star, 0)
    updateProduct.totalRatings = Math.round(sumRatings * 10 / ratingCount) / 10

    await updateProduct.save()

    return res.status(200).json({
        status: true,
    })
})

const uploadImageProd = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (!req.files) throw new Error('Missing input')
    const response = await Product.findByIdAndUpdate(pid, { $push: { images: { $each: req.files.map(el => el.path) } } }, { new: true })
    return res.status(200).json({
        status: response ? true : false,
        updatedProduct: response ? response : "Cannot Upload Images"
    })
})
module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ratings,
    uploadImageProd
}