const passport = require('passport');
const passportJWT = require('passport-jwt');
const db = require('../models/index');
const USER= db.user;
const ROLE= db.role;
const jwt = require('jsonwebtoken');
const SECRET_KEY= process.env.SECRET_KEY;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// TO BE IMPLEMENT
let emp;

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
      emp=user;
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  });


passport.use(strategy);

const authorize = (allowedRoles) => {
    return async (req, res, next) => {
      try {
        console.table("emp=================",emp);
        const token = req.headers['authorization'];
        console.log("in authorize req****", token);
        let tokenWithoutBearer;
  
        if (token && token.startsWith('Bearer ')) {
          tokenWithoutBearer = token.substring(7);
        } else {
          return res.status(401).send({ message: "Invalid token format" });
        }

        const decoded = await jwt.verify(tokenWithoutBearer,SECRET_KEY);
        console.table(decoded);
        const { role } = decoded;

        if (!allowedRoles.includes(role)) {
          return res.status(403).json({ error: 'Forbidden' });
        }
  
        next();
      } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    };
  };
  

module.exports = {
  authenticate: passport.authenticate('jwt', { session: false }),
  authorize,
};
