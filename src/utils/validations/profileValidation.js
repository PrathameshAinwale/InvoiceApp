import { validateEmail } from "./emailValidation";
import { getDigitLimit } from "../CountryConfig";

export const validateProfile = (formData) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Full name is required";
  } else if (formData.name.trim().length < 3) {
    errors.name = "Full name must be at least 3 characters";
  }

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  if (!formData.countryCode) {
    errors.countryCode = "Please select a country code";
  }

  const digitLimit = getDigitLimit(formData.countryCode);
  if (!formData.contact.trim()) {
    errors.contact = "Contact number is required";
  } else if (!/^\d+$/.test(formData.contact)) {
    errors.contact = "Only digits are allowed";
  } else if (formData.contact.length !== digitLimit) {
    errors.contact = `Enter a valid ${digitLimit}-digit number for selected country`;
  }

  if (!formData.company.trim()) {
    errors.company = "Company name is required";
  }

  if (!formData.address.trim()) {
    errors.address = "Address is required";
  }

  if (!formData.currency) {
    errors.currency = "Currency is required";
  }

  return errors;
};  