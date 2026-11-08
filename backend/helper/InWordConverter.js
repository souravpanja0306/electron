// Indian-system amount in words: 1,23,45,678.50 -> "One Crore Twenty Three Lakh ... and Fifty Paise Only".
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
    "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const belowThousand = (n) => {
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
    return ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + belowThousand(n % 100) : "");
};

// Whole number in words, e.g. 150000 -> "One Lakh Fifty Thousand".
const integerToWords = (num) => {
    if (num === 0) return "Zero";
    const parts = [];
    const crore = Math.floor(num / 10000000);
    if (crore) parts.push(`${integerToWords(crore)} Crore`); // handles 100+ crore
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
    num %= 1000;
    if (num) parts.push(belowThousand(num));
    return parts.join(" ");
};

module.exports.inrToWords = (value) => {
    const amount = Math.abs(Math.round((Number(value) || 0) * 100)) / 100;
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    let words = integerToWords(rupees);
    if (paise) words += ` and ${belowThousand(paise)} Paise`;
    return `${words} Only`;
};
