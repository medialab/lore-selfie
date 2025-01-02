


/**
 * Format a number so that it is more legible
 * @param {number} n
 * @param {string} style='fr'
 * @returns {string}
 */
export const formatNumber = (n: Number, style: String  = 'fr'): String => {
  if (+n === 0) {
    return '0';
  }
  return ('' + n)
    .split('')
    .reverse()
    .reduce(({ count, result }, digit, index) => {
      const endOfLine = count === 3 || (count === 0 && index === ('' + n).length - 1);
      if (endOfLine) {
        return {
          count: 1,
          result: [...result, style === 'fr' ? '\u00A0' : ',', digit]
        }
      } else return {
        count: count + 1,
        result: [...result, digit]
      }

    }, {
      count: 0,
      result: []
    })
    .result
    .reverse()
    .join('')
}