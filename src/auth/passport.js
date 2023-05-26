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
            attributes: ['ROLE_NAME']
          }],
        where: {
          USER_ID: jwtPayload.userId,
        },
        attributes: ['USER_ID', 'EMAIL_ID','IS_VERIFIED'],
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
        console.log("in authorization", req.user.ONEVIEW_ROLE.ROLE_NAME);
        if (req.user && allowedRoles.includes(req.user.ONEVIEW_ROLE.ROLE_NAME)) {
          next();
        } else {
          res.status(403).json({ message: 'Forbidden' });
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
