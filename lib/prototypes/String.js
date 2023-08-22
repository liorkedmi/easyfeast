export const dasherize = function (text) {
  return text.replace(/[_\s]+/g, "-").toLowerCase();
};
