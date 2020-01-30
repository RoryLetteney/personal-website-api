module.exports = {
  verifyString: string => {
    if (typeof string !== "string") return false;
    if (string && !string.trim()) return false;

    return true;
  },
  verifyNumber: input => {
    if (typeof input !== "number" && !/^\d+$/.test(input)) return false;

    return true;
  }
};
