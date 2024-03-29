require('dotenv').config();
const express = require("express");
const app = express();
const routes = require("./src/routes/auth.routes")
const cors = require("cors");
const passport = require("passport");
const swaggerApp = require('./swagger');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin:"*" })); // allow all as of now, will change later
app.use(passport.initialize());

const db = require("./src/models");

db.sequelize.sync({ force: true }).then(() => {
  console.log("re-synced db.");
});

app.use("/",routes);

app.use("/", swaggerApp);


// Start server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
