const { assert } = require('chai');

const { getUserByEmail } = require('../helper.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    console.log(user);
    // Write your assert statement here
   assert.equal(expectedOutput, user.id);

  });

  it('should return undefined with an email not in database', function() {
    const user = getUserByEmail("user1@example.com", testUsers)
    const expectedOutput = undefined;
    // Write your assert statement here
   assert.equal(expectedOutput, user);

  });

  it('should return undefined with an email not in database', function() {
    const user = getUserByEmail("user1@example.com", testUsers)
    const expectedOutput = undefined;
    // Write your assert statement here
   assert.equal(expectedOutput, user);

  });

});










