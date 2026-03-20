const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
  'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
  'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
  'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const toWords = (num) => {
  if (num === 0) return 'Zero';

  if (num < 20) return ones[num];

  if (num < 100)
    return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');

  if (num < 1000)
    return ones[Math.floor(num / 100)] + ' Hundred' +
      (num % 100 ? ' ' + toWords(num % 100) : '');

  if (num < 100000)
    return toWords(Math.floor(num / 1000)) + ' Thousand' +
      (num % 1000 ? ' ' + toWords(num % 1000) : '');

  if (num < 10000000)
    return toWords(Math.floor(num / 100000)) + ' Lakh' +
      (num % 100000 ? ' ' + toWords(num % 100000) : '');

  return toWords(Math.floor(num / 10000000)) + ' Crore' +
    (num % 10000000 ? ' ' + toWords(num % 10000000) : '');
};

export const numberToWords = (amount) => {
  if (!amount && amount !== 0) return '';

  const num    = parseFloat(amount.toFixed(2));
  const rupees = Math.floor(num);
  const paise  = Math.round((num - rupees) * 100);

  let result = toWords(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + toWords(paise) + ' Paise';
  result += ' Only';

  return result;
};