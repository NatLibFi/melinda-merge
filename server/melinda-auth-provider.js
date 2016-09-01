
export const authProvider = {
  validateCredentials: function() {

    return new Promise((resolve, reject) => {
      resolve({
        credentialsValid: true
      });
    });
  }
};
