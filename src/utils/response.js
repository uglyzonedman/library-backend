const response = (data = null, message = null) => {
  return {
    success: data !== null && message === null,
    data,
    message,
  };
};

export default response;
