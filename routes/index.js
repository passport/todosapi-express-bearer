var express = require('express');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer');
var db = require('../db');


passport.use(new BearerStrategy(function(token, cb) {
  db.users.get('SELECT * FROM access_tokens WHERE value = ?', [
    token
  ], function(err, row) {
    console.log('GOT TOKEN');
    console.log(err);
    console.log(row);
    
    
    if (err) { return cb(err); }
    if (!row) { return cb(null, false); }
    var user = {
      id: row.user_id
    };
    // TODO: Pass scope as info
    return cb(null, user);
  });
}));

var router = express.Router();

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
}, function(req, res, next) {
  if (req.body.title !== '') { return next(); }
  // TODO: error handling
  return res.redirect('/' + (req.body.filter || ''));
}, function(req, res, next) {
  db.run('INSERT INTO todos (owner_id, title, completed) VALUES (?, ?, ?)', [
    req.user.id,
    req.body.title,
    req.body.completed == true ? 1 : null
  ], function(err) {
    if (err) { return next(err); }
    res.json({ title: req.body.title });
  });
});

module.exports = router;
