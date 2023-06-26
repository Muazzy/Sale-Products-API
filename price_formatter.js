function priceFormatter(str) {
    const numberPattern = /[0-9]+([,.][0-9]+)?/;
    const match = str.match(numberPattern);
    if (match) {
        return match[0];
    }
    return "";
}

module.exports = priceFormatter