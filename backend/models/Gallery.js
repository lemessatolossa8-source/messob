const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Gallery = sequelize.define(
  "Gallery",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    description: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    image: {
      type: DataTypes.STRING(2000),
      allowNull: false,
      defaultValue: "",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      defaultValue: "published",
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: User, key: "id" },
    },
  },
  {
    tableName: "gallery",
    timestamps: true,
  }
);

Gallery.belongsTo(User, { as: "author", foreignKey: "authorId" });

Gallery.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = Gallery;
