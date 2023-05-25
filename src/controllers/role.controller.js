const db = require("../models/index");
const ROLE = db.role;

const createRole = async (req, res, next) => {
    const {roleName} =req.body;
    const role =await ROLE.create({ROLE_NAME: roleName});
    res.status(201).send({role:role});
};


const protectedrole = (req, res) => {
    return res.status(200).send(`accessed with token and role`);
  };
module.exports ={ createRole,protectedrole};