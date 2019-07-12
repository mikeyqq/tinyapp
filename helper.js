const emailInDB = (email) => {
  for(const record in users) {
    if(users[record].email === email) {
      return true;
    }
  }
  return false;
};

const getUserByEmail = (email, database) => {
  for(const record in database) {
    if(email === database[record].email) {
      return database[record];
    }
  }
  return undefined;
}



module.exports = {emailInDB, getUserByEmail};
;