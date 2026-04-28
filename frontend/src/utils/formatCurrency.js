/**
 * Formats a number as Vietnamese Dong (VND) currency.
 * @param {number} value - The numerical value to format.
 * @returns {string} - The formatted currency string.
 */
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value || 0);
};

export default formatCurrency;
