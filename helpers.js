const getUserURLs = function(id, database, userDatabase) {
  if (!id || !database || !userDatabase[id]) {
    return;
  }
  let userURLs = {};

   //checks if user ID associated with URL matches & adds URL object to return object if so
  for (let shortURL of Object.keys(database)) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = {
        longURL: database[shortURL].longURL,
        userID: database[shortURL].userID
      };
    }
  }
  return userURLs;
};

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

module.exports = {
  getUserURLs,
  generateRandomString
};