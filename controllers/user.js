/*-- Assignment 2 Web Application Development COMP229 
          Dinu Gherciu, ID: 301268678, Fall 2022*/

let User = require('../models/user');
let passport = require('passport');

function getErrorMessage(err) {
  console.log("===> Error: " + err);
  let message = '';

  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = 'Username already exists';
        break;
      default:
        message = 'Something went wrong';
    }
  } else {
    for (var errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }

  return message;
};

// check if the user is not already logged in
module.exports.renderLogin = function(req, res, next) {
  if (!req.user) {
    res.render('auth/login', {
      title: 'Login Form',
      messages: req.flash('error') || req.flash('info'),
      username: req.user ? req.user.username : '' 

    });
  } else {
    console.log(req.user);
    return res.redirect('/');
  }
};

module.exports.renderSignup = function(req, res, next) {
  if (!req.user) {

    // creates a empty new user object.
    let newUser = User();

    res.render('auth/signup', {
      title: 'Sign-up Form',
      messages: req.flash('error'),
      user: newUser
    });

  } else {
    return res.redirect('/');
  }
};

module.exports.signup = function(req, res, next) {
  
  if (!req.user && req.body.password === req.body.password_confirm) {
    console.log(req.body);

    let user = new User(req.body);
    user.provider = 'local';
    console.log(user);

    user.save((err) => {
      if (err) {
        let message = getErrorMessage(err);

        req.flash('error', message);
        
        return res.render('auth/signup', {
          title: 'Sign-up Form',
          messages: req.flash('error'),
          user: user
        });
      }
      req.login(user, (err) => {
        if (err) return next(err);
          return res.redirect('/');
      });
    });
  } else {
    return res.redirect('/');
  }
};

module.exports.signout = function(req, res, next) {
  // Version 0.5.0
  // req.logout();
  // res.redirect('/');

  // Version 0.6.0
  req.logout(function(err) {
    if (err) { 
      return next(err); 
    }
    res.redirect('/');
  });
};

module.exports.login = function(req, res, next){
  passport.authenticate('local', {   
    successRedirect: req.session.url || '/contacts/list',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
  delete req.session.url;
}