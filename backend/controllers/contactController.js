const Contact = require("../models/Contact");
const { sendContactInquiryEmail } = require("../config/email");

// @desc   Submit a contact message (public)
// @route  POST /api/contact
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required",
      });
    }

    // 1. Save inquiry to database
    const contact = await Contact.create({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : null,
      subject: String(subject).trim(),
      message: String(message).trim(),
    });

    // 2. Dispatch email notification to configured recipient (lemessatolossa8@gmail.com)
    try {
      const emailResult = await sendContactInquiryEmail({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message,
        contactId: contact.id,
      });

      return res.status(201).json({
        success: true,
        message: "Your inquiry has been submitted and delivered successfully.",
        data: contact.toJSON(),
        emailDelivered: true,
        recipient: emailResult.recipient,
      });
    } catch (emailError) {
      console.error("[CONTACT CONTROLLER] Email dispatch failed:", emailError.message);
      return res.status(502).json({
        success: false,
        message: "Your message was recorded in our database, but email delivery to the municipal desk failed. Please try again or contact us directly.",
        error: emailError.message,
        data: contact.toJSON(),
      });
    }
  } catch (err) {
    console.error("[CONTACT CONTROLLER] Database or server error:", err);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while processing your message.",
      error: err.message,
    });
  }
};

// @desc   Get all contact messages (admin only)
// @route  GET /api/contact
const getAllContacts = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status && status !== "all") where.status = status;

  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(page, 10);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows, count: total } = await Contact.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parsedLimit,
    offset,
  });

  res.json({
    success: true,
    data: {
      items: rows.map((item) => item.toJSON()),
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      currentPage: parsedPage,
    },
  });
};

// @desc   Get single contact message (admin only)
// @route  GET /api/contact/:id
const getContactById = async (req, res) => {
  const item = await Contact.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Contact message not found" });
  }
  res.json({ success: true, data: item.toJSON() });
};

// @desc   Update contact message status (admin only)
// @route  PUT /api/contact/:id
const updateContact = async (req, res) => {
  const { status } = req.body;
  const item = await Contact.findByPk(req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: "Contact message not found" });
  }

  await item.update({ status });

  res.json({ success: true, message: "Contact status updated", data: item.toJSON() });
};

// @desc   Delete contact message (admin only)
// @route  DELETE /api/contact/:id
const deleteContact = async (req, res) => {
  const item = await Contact.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Contact message not found" });
  }

  await item.destroy();

  res.json({ success: true, message: "Contact message deleted" });
};

module.exports = {
  submitContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
};
