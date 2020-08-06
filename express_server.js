const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

function emailExists(req) {
  for (let user in users) {
    if (users[user].email === req.body.email) {
      return true;
    }
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL,
    longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.send("Error 400: Email and password fields cannot be empty");
  } else if (emailExists(req)) {
    res.send("Error 400: Account already exists");
  } else {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    // console.log(userID, users);
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  if(!emailExists(req)){
    res.send("Error 403: User account does not exist");
  }
  for(let key of Object.keys(users)){
    if(users[key].email === req.body.email){
      if(users[key].password === req.body.password){
        res.cookie("user_id", users[key].id);
        res.redirect("/urls");
      }else{
        res.send("Error 403: Password is incorrect");
      }
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
