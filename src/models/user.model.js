
module.exports = function (sequelize, Sequelize) {

    const User = sequelize.define('ONEVIEW.USER', {
        USER_ID: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        EMAIL_ID: {   
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        
        PASSWORD:{
            type: Sequelize.STRING,
            allowNull:false,
        },

        isVERIFIED: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull:false,
          },

        CREATED_BY: {
            type: Sequelize.STRING
        },

        MODIFY_BY:{
            type: Sequelize.STRING
        }
         

    },{
        freezeTableName: true,
        createdAt: "CREATED_DATE_TIME",
        updatedAt: "MODIFY_DATE_TIME",
        timestamps: true,
      });

    return User;
}

