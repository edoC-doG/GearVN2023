const Product = require('../models/products');
const ProductCategory = require('../models/productCategory');
const asyncHandler = require('express-async-handler');
const data = require('../../data/ecommerce.json')
const cateData = require('../../data/cate_brand')
const slugify = require('slugify')

const fn = async (product) => {
    await Product.create({
        title: product?.name,
        slug: slugify(product?.name) + Math.round(Math.random() * 100) + '',
        description: product?.description,
        brand: product?.brand,
        price: Math.round(Number(product?.price?.match(/\d/g).join('')) / 100),
        category: product?.category[1],
        quantity: Math.round(Math.random() * 1000),
        sold: Math.round(Math.random() * 100),
        images: product?.images,
        color: product?.variants?.find(el => el.brand === 'Color')?.variants[0]
    })
}

const insertData = asyncHandler(async (req, res) => {
    const promise = []
    for (let product of data) promise.push(fn(product))
    await Promise.all(promise)
    return res.json('Done')
})

const fn2 = async (cate) => {
    await ProductCategory.create({
        title: cate?.cate,
        brand: cate?.brand
    })
}

const insertCateProduct = asyncHandler(async (req, res) => {
    const promise = []
    for (let cate of cateData) promise.push(fn2(cate))
    await Promise.all(promise)
    return res.json('Done')
})

module.exports = {
    insertData,
    insertCateProduct
}