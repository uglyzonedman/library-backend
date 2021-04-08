const response = ({ data = null, message = null, error = false }) => {
  return {
    success: !error,
    data,
    message,
  };
};

export default response;
