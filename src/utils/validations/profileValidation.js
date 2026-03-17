import { validateEmail } from "./emailValidation";
import { getDigitLimit } from "../CountryConfig";

export const validateProfile = (formData) => {
  const errors = {};

  // Name
  if (!formData.name.trim()) {
    errors.name = "Full name is required";
  } else if (formData.name.trim().length < 3) {
    errors.name = "Full name must be at least 3 characters";
  }

  // Email
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  // Country Code
  if (!formData.countryCode) {
    errors.countryCode = "Please select a country code";
  }

  // Contact
  const digitLimit = getDigitLimit(formData.countryCode);  // ← now works
  if (!formData.contact.trim()) {
    errors.contact = "Contact number is required";
  } else if (!/^\d+$/.test(formData.contact)) {
    errors.contact = "Only digits are allowed";
  } else if (formData.contact.length !== digitLimit) {
    errors.contact = `Enter a valid ${digitLimit}-digit number for selected country`;
  }

  // Company
  if (!formData.company.trim()) {
    errors.company = "Company name is required";
  }

  // Address
  if (!formData.address.trim()) {
    errors.address = "Address is required";
  }

  // Customers ← fixed, no .trim() on number
  if (!formData.customers) {
    errors.customers = "Number of customers is required";
  } else if (formData.customers < 0) {
    errors.customers = "Cannot be a negative number";
  }

  // Currency ← fixed, no .trim() on select value
  if (!formData.currency) {
    errors.currency = "Currency is required";
  }

  return errors;
};