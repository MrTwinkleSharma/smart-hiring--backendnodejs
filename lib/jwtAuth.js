const passport = require("passport");

const jwtAuth = (req, res, next) => {
  console.log("User request at jwt Auth")

  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err) {
      console.log("Error %j", err)
      return next(err);
    }
    if (!user) {
      res.status(401).json(info);
      return;
    }
    req.user = user;
    console.log("user %j", user)

    next();
  })(req, res, next);
};

module.exports = jwtAuth;
