module.exports = function (sequelize, Sequelize) {
  const Otp = sequelize.define(
    "ONEVIEW_OTPS",
    {
      OTP_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      OTP: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // for future use if needed
      expirationTime: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
        // for future use if needed
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
  return Otp;
};
