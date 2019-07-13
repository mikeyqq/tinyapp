const express = require("express");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;
const { getUserByEmail, generateRandomString } = require('./helper.js');

app.set("view engine", "ejs");
app.use(methodOverride('_method'));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['tester'],
  maxAge: 24 * 60 * 60 * 1000
}));

//*-----------------------------------------------------------------------------------USERS DATABASE-----------------------------------------------------------------------------*//

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}
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

//*------------------------------------------------------------------------------------ GET / POST -----------------------------------------------------------------------------*//

//This is the root page which will redirect user to main page that shows your tinyurls or creates new tinyurls based on cookie session of the users id.
app.get("/", (req, res) => {
  if (req.session.users_id) {
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

//Main page that has your exisiting tinyurls and other options.
app.get('/urls', (req, res) => {
  let templateVars = {
    users: users[req.session["users_id"]],
    urls: urlsForUser(req.session.users_id), users: users[req.session.users_id]};
  res.render("urls_index", templateVars);
});

//Main page that will verify if you are logged in based on cookie session. This post will allow you to go to any short links you have created.
app.post("/urls", (req, res) => {
  if (!req.session.users_id) {
    res.redirect(400, '/login');
  }
  const username = req.session.users_id;
  let newsmallLink = generateRandomString();
  urlDatabase[newsmallLink] = {longURL: req.body.longURL, userID: username};
  res.redirect(`/urls/${newsmallLink}`);
});

//Create new TinyUrl page.
app.get('/urls/new', (req, res) => {
  if (req.session.users_id) {
    res.render("urls_new", {users: users[req.session.users_id]});
  } else {
    res.redirect('/login');
  }
});

//Register page, Will verify cookie session, and if valid it will redirect to /urls main page, otherwise it will render the registraion page.
app.get('/register', (req, res) => {
  if (req.session.users_id) {
    res.redirect('/urls');
  } else {
    res.render("urls_registration", {users: users[req.session.users_id]});
  }
});
  
//On register page, checks input fields, and then checks if emails in database in order for you to register an account.
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.redirect(400, '/register');
  } else if (emailInDb(req.body.email,)) {
    res.redirect(400, '/register');
  } else {
    let randomId = generateRandomString();
    let newUser = {
      id: randomId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    users[randomId] = newUser;
    req.session.users_id = newUser.id;
    res.redirect("/urls");
  }
});

app.get('/login' , (req, res) => {
  if (!req.session.users_id) {
    res.render("urls_login", {users: users[req.session.users_id]});
  } else {
    res.redirect("/urls");
  }
});

//The helper function validateUser will return true or false base on if the input email/password exists.
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!validateUser(email, password)) {
    res.redirect(400, '/login');
  } else {
    req.session.users_id = getUserByEmail(email, users).id;
    res.redirect('/urls');
  }
});
  
//Short URL page which will load up after creating a new Tiny Url. Page will display original url, the short url, and edit. 
app.get("/urls/:shortURL", (req, res) => {
  if (urlsForUser(req.session.users_id)[req.params.shortURL]) {
    let templateVars = {users: users[req.session.users_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
    res.render("urls_show", templateVars);
  } else {
    res.redirect(400, '/login');
  }
});

//This will redirect your shortURL directly to the long urls main page if the shortURL is valid and exist in the urlDatabase.
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.redirect(400, '/login');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.put("/urls/:shortURL", (req, res) => {
  if (urlsForUser(req.session.users_id)[req.params.shortURL]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.redirect("/urls");
  }
});


app.delete("/urls/:shortURL", (req, res) => {
  if (urlsForUser(req.session.users_id)[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  } else {
    res.redirect("/urls/");
  }
});

//*-------------------------------------------------------------------------------- HELPER FUNCTIONS --------------------------------------------------------------------------------*//

//This helper function checks if email is in our existing database and returns true or false.
const emailInDb = (email) => {
  for (const record in users) {
    if (users[record].email === email) {
      return true;
    }
  }
  return false;
};

//This helper function checks if the users email and hashed password matches what we have in our users database and returns true or false.
const validateUser = (email, password) => {
  for (const record in users) {
    if (email === users[record].email && bcrypt.compareSync(password, users[record].password)) {
      return true;
    }
  }
  return false;
};


const urlsForUser = (id) => {
  let newObj = {};
  for (const record in urlDatabase) {
    if (urlDatabase[record].userID === id) {
      newObj[record] = urlDatabase[record];
    }
  }
  return newObj;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});