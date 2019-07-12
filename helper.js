const generateRandomString = () => {
  let result  = '';
  let characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


const getUserByEmail = (email, database) => {
  for(const record in database) {
    if(database[record].email === email) {
      return database[record];
    }
  }
  return undefined;
}



module.exports = { getUserByEmail, generateRandomString };