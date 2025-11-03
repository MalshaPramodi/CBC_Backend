import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

export function createUser(req, res) {
  const newUserData = req.body;

  newUserData.password = bcrypt.hashSync(newUserData.password, 10);
  const user = new User(newUserData);

  if (newUserData.type === "admin") {
    if (req.user == null) {
      res.json({
        message: "Please login as administrator to create admin accounts",
      });
      return;
    }

    if (req.user.type != "admin") {
      res.json({
        message: "You are not authorized to create admin accounts",
      });
      return;
    }
  }

  user
    .save()
    .then(() =>
      res.json({
        Message: "User created",
      })
    )
    .catch(() =>
      res.json({
        Message: "Error",
      })
    );
}

export function loginUser(req, res) {
  User.find({ email: req.body.email }).then((users) => {
    if (users.length === 0) {
      res.json({ Message: "User not found" });
    } else {
      const user = users[0];
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (isPasswordCorrect) {
        const token = jwt.sign(
          {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isBlocked: user.isBlocked,
            type: user.type,
            profilePicture: user.profilePicture,
          },
          process.env.SECRET
        );
        console.log(token);

        res.json({
          Message: "User logged in",
          token: token,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            type: user.type,
            profilePicture: user.profilePicture,
            email: user.email,
          },
        });
      } else {
        res.json({
          Message: "User not logged in (wrong password)",
        });
      }
    }
  });
}

export function deleteUser(req, res) {
  User.deleteOne({ email: req.body.email })
    .then(() => res.json({ Message: "User deleted" }))
    .catch(() => res.json({ Message: "Error:User cannot be deleted." }));
}

export function isAdmin(req) {
  if (!req.user) {
    return false;
  }

  if (req.user.type != "admin") {
    return false;
  }

  return true;
}

export function isCustomer(req) {
  if (req.user == null) {
    return false;
  }

  if (req.user.type != "customer") {
    return false;
  }

  return true;
}

export async function googleLogin(req, res) {
  const token = req.body.token;
  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const email = response.data.email;
    //Check is user exists
    const usersList = await User.find({ email: email });
    if (usersList.length > 0) {
      //User exists, generate JWT
      const user = usersList[0];
      const token = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isBlocked: user.isBlocked,
          type: user.type,
          profilePicture: user.profilePicture,
        },
        process.env.SECRET
      );

      res.json({
        message: "User logged in",
        token: token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          type: user.type,
          profilePicture: user.profilePicture,
          email: user.email,
        },
      });
    } else {
      //create new user
      const newUserData = {
        email: email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        type: "customer",
        password: "ffffff",
        profilePicture: response.data.picture,
      };
      const user = new User(newUserData);
      user
        .save()
        .then(() => {
          res.json({
            message: "User created",
          });
        })
        .catch((error) => {
          res.json({
            message: "User not created",
          });
        });
    }
  } catch (error) {
    res.json({ Message: "Google login failed" });
  }
}

export async function getUser(req, res) {
  if (req.user == null) {
    res.status(404).json({
      message: "Please login to view details",
    });
    return;
  }
  res.json(req.user);
}

// New function to get all users
export async function getAllUsers(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET);

    if (decoded.type !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    const users = await User.find({}, "-password"); // Exclude passwords from the result
    res.json(users);
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
}

export async function getTotalCustomers(req, res) {
  try {
    if (isAdmin(req)) {
      const totalCustomers = await User.countDocuments({ type: "customer" });
      res.json({ totalCustomers });
    } else {
      res.status(403).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//Customer Acc - john.doe@example.com hashed_password_here

//Admin Acc - admin@example.com admin123
