const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Announcement = sequelize.define(
  "Announcement",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { en: "", am: "", om: "" },
    },
    summary: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    content: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "General",
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      defaultValue: "draft",
    },
    date: {
      type: DataTypes.STRING,
      defaultValue: () => new Date().toISOString().split("T")[0],
    },
    referenceNo: {
      type: DataTypes.STRING,
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

Announcement.belongsTo(User, { as: "author", foreignKey: "authorId" });

Announcement.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  if (values.authorId) values.author = values.authorId;
  return values;
};

module.exports = Announcement;
