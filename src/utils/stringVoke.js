export default (fn, args = "") =>
  "(" + fn.toString() + `)(${JSON.stringify(args)})`;
