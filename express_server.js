const express = require("express");
const bcrypt = require('bcrypt');
const helper = require('./helper');
const cookieSession = require('cookie-session')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['tester'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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

//When going to ROOT PAGE, it will redirect based on logged in status.
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

  
  //GET REGISTERRRR!!!!
app.get('/register', (req, res) => {
    res.render("urls_registration", users);
});
  
  //checks to see if email in database for success/error
app.post('/register', (req, res) => {
    if(!req.body.email || !req.body.password) {
      res.statusCode = 403;
      res.sendStatus(403);
  } else if(emailInDB(req.body.email, )) {
    res.statusCode = 403;
    res.sendStatus(403);
} else {
    //console.log("hello");
    let randomId = generateRandomString();
    let newUser = {
      id: randomId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
  }
    //console.log(newUser.password);
    users[randomId] = newUser;
    req.session.users_id = newUser.id;        //IS THIS CORRECT?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  res.redirect("/urls") 
  }
});

app.get('/login' , (req, res) => {
  res.render("urls_login", {users: users[req.session.users_id]});
});

app.post("/login", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  if (!validateUser(email, password)) {
    res.statusCode = 403;
    res.sendStatus(403);
  } else {
    req.session.users_id = getUserByEmail(email, users).id;       //IS THIS CORRECT?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    res.redirect('/urls');
  }
  });
  
app.get("/urls/:shortURL", (req, res) => {
    if(urlsForUser(req.session.users_id)[req.params.shortURL]) {
      let templateVars = {users: users[req.session.users_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
      res.render("urls_show", templateVars);
    } else {
      res.redirect(400, '/register');
    }
  });
  
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
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



  //This will redirect back to My Urls page with new short URL and longURL
app.post("/urls/:shortURL", (req, res) => {
    if(urlsForUser(req.session.users_id)[req.params.shortURL]) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      res.redirect('/urls');
    } else {
      res.redirect("/urls");
    }
});

  
//This will redirect back to the same page and also delete the shortURL requested
app.post("/urls/:shortURL/delete", (req, res) => {
  if(urlsForUser(req.session.users_id)[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL]
    res.redirect("/urls/");
  } else {
    res.redirect("/urls/");
  }
});


//This will generate for both shortURL and users_id
const generateRandomString = () => {
  let result  = '';
  let characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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
    if(database[record].email === email) {
      return database[record];
    }
  }
  return undefined;
}


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