// The Odin Project - Calculator
// Foundations Final Project

// 1. Basic Mathematical Functions
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    return "Nice try!";
  }
  return a / b;
}

// 2. Operate Function
function operate(operator, a, b) {
  const numA = Number(a);
  const numB = Number(b);

  if (isNaN(numA) || isNaN(numB)) {
    return null;
  }

  let result;
  switch (operator) {
    case "+":
      result = add(numA, numB);
      break;
    case "-":
    case "−":
      result = subtract(numA, numB);
      break;
    case "*":
    case "×":
      result = multiply(numA, numB);
      break;
    case "/":
    case "÷":
      result = divide(numA, numB);
      break;
    default:
      return null;
  }

  if (typeof result === "string") {
    return result;
  }

  // Round excessively long floating-point results to prevent display overflow and 0.1 + 0.2 quirks
  return Math.round((result + Number.EPSILON) * 1e10) / 1e10;
}

// Export for Node unit testing if applicable
if (typeof module !== "undefined" && module.exports) {
  module.exports = { add, subtract, multiply, divide, operate };
}
