// const alert = require("alert");
const bcrypt = require('bcrypt');
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
};

function usersURLs(req) {
  let userURLs = {};

  for (let shortURL of Object.keys(urlDatabase)) {
    if (urlDatabase[shortURL].userID === req.cookies['user_id']) {
      userURLs[shortURL] = {
        longURL: urlDatabase[shortURL].longURL,
        userID: urlDatabase[shortURL].userID
      }
    }
  }

  return userURLs;
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

app.post("/urls/:shortURL/delete", (req, res) => {
  let userURLs = usersURLs(req);
  let toDelete = userURLs[req.params.shortURL];

  if (toDelete) {
    delete urlDatabase[req.params.shortURL];
  };
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  let urlsToDisplay = usersURLs(req);

  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlsToDisplay
  };

  if (!templateVars.user) {
    alert("Must be logged in to see URLs");
    res.redirect(401, "/login");
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL].longURL;
  console.log("short:", shortURL, "long:", longURL);
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL,
    longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.send("Error 400: Email and password fields cannot be empty");
  } else if (emailExists(req)) {
    res.send("Error 400: Account already exists");
  } else {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
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
  if (!emailExists(req)) {
    res.send("Error 403: User account does not exist");
  }
  for (let key of Object.keys(users)) {
    if (users[key].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[key].password)) {
        console.log(users[key].password);
        res.cookie("user_id", users[key].id);
        res.redirect(`/urls`);
      } else {
        res.send("Error 403: Password is incorrect");
      }
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  console.log()
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
