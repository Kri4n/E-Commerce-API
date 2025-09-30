const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const auth = require("../auth");

const { errorHandler } = auth;

module.exports.registerUser = (req, res) => {
  // Checks if the email is in the right format
  if (!req.body.email.includes("@")) {
    // if the email is not in the right format, send a message 'Invalid email format'.
    return res.status(400).send({ message: "Invalid email format" });
  }
  // Checks if the mobile number has the correct number of characters
  else if (req.body.mobileNo.length !== 11) {
    // if the mobile number is not in the correct number of characters, send a message 'Mobile number is invalid'.
    return res.status(400).send({ message: "Mobile number is invalid" });
  }
  // Checks if the password has atleast 8 characters
  else if (req.body.password.length < 8) {
    // If the password is not atleast 8 characters, send a message 'Password must be atleast 8 characters long'.
    return res
      .status(400)
      .send({ message: "Password must be atleast 8 characters long" });
    // If all needed requirements are achieved
  } else {
    let newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      password: bcrypt.hashSync(req.body.password, 10),
    });

    return (
      newUser
        .save()
        // if all needed requirements are achieved, send a success message 'User registered successfully' and return the newly created user.
        .then((result) =>
          res.status(201).send({
            message: "User registered successfully",
            user: result,
          })
        )
        .catch((error) => errorHandler(error, req, res))
    );
  }
};

// User authentication - with bcrypt
/*
    Steps:
    1. Check the database if the user email exists
    2. Compare the password provided in the login form with the password stored in the database
    3. Generate/return a JSON web token if the user is successfully logged in and return false if not
*/
//[SECTION] User authentication
module.exports.loginUser = (req, res) => {
  if (req.body.email.includes("@")) {
    return User.findOne({ email: req.body.email })
      .then((result) => {
        if (result == null) {
          // if the email is not found, send a message 'No email found'.
          return res.status(404).send({ message: "No email found" });
        } else {
          const isPasswordCorrect = bcrypt.compareSync(
            req.body.password,
            result.password
          );
          if (isPasswordCorrect) {
            // if all needed requirements are achieved, send a success message 'User logged in successfully' and return the access token.
            return res.status(200).send({
              message: "User logged in successfully",
              access: auth.createAccessToken(result),
            });
          } else {
            // if the email and password is incorrect, send a message 'Incorrect email or password'.
            return res
              .status(401)
              .send({ message: "Incorrect email or password" });
          }
        }
      })
      .catch((error) => errorHandler(error, req, res));
  } else {
    // if the email used in not in the right format, send a message 'Invalid email format'.
    return res.status(400).send({ message: "Invalid email format" });
  }
};

module.exports.getProfile = (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      return res.status(200).send({ user: user });
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.updatePassword = (req, res) => {
  const { newPassword } = req.body;

  // Validate new password
  if (!newPassword || newPassword.length < 8) {
    return res
      .status(400)
      .send({ message: "Password must be at least 8 characters long." });
  }

  // Find user by ID and update password
  User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      // Update password
      user.password = bcrypt.hashSync(newPassword, 10);
      return user.save();
    })
    .then(() =>
      res.status(200).send({ message: "Password updated successfully." })
    )
    .catch((error) => {
      console.error(error);
      res.status(500).send({ message: "Error updating password." });
    });
};

// Admin privilege update function (ensure this exists if you're using the route)
module.exports.updateAdmin = (req, res) => {
  const userId = req.params.userId;

  User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send({ message: "User not found." });
      }
      res.status(200).send({ updatedUser: updatedUser });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ message: "Error updating user to admin." });
    });
};
