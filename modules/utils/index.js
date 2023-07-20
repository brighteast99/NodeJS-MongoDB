/**
 *
 * @param {Date} date
 * @param {*} options
 * @returns yyyy. M. d AM/PM h:m
 */
module.exports.formatDate = (
  date,
  options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }
) => {
  const formatter = new Intl.DateTimeFormat("ko-KR", options);
  return formatter.format(date);
};

/**
 *
 * @param {Date} date
 * @param {*} options
 * @returns yyyy-MM-dd
 */
module.exports.formatInputDate = (
  date,
  options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }
) => {
  const formatter = new Intl.DateTimeFormat("ko-KR", options);
  return formatter.format(date).replaceAll(". ", "-").slice(0, -1);
};
