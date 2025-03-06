import Order from "../models/order.js";
import { isCustomer } from "./userController.js";

export async function createOrder(req, res) {
    //cbc001
    if (!isCustomer) {
        res.json({
            message: "login as customer to create order"
        })

    }
    //take the latest product ID
    try {
        const latestOrder = await Order.find().sort({ date: -1 }).limit(1)

        let orderId

        if (latestOrder.length == 0) {
            orderId = "CBC001"
        } else {
            const currentOrderId = latestOrder[0].orderId

            const numberString = currentOrderId.replace("CBC", "")
            const number = parseInt(numberString)
            const newNumber = (number + 1).toString().padStart(4, "0");
            orderId = "CBC" + newNumber
        }

        const newOrderData = req.body
        newOrderData.orderId = orderId
        newOrderData.email = req.user.email

        const order = new Order(newOrderData)

        await order.save()

        res.json({
            message: "Order created"
        })



    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}