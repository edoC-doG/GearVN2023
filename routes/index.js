const userRouter = require('./user')
const productRouter = require('./product')
const productCategoryRouterRouter = require('./productCategory')
const { notFound, errHandler } = require('../middlewares/errHandle')

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)
    app.use('/api/prodcategory', productCategoryRouter)

    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes