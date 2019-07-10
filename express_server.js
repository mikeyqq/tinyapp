const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
console.log(users);

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get('/urls', (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render("urls_new", {username: req.cookies["username"]});
});

//registration!!!!!!!!!!!!!!!!!!!!!
app.get('/register', (req, res) => {
  res.render("urls_registration", users);
})


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {username: req.cookies.username, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post('/register', (req, res) => {
let randomId = generateRandomString();
let newUser = {
  id: randomId,
  email: req.body.email,
  password: req.body.password
}
users[randomId] = newUser;
  res.cookie('user_id', req.body.users);
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  //console.log(req.body.username);
  res.redirect('/urls/');
  });

  app.post("/logout", (req, res) => {
res.clearCookie("username");
res.redirect('/urls/');
  });

//This will redirect back to the same page and also delete the shortURL requested
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls/");
});

//This will redirect back to My Urls page with new short URL and longURL
app.post("/urls/:shortURL", (req, res) => {
urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newsmallLink = generateRandomString();
  urlDatabase[newsmallLink] = req.body.longURL;  // Log the POST request body to the console  
  res.redirect(`/urls/${newsmallLink}`)
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//This will generate for both shortURL and user_ID
const generateRandomString = () => {
  let result  = '';
  let characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
