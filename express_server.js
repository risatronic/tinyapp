const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const express = require('express');
const { getUserURLs, generateRandomString } = require('./helpers.js');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key']
}));

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2RandomID' }
};

const userDatabase = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple', 10)
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10)
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

app.post('/urls/:shortURL/delete', (req, res) => {
  const userURLs = getUserURLs(req.session.user_id, urlDatabase, userDatabase);
  const toDelete = userURLs[req.params.shortURL];

  if (toDelete) {
    delete urlDatabase[req.params.shortURL];
  }

  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
  if (req.session.user_id === undefined) {
    req.session.message = 'Must be logged in to create a URL';
    res.redirect('/login');
  } else {
    let templateVars = {
      user: userDatabase[req.session.user_id]
    };

    res.render('urls_new', templateVars);
  }
});

app.get('/urls', (req, res) => {
  const urlsToDisplay = getUserURLs(req.session.user_id, urlDatabase, userDatabase);
  let templateVars = {
    user: userDatabase[req.session.user_id],
    urls: urlsToDisplay,
    message: req.session.message
  };
  req.session.message = null;

  if (!templateVars.user) {
    req.session.message = 'Must be logged in to see URLs';
    res.redirect('/login');
  } else {
    res.render('urls_index', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    req.session.message = 'Error 404: URL does not exist';
    res.redirect('/urls');
  } else if (urlDatabase[shortURL].userID !== req.session.user_id) {
    req.session.message = 'Error: URL does not belong to current user';
    res.redirect('/urls');
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  let templateVars = {
    user: userDatabase[req.session.user_id],
    shortURL,
    longURL
  };

  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    req.session.message = 'Error: Must be logged in to edit URLS';
    res.redirect('/login');
  } else if (urlDatabase[shortURL].userID !== req.session.user_id) {
    req.session.message = 'Error: URL does not belong to current user';
    res.redirect('/urls');
  } else {
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    req.session.message = 'Error: Shortened URL does not exist';
    res.redirect('/urls');
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  let templateVars = {
    user: userDatabase[req.session.user_id],
    message: req.session.message
  };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    req.session.message = 'Error: Email and password fields cannot be empty';
    res.redirect('/register');
  } else if (userDatabase.emailExists(req.body.email)) {
    req.session.message = 'Error: Account already exists';
    res.redirect('/login');
  } else {
    req.session.message = null;
    userDatabase[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    // console.log(userID, users);
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {

  if (req.session.user_id) {
    req.session.message = 'User is already logged in';
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: userDatabase[req.session.user_id],
      message: req.session.message
    };
    req.session.message = null;
    res.render('urls_login', templateVars);
  }
});

app.post('/login', (req, res) => {
  req.session.message = null;
  if (!userDatabase.emailExists(req.body.email)) {
    req.session.message = 'Error: User account does not exist';
    res.redirect('/login');
  }
  for (let key of Object.keys(userDatabase)) {
    if (userDatabase[key].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, userDatabase[key].password)) {
        req.session.user_id = userDatabase[key].id;
        res.redirect(`/urls`);
      } else {
        req.session.message = 'Error: Password is incorrect';
        res.redirect('/login');
      }
    }
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    req.session.message = 'Error: Must be logged in to create new URL';
    res.redirect('/login');
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect(`/urls`);
  }
});

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
