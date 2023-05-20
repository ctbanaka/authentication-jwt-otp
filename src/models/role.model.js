module.exports = function (sequelize, Sequelize) {
  const Role = sequelize.define(
    "ONEVIEW.ROLES",
    {
      ROLE_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ROLE_NAME: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      CREATED_BY: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      MODIFY_BY: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },

    {
      freezeTableName: true,
      createdAt: "CREATED_DATE_TIME",
      updatedAt: "MODIFY_DATE_TIME",
      timestamps: true,
    }
  );
  return Role;
};
