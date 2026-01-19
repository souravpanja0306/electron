exports.inrToWords = (num) => {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
        "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
        "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if (num === 0) return "Zero";
    const convert = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
        return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    };
    let result = "";
    if (num >= 10000000) {
        result += convert(Math.floor(num / 10000000)) + " Crore ";
        num %= 10000000;
    };
    if (num >= 100000) {
        result += convert(Math.floor(num / 100000)) + " Lakh ";
        num %= 100000;
    };
    if (num >= 1000) {
        result += convert(Math.floor(num / 1000)) + " Thousand ";
        num %= 1000;
    };
    if (num > 0) result += convert(num);
    return result.trim() + " Only";
};
