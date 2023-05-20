const db = require("../models/index");
const ROLE = db.role;

const createRole = async (req, res, next) => {
    const {roleName} =req.body;
    const role =await ROLE.create({ROLE_NAME: roleName});
    res.status(201).send({role:role});
};

module.exports ={ createRole};