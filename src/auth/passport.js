const passport = require('passport');
const passportJWT = require('passport-jwt');
const db = require('../models/index');
const USER= db.user;
const ROLE= db.role;
const SECRET_KEY= process.env.SECRET_KEY;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

 
const options = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY,
};

 let strategy= new JWTStrategy(options, async (jwtPayload, done) => {
    try {
      const user = await USER.findOne({
        include: [{
            model: ROLE,
            attributes: ['ROLE_ID', 'ROLE_NAME'] 
          }],
        where: {
          USER_ID: jwtPayload.userId,
        },
      });
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  });


passport.use(strategy);

const authorize = function (allowedRoles) {
    return async function (req, res, next) {
      try {
        console.log("in authorization", req.user)
        if (!req.user && !allowedRoles.includes(req.user.role)) {
          res.status(403).json({ message: 'Forbidden' });
        } else {
          next();
        }
      } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    };
  };
  

module.exports = {
  authenticate: passport.authenticate('jwt', { session: false }),
  authorize,
};
