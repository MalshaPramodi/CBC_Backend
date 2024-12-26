import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function createUser(req, res) {

    const newUserData = req.body;
    newUserData.password = bcrypt.hashSync(newUserData.password, 10);

    const user = new User(newUserData);

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
                    const token = jwt.sign({ user }, "cbc-secret-key-123")
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