const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const express = require("express");
const getUserURLs = require("./helpers");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["key"]
}));

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  emailExists: function(email) {
    const users = this;
    for (let user in users) {
      if (users[user].email === email) {
        return true;
      }
    }
    return false;
  }
};

app.post("/urls/:shortURL/delete", (req, res) => {
  const userURLs = getUserURLs(req.session.user_id, urlDatabase);
  const toDelete = userURLs[req.params.shortURL];

  if (toDelete) {
    delete urlDatabase[req.params.shortURL];
  }

  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: userDatabase[req.session.user_id]
    };

    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const urlsToDisplay = getUserURLs(req.session.user_id, urlDatabase);
  let templateVars = {
    user: userDatabase[req.session.user_id],
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
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  let templateVars = {
    user: userDatabase[req.session.user_id],
    shortURL,
    longURL
  };

  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.newURL;

  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.send("Error 400: Email and password fields cannot be empty");
  } else if (userDatabase.emailExists(req.body.email)) {
    res.send("Error 400: Account already exists");
  } else {
    userDatabase[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    // console.log(userID, users);
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  if (!userDatabase.emailExists(req.body.email)) {
    res.send("Error 403: User account does not exist");
  }
  for (let key of Object.keys(userDatabase)) {
    if (userDatabase[key].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, userDatabase[key].password)) {
        req.session.user_id = userDatabase[key].id;
        res.redirect(`/urls`);
      } else {
        res.send("Error 403: Password is incorrect");
      }
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };

  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
