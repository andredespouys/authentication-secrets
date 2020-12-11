//Require working modules
require("dotenv").config(); //Allways at the top
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
// Set views and module specifications
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Make connection with the db
mongoose.connect("mongodb://localhost:27017/secureDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Create schema

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//Setting Encryption methods and variables
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

//Create model
const User = new mongoose.model("User", userSchema);

//Setting express route to DRY
app
  .route("/")

  .get(function (req, res) {
    res.render("home.ejs");
  });
//Login route
app
  .route("/login")
  .get(function (req, res) {
    res.render("login.ejs"); //Deploy login page
  })
  .post(function (req, res) {
    //Setting working consts with the given datat using body-parser
    const userName = req.body.username;
    const userPassword = req.body.password;
    //Search for existing user with given data
    User.findOne({ email: userName }, function (err, foundUser) {
      if (foundUser) {
        console.log("User found");
        if (foundUser.password === userPassword) {
          res.render("secrets");
        } else {
          console.log("No matcihng password");
          res.render("login");
        }
      } else {
        console.log("There is no user");
        res.render(err);
      }
    });
  });
//Register Route
app
  .route("/register")
  .get(function (req, res) {
    res.render("register.ejs");
  })
  //Capture data from the register post and create user
  .post(function (req, res) {
    const userName = req.body.username;
    const userPassword = req.body.password;
    const newUser = new User({
      email: userName,
      password: userPassword,
    });
    //Save user and deploy secret page
    newUser.save(function (err) {
      if (!err) {
        console.log("No errors");
        res.render("secrets.ejs");
      } else {
        console.log(err);
      }
    });
  });
//Working port
app.listen(3000, function () {
  console.log("Server running on 3000");
});
