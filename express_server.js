const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
//const cookieSession = require('cookie-session')
const app = express();
const PORT = 8080; // default port 8080



app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/*app.use(cookieSession({
  name: 'session',
  keys: ['tester'],
}))*/



const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "2"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get('/urls', (req, res) => {
  let templateVars = { 
    users: users[req.cookies["users_id"]],
    urls: urlsForUser(req.cookies.users_id), users: users[req.cookies.users_id]};
    res.render("urls_index", templateVars);
  });
  
  app.post("/urls", (req, res) => {
    username = req.cookies.users_id
    let newsmallLink = generateRandomString();
    urlDatabase[newsmallLink] = {longURL: req.body.longURL, userID: username};  // Log the POST request body to the console  
    res.redirect(`/urls/${newsmallLink}`)
  });




  app.get('/urls/new', (req, res) => {
    if(req.cookies.users_id){
      res.render("urls_new", {users: users[req.cookies.users_id]});
  
    } else {
      res.redirect('/login')
    }
  });




  
  //GET REGISTERRRR!!!!
  app.get('/register', (req, res) => {
    res.render("urls_registration", users);
  })
  
  //checks to see if email in database for success/error
  app.post('/register', (req, res) => {
    if(!req.body.email || !req.body.password) {
      res.statusCode = 403;
      res.sendStatus(403);
    } else if(emailInDB(req.body.email)) {
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
    console.log(users);
    res.cookie('users_id', randomId);
  res.redirect("/urls") 
  }
});




//GET LOGIN PAGE
app.get('/login' , (req, res) => {
  res.render("urls_login", {users: users[req.cookies.users_id]});
});

app.post("/login", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  if (!validateUser(email, password)) {
    res.statusCode = 403;
    res.sendStatus(403);
  } else {
    res.cookie('users_id', getUserID(email));
    res.redirect('/urls');
  }
  });
  
app.get("/urls/:shortURL", (req, res) => {
    if(urlsForUser(req.cookies.users_id)[req.params.shortURL]) {
      let templateVars = {users: users[req.cookies.users_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
      res.render("urls_show", templateVars);
    } else {
      res.redirect('/urls');
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
    res.clearCookie("users_id");
    res.redirect('/urls');
  });



  //This will redirect back to My Urls page with new short URL and longURL
  app.post("/urls/:shortURL", (req, res) => {
    if(urlsForUser(req.cookies.users_id)[req.params.shortURL]) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      res.redirect('/urls');
    } else {
      res.redirect("/urls");
    }
  });

  
//This will redirect back to the same page and also delete the shortURL requested
app.post("/urls/:shortURL/delete", (req, res) => {
  if(urlsForUser(req.cookies.users_id)[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL].longURL
    res.redirect("/urls/");
  } else {
    res.redirect("/urls/");
  }
});










app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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

const validateUser = (email, password) => {
  for(const record in users) {
    //console.log(record);
    if (email === users[record].email && bcrypt.compareSync(password, users[record].password)) {
      return true;
    } 
}
return false;
};

const getUserID = (email) => {
  for(const record in users) {
    if(users[record].email === email) {
      return users[record].id;
    }
  }
  return false;
}

const urlsForUser = (id) => {
  let newObj = {};
  for (const record in urlDatabase) {
    if (urlDatabase[record].userID === id) {
      newObj[record] = urlDatabase[record];
    }
  }
  return newObj;
};