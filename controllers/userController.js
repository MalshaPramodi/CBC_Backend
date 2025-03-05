import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function createUser(req, res) {

    const newUserData = req.body;

    newUserData.password = bcrypt.hashSync(newUserData.password, 10);
    const user = new User(newUserData);


    if (newUserData.type === "admin") {
        if (req.user == null) {
            res.json({
                message: "Please login as administrator to create admin accounts"
            })
            return
        }

        if (req.user.type != "admin") {
            res.json({
                message: "You are not authorized to create admin accounts"
            })
            return
        }
    }


    user.save().then(
        () => res.json({
            Message: "User created"
        })
    ).catch(
        () => res.json({
            Message: "Error"
        })
    )
}

export function loginUser(req, res) {
    User.find({ email: req.body.email }).then(
        (users) => {
            if (users.length === 0) {
                res.json({ Message: "User not found" })
            } else {
                const user = users[0]
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password)

                if (isPasswordCorrect) {
                    const token = jwt.sign({ user }, process.env.SECRET)
                    console.log(token)

                    res.json(
                        {
                            Message: "User logged in",
                            token: token
                        }
                    )
                } else {
                    res.json(
                        {
                            Message: "User not logged in (wrong password)"
                        }
                    )
                }
            }
        }
    )
}

export function deleteUser(req, res) {
    User.deleteOne({ email: req.body.email }).then(
        () => res.json({ Message: "User deleted" })
    ).catch(
        () => res.json({ Message: "Error:User cannot be deleted." })
    )
}

export function isAdmin(req) {
    if (req.user == null) {
        return false
    }

    if (req.user.type != "admin") {
        return false
    }

    return true
}

export function isCustomer(req) {
    if (req.user == null) {
        return false
    }

    if (req.user.type != "customer") {
        return false
    }

    return true
}
//Customer Acc - john.doe@example.com hashed_password_here

//Admin Acc - admin@example.com admin123