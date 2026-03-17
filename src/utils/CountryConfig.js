// digit rules per country code
export const countryDigitRules = {
  "+1":   10,  // USA/Canada
  "+7":   10,  // Russia
  "+20":  10,  // Egypt
  "+27":  9,   // South Africa
  "+33":  9,   // France
  "+34":  9,   // Spain
  "+39":  10,  // Italy
  "+44":  10,  // UK
  "+49":  11,  // Germany
  "+52":  10,  // Mexico
  "+55":  11,  // Brazil
  "+61":  9,   // Australia
  "+62":  11,  // Indonesia
  "+63":  10,  // Philippines
  "+65":  8,   // Singapore
  "+81":  10,  // Japan
  "+82":  10,  // South Korea
  "+86":  11,  // China
  "+90":  10,  // Turkey
  "+91":  10,  // India
  "+92":  10,  // Pakistan
  "+94":  9,   // Sri Lanka
  "+234": 10,  // Nigeria
  "+254": 9,   // Kenya
  "+971": 9,   // UAE
  "+966": 9,   // Saudi Arabia
};

export const getDigitLimit = (code) => countryDigitRules[code] || 10;