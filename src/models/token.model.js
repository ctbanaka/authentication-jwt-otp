module.exports = function (sequelize, Sequelize) {
    const token = sequelize.define(
      "ONEVIEW.TOKEN",
      {
        TOKEN_ID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        TOKEN: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        // for future use
        expirationTime: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
          // for future use
        isExpired: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
    return token;
  };