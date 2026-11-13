// ==========================================================================
// The Odin Project - Calculator
// Foundations Final Project
// ==========================================================================

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
    return result; // Error message (e.g., division by zero)
  }

  // Round excessively long floating-point results to prevent overflow and 0.1 + 0.2 quirks
  return Math.round((result + Number.EPSILON) * 1e10) / 1e10;
}

// 3. Calculator State Variables
let firstNumber = null;
let operator = null;
let secondNumber = null;
let shouldResetDisplay = false;
let hasError = false;

// 4. DOM Elements
let displayCurrent = null;
let displayHistory = null;
let operatorButtons = [];

// Helper to format operator symbols for presentation
function formatOperator(op) {
  switch (op) {
    case "+": return "+";
    case "-": return "−";
    case "*": return "×";
    case "/": return "÷";
    default: return op;
  }
}

// Highlight currently active operator button
function setActiveOperatorHighlight(activeOp) {
  operatorButtons.forEach((btn) => {
    if (activeOp && btn.dataset.operator === activeOp) {
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }
  });
}

// 5. Display Update Function
function updateDisplay(value, history = null) {
  if (!displayCurrent) return;

  if (hasError) {
    displayCurrent.textContent = value;
    displayCurrent.classList.add("error");
  } else {
    displayCurrent.textContent = value;
    displayCurrent.classList.remove("error");
  }

  if (displayHistory && history !== null) {
    displayHistory.textContent = history;
  }
}

// 6. Digit Input Handler
function inputDigit(digit) {
  if (hasError) {
    clearCalculator();
  }

  if (shouldResetDisplay) {
    displayCurrent.textContent = digit;
    shouldResetDisplay = false;
    // If a calculation was previously completed and user enters a new digit, reset history
    if (operator === null) {
      displayHistory.innerHTML = "&nbsp;";
      firstNumber = null;
    }
  } else {
    if (displayCurrent.textContent === "0") {
      displayCurrent.textContent = digit;
    } else {
      // Prevent unbounded string expansion
      if (displayCurrent.textContent.length < 14) {
        displayCurrent.textContent += digit;
      }
    }
  }

  setActiveOperatorHighlight(null);
}

// 7. Operator Input Handler
function inputOperator(nextOperator) {
  if (hasError) return;

  // If an operator is already active and user has entered a new second number
  if (operator !== null && !shouldResetDisplay) {
    secondNumber = displayCurrent.textContent;
    const result = operate(operator, firstNumber, secondNumber);

    if (typeof result === "string") {
      hasError = true;
      updateDisplay(result);
      displayHistory.textContent = `${firstNumber} ${formatOperator(operator)} ${secondNumber} =`;
      firstNumber = null;
      operator = null;
      secondNumber = null;
      setActiveOperatorHighlight(null);
      return;
    }

    displayCurrent.textContent = String(result);
    firstNumber = String(result);
  } else {
    // Storing the first operand or switching operators consecutively
    if (firstNumber === null || operator === null) {
      firstNumber = displayCurrent.textContent;
    }
  }

  operator = nextOperator;
  shouldResetDisplay = true;
  if (displayHistory) {
    displayHistory.textContent = `${firstNumber} ${formatOperator(operator)}`;
  }
  setActiveOperatorHighlight(operator);
}

// 8. Equals Handler
function handleEquals() {
  if (hasError) return;

  // Pressing equals without a complete operation must not trigger calculation or errors
  if (operator === null || shouldResetDisplay) {
    return;
  }

  secondNumber = displayCurrent.textContent;
  const result = operate(operator, firstNumber, secondNumber);

  if (typeof result === "string") {
    hasError = true;
    updateDisplay(result);
    if (displayHistory) {
      displayHistory.textContent = `${firstNumber} ${formatOperator(operator)} ${secondNumber} =`;
    }
    firstNumber = null;
    operator = null;
    secondNumber = null;
    setActiveOperatorHighlight(null);
    return;
  }

  if (displayHistory) {
    displayHistory.textContent = `${firstNumber} ${formatOperator(operator)} ${secondNumber} =`;
  }
  displayCurrent.textContent = String(result);
  firstNumber = String(result);
  operator = null;
  secondNumber = null;
  shouldResetDisplay = true;
  setActiveOperatorHighlight(null);
}

// 9. Clear Handler
function clearCalculator() {
  firstNumber = null;
  operator = null;
  secondNumber = null;
  shouldResetDisplay = false;
  hasError = false;

  if (displayCurrent) {
    displayCurrent.textContent = "0";
    displayCurrent.classList.remove("error");
  }

  if (displayHistory) {
    displayHistory.innerHTML = "&nbsp;";
  }

  setActiveOperatorHighlight(null);
}

// Initialise DOM and Event Listeners
function init() {
  displayCurrent = document.getElementById("display-current");
  displayHistory = document.getElementById("display-history");
  operatorButtons = Array.from(document.querySelectorAll(".btn-operator"));

  // Digit buttons
  document.querySelectorAll("[data-digit]").forEach((button) => {
    button.addEventListener("click", () => {
      inputDigit(button.dataset.digit);
    });
  });

  // Operator buttons
  operatorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      inputOperator(button.dataset.operator);
    });
  });

  // Equals button
  const equalsButton = document.getElementById("btn-equals");
  if (equalsButton) {
    equalsButton.addEventListener("click", handleEquals);
  }

  // Clear button
  const clearButton = document.getElementById("btn-clear");
  if (clearButton) {
    clearButton.addEventListener("click", clearCalculator);
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}

// Export for Node testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    add,
    subtract,
    multiply,
    divide,
    operate,
    inputDigit,
    inputOperator,
    handleEquals,
    clearCalculator
  };
}
