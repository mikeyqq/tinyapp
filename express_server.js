const express = require("express");
const bcrypt = require('bcrypt');
const helper = require('./helper');
const cookieSession = require('cookie-session')
const methodOverride = require('method-override');
const app = express();
const PORT = 8080; // default port 8080
const { getUserByEmail, generateRandomString } = require('./helper.js');

app.set("view engine", "ejs");
app.use(methodOverride('_method'));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['tester'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
}

//*------------------------------------------------------------------------------------ GET / POST -----------------------------------------------------------------------------*//

app.get("/", (req, res) => {
  if(req.session.users_id) {
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});


app.get('/urls', (req, res) => {
  let templateVars = { 
    users: users[req.session["users_id"]],
    urls: urlsForUser(req.session.users_id), users: users[req.session.users_id]};
    res.render("urls_index", templateVars);
  });
  
  app.post("/urls", (req, res) => {
    if(!req.session.users_id) {
      res.redirect(400, '/login')
    }
    username = req.session.users_id
    let newsmallLink = generateRandomString();
    urlDatabase[newsmallLink] = {longURL: req.body.longURL, userID: username};
    res.redirect(`/urls/${newsmallLink}`)
  });


app.get('/urls/new', (req, res) => {
    if(req.session.users_id){
      res.render("urls_new", {users: users[req.session.users_id]});
    } else {
      res.redirect('/login')
    }
});


app.get('/register', (req, res) => {
  if(req.session.users_id) {
    res.redirect('/urls');
  } else {
    res.render("urls_registration", {users: users[req.session.users_id]})
  };
});
  
app.post('/register', (req, res) => {
    if(!req.body.email || !req.body.password) {
      res.redirect(400, '/register')
  } else if(emailInDB(req.body.email, )) {
    res.redirect(400, '/register')
} else {
    let randomId = generateRandomString();
    let newUser = {
      id: randomId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
  }
    users[randomId] = newUser;
    req.session.users_id = newUser.id;     
  res.redirect("/urls") 
  }
});

app.get('/login' , (req, res) => {
  if(!req.session.users_id) {
    res.render("urls_login", {users: users[req.session.users_id]});
  } else {
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  if (!validateUser(email, password)) {
    res.redirect(400, '/login');
  } else {
    req.session.users_id = getUserByEmail(email, users).id; 
    res.redirect('/urls');
  }
  });
  
app.get("/urls/:shortURL", (req, res) => {
    if(urlsForUser(req.session.users_id)[req.params.shortURL]) {
      let templateVars = {users: users[req.session.users_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
      res.render("urls_show", templateVars);
    } else {
      res.redirect(400, '/login');
    }
  });
  
app.get("/u/:shortURL", (req, res) => {
    if(urlDatabase[req.params.shortURL]) {
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
    if(urlsForUser(req.session.users_id)[req.params.shortURL]) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      res.redirect('/urls');
    } else {
      res.redirect("/urls");
    }
});


app.delete("/urls/:shortURL", (req, res) => {
  if(urlsForUser(req.session.users_id)[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL]
    res.redirect("/urls/");
  } else {
    res.redirect("/urls/");
  }
});

//*-------------------------------------------------------------------------------- HELPER FUNCTIONS --------------------------------------------------------------------------------*//


const emailInDB = (email) => {
  for(const record in users) {
    if(users[record].email === email) {
      return true;
    }
  }
  return false;
};


const validateUser = (email, password) => {
  for(const record in users) {
    //console.log(record);
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