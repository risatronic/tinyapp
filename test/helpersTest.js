const { assert } = require('chai');

const getUserURLs = require('../helpers.js');

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "bqM7a3": { longURL: "http://www.neopets.com", userID: "userRandomID" },
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "u3id": {
    id: "u3id",
    email: "prudence@cat.com",
    password: "prudencethecatrules"
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

describe('userDatabase.emailExists', function() {
  it('should return true for a user that exists', function() {
    const email = "user@example.com";
    const result = (userDatabase.emailExists(email));

    assert.equal(result, true);
  });
  
  it('should return false for a user that does not exist', function() {
    const email = "marisa@coolguy.com";
    const result = (userDatabase.emailExists(email));

    assert.equal(result, false);
  });
});

describe('getUserURLs', function() {
  it('should return an object containing URLs belonging to user ID if they exist', function() {
    const id = "userRandomID";
    const result = getUserURLs(id, urlDatabase);
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
      "bqM7a3": { longURL: "http://www.neopets.com", userID: "userRandomID" },
    };

    assert.deepEqual(result, expectedOutput);
  });
  
  it('should return {} for a user that exists but is not associated with any URLs', function() {
    const id = "u3id";
    const result = getUserURLs(id, urlDatabase);
    const expectedOutput = {};

    assert.deepEqual(result, expectedOutput);
  });

  it('should return {} for a user that does not exist', function() {
    const id = "jeremiah";
    const result = getUserURLs(id, urlDatabase);
    const expectedOutput = {};

    assert.deepEqual(result, expectedOutput);
  });

  it('should return {} for a database that does not exist', function() {
    const id = "u3id";
    const database = {};
    const result = getUserURLs(id, database);
    const expectedOutput = {};

    assert.deepEqual(result, expectedOutput);
  });

  it('should return undefined if user ID is empty', function() {
    const id = "";
    const result = getUserURLs(id, urlDatabase);

    assert.equal(result, undefined);
  });

  it('should return undefined if database is empty', function() {
    const id = "userRandomID";
    const database = "";
    const result = getUserURLs(id, database);

    assert.equal(result, undefined);
  });
});