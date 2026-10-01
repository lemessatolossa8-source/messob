const User = require("../models/User");

// @desc   Get all users (admin only)
// @route  GET /api/users
const getAllUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
  res.json({ success: true, data: users.map((u) => u.toJSON()) });
};

// @desc   Get single user (admin only)
// @route  GET /api/users/:id
const getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user.toJSON() });
};

// @desc   Update user role or status (admin only)
// @route  PUT /api/users/:id
const updateUser = async (req, res) => {
  const { role, isActive, name } = req.body;
  const update = {};
  if (role) update.role = role;
  if (isActive !== undefined) update.isActive = isActive;
  if (name) update.name = name;

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  await user.update(update);

  res.json({ success: true, message: "User updated", data: user.toJSON() });
};

// @desc   Delete user (admin only)
// @route  DELETE /api/users/:id
const deleteUser = async (req, res) => {
  const currentUserId = req.user.id || req.user._id;

  // Prevent self-deletion
  if (String(req.params.id) === String(currentUserId)) {
    return res.status(400).json({ success: false, message: "You cannot delete your own account" });
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  await user.destroy();

  res.json({ success: true, message: "User deleted" });
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
