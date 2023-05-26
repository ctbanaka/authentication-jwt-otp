const dbConfig = require("../config/config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

// const sequelize = new Sequelize('process.env.DB_URL', {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//   },
// });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.user = require("./user.model.js")(sequelize, Sequelize);
db.role= require("./role.model.js")(sequelize, Sequelize);
db.otp= require("./otp.model.js")(sequelize,Sequelize);
db.token= require("./token.model.js")(sequelize,Sequelize);

//association
db.role.hasMany(db.user,{foreignKey:"ROLE_ID", sourceKey: 'ROLE_ID'});
db.user.belongsTo(db.role,{foreignKey:"ROLE_ID", targetKey: 'ROLE_ID'});

db.user.hasMany(db.otp,{foreignKey:"USER_ID"});
db.otp.belongsTo(db.user,{foreignKey:"USER_ID"});

db.user.hasMany(db.token,{foreignKey:"USER_ID"});
db.token.belongsTo(db.user,{foreignKey:"USER_ID"});

module.exports = db;
