const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Statistic = sequelize.define(
  "Statistic",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { en: "", am: "", om: "" },
    },
    description: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: "BriefcaseBusiness",
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      defaultValue: "published",
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "custom",
    },
    authorId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

Statistic.belongsTo(User, { as: "author", foreignKey: "authorId" });

Statistic.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  if (values.authorId) values.author = values.authorId;
  return values;
};

module.exports = Statistic;
