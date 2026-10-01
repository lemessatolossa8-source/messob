import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateUrl,
  validateLength,
  validateImage,
  validateMultilingual,
} from "./validation";

/**
 * Validate news/announcement form
 */
export function validateNewsForm(formData, isPublishing = false) {
  const errors = {};

  // Title validation (multilingual)
  const titleErrors = validateMultilingual(
    formData.title,
    "Title",
    { isPublished: isPublishing, requiredLanguages: ["om"] }
  );
  if (titleErrors) {
    Object.assign(errors, titleErrors);
  }

  // Category is required
  const categoryError = validateRequired(formData.category, "Category");
  if (categoryError) {
    errors.category = categoryError;
  }

  // Summary validation (optional but validate if provided)
  if (isPublishing) {
    const summaryErrors = validateMultilingual(
      formData.summary,
      "Summary",
      { isPublished: true, requiredLanguages: ["om"] }
    );
    if (summaryErrors) {
      Object.keys(summaryErrors).forEach(lang => {
        errors[`summary_${lang}`] = summaryErrors[lang];
      });
    }
  }

  // Image validation (optional)
  if (formData.image) {
    const imageError = validateImage(formData.image);
    if (imageError) {
      errors.image = imageError;
    }
  }

  // If publishing, require at least summary or content in primary language
  if (isPublishing) {
    const hasSummary = formData.summary?.om?.trim() || formData.summary?.am?.trim() || formData.summary?.en?.trim();
    const hasContent = formData.content?.om?.trim() || formData.content?.am?.trim() || formData.content?.en?.trim();
    
    if (!hasSummary && !hasContent) {
      errors.content_om = "Please provide either a summary or content before publishing.";
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validate project form
 */
export function validateProjectForm(formData, isPublishing = false) {
  const errors = {};

  // Title validation
  const titleErrors = validateMultilingual(
    formData.title,
    "Project Title",
    { isPublished: isPublishing, requiredLanguages: ["om"] }
  );
  if (titleErrors) {
    Object.assign(errors, titleErrors);
  }

  // Location is required
  if (!formData.location || !formData.location.trim()) {
    errors.location = "Project location is required.";
  }

  // Budget validation (optional)
  if (formData.budget) {
    const budget = parseFloat(formData.budget);
    if (isNaN(budget) || budget < 0) {
      errors.budget = "Please enter a valid budget amount.";
    }
  }

  // Image validation
  if (formData.image) {
    const imageError = validateImage(formData.image);
    if (imageError) {
      errors.image = imageError;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validate service form
 */
export function validateServiceForm(formData) {
  const errors = {};

  // Title validation
  const titleErrors = validateMultilingual(
    formData.title,
    "Service Name",
    { requiredLanguages: ["om"] }
  );
  if (titleErrors) {
    Object.assign(errors, titleErrors);
  }

  // Description validation
  const descErrors = validateMultilingual(
    formData.description,
    "Description",
    { requiredLanguages: ["om"] }
  );
  if (descErrors) {
    Object.keys(descErrors).forEach(lang => {
      errors[`description_${lang}`] = descErrors[lang];
    });
  }

  // Link validation (optional)
  if (formData.link && formData.link.trim()) {
    const linkError = validateUrl(formData.link, false);
    if (linkError) {
      errors.link = linkError;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validate contact form
 */
export function validateContactForm(formData) {
  const errors = {};

  // Name required
  const nameError = validateRequired(formData.name, "Name");
  if (nameError) {
    errors.name = nameError;
  }

  // Email validation
  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }

  // Phone validation
  const phoneError = validatePhone(formData.phone, true);
  if (phoneError) {
    errors.phone = phoneError;
  }

  // Message required and minimum length
  const messageError = validateRequired(formData.message, "Message");
  if (messageError) {
    errors.message = messageError;
  } else {
    const lengthError = validateLength(formData.message, { min: 10, max: 1000 }, "Message");
    if (lengthError) {
      errors.message = lengthError;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Helper to check if form has any errors
 */
export function hasErrors(errors) {
  return errors && Object.keys(errors).length > 0;
}

/**
 * Helper to get first error message
 */
export function getFirstError(errors) {
  if (!errors || Object.keys(errors).length === 0) return null;
  return Object.values(errors)[0];
}
