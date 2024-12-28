import Product from "../models/product.js";

export async function getProduct(req, res) {
    try {
        const productList = await Product.find()
        res.json({
            list: productList
        })
    } catch (err) {
        res.json({
            message: "Error"
        })
    }
}



export function createProduct(req, res) {
    console.log(req.user)

    if (req.user = null) {
        res.json({
            message: "You are not logged in"
        })
        return
    }

    if (req.user.type != admin) {
        res.json({
            message: "You are not an admin"
        })
        return
    }
    const product = new Product(req.body);

    product.save().then(
        () => {
            res.json({
                message: "Product created"
            })
        }

    ).catch(
        () => {
            res.json({
                message: "Error"
            })
        }
    )
}

export function deleteProduct(req, res) {
    Product.deleteOne({ name: req.params.name }).then(
        () => {
            res.json({
                message: "Product deleted"
            })
        }
    ).catch(
        () => {
            res.json({
                message: "Error"
            })
        }
    )
}

export function getProductByName(req, res) {
    const name = req.params.name;

    Product.findOne({ name: name }).then(
        (productList) => {
            res.json({
                list: productList
            })
        }
    )

    res.json({
        message: "Product name is " + name
    })
}

