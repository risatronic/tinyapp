const getUserURLs = function(id, database) {
  if(!id || !database){
    return;
  }
  let userURLs = {};

  for (let shortURL of Object.keys(database)) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = {
        longURL: database[shortURL].longURL,
        userID: database[shortURL].userID
      }
    }
  }

  return userURLs;
};

module.exports = getUserURLs;