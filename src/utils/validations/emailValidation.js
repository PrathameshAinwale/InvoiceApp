// list of blocked temporary/fake email domains
const blockedDomains = [
  "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
  "throwam.com", "yopmail.com", "trashmail.com", "fakeinbox.com",
  "sharklasers.com", "guerrillamailblock.com", "grr.la", "guerrillamail.info",
  "guerrillamail.biz", "guerrillamail.de", "guerrillamail.net", "guerrillamail.org",
  "spam4.me", "bccto.me", "chacuo.net", "dispostable.com", "disposemail.com",
  "discard.email", "spamgourmet.com", "spamgourmet.net", "spamgourmet.org",
  "maildrop.cc", "mailnull.com", "spamoff.de", "tempinbox.com", "throwam.com",
  "filzmail.com", "owlpic.com", "tempsky.com", "temp-mail.org", "tempr.email",
  "discard.email", "spambog.com", "spamfree24.org", "spamspot.com",
  "mt2014.com", "mt2015.com", "mytempemail.com", "nwytg.com",
  "objectmail.com", "obobbo.com", "odaymail.com", "cool.fr.nf",
];

// only these domains are allowed
const allowedDomains = [
  "gmail.com", "outlook.com", "hotmail.com", "yahoo.com",
  "icloud.com", "protonmail.com", "live.com", "msn.com",
  "rediffmail.com", "zoho.com",
];

export const validateEmail = (email) => {
  // 1. empty check
  if (!email.trim()) {
    return "Email is required";
  }

  // 2. basic format check
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Enter a valid email format";
  }

  // 3. must have @ and domain
  const parts = email.toLowerCase().split("@");
  if (parts.length !== 2) {
    return "Enter a valid email address";
  }

  const domain = parts[1];

  // 4. check if domain is in blocked list
  if (blockedDomains.includes(domain)) {
    return "Temporary or fake email addresses are not allowed";
  }

  // 5. check if domain is in allowed list
  if (!allowedDomains.includes(domain)) {
    return `Only these email providers are allowed: ${allowedDomains.join(", ")}`;
  }

  return ""; // no error
};