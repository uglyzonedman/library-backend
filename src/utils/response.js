/**
 * @param {object} entry
 * @param {any} [entry.data]
 * @param {string} [entry.message]
 * @param {boolean} [entry.error]
 */
const response = ({ data = null, message = null, error = false }) => {
  return {
    success: !error,
    data,
    message,
  };
};

export default response;
