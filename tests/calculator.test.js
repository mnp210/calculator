// Automated Test Suite for Calculator
// The Odin Project Foundations

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Mocking minimal browser DOM environment for Node.js
function setupDOM() {
  const elements = {};

  function createElement(tag, attrs = {}) {
    return {
      tagName: tag.toUpperCase(),
      attributes: { ...attrs },
      dataset: { ...attrs.dataset },
      textContent: attrs.textContent || "",
      innerHTML: attrs.innerHTML || "",
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      listeners: {},
      addEventListener(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
      },
      click() {
        if (this.listeners["click"]) {
          this.listeners["click"].forEach(fn => fn({ target: this }));
        }
      }
    };
  }

  // Create required elements
  elements["display-current"] = createElement("div", { textContent: "0" });
  elements["display-history"] = createElement("div", { innerHTML: "&nbsp;" });
  elements["btn-clear"] = createElement("button", { dataset: { action: "clear" } });
  elements["btn-backspace"] = createElement("button", { dataset: { action: "backspace" } });
  elements["btn-equals"] = createElement("button", { dataset: { action: "equals" } });
  elements["btn-decimal"] = createElement("button", { dataset: { action: "decimal" } });

  // Operator buttons
  const operators = ["+", "-", "*", "/"];
  const opButtons = operators.map(op => {
    const btn = createElement("button", { dataset: { operator: op } });
    btn.classList.add("btn-operator");
    return btn;
  });

  // Digit buttons
  const digitButtons = {};
  for (let i = 0; i <= 9; i++) {
    digitButtons[i] = createElement("button", { dataset: { digit: String(i) } });
    digitButtons[i].classList.add("btn-digit");
  }

  const windowListeners = {};

  global.document = {
    readyState: "complete",
    getElementById(id) {
      return elements[id] || null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-digit]") {
        return Object.values(digitButtons);
      }
      if (selector === ".btn-operator") {
        return opButtons;
      }
      return [];
    },
    querySelector(selector) {
      const digitMatch = selector.match(/\[data-digit="(\d)"\]/);
      if (digitMatch) return digitButtons[digitMatch[1]];
      const opMatch = selector.match(/\[data-operator="([^"]+)"\]/);
      if (opMatch) return opButtons.find(b => b.dataset.operator === opMatch[1]);
      return null;
    },
    addEventListener(event, fn) {}
  };

  global.window = {
    addEventListener(event, fn) {
      if (!windowListeners[event]) windowListeners[event] = [];
      windowListeners[event].push(fn);
    },
    dispatchKeyboard(e) {
      if (windowListeners["keydown"]) {
        windowListeners["keydown"].forEach(fn => fn(e));
      }
    }
  };

  return { elements, digitButtons, opButtons, windowListeners };
}

// Run test suite
function runTests() {
  const dom = setupDOM();
  const calc = require("../script.js");

  console.log("=== 1. Testing Core Math Functions ===");
  assert.strictEqual(calc.add(3, 5), 8, "add(3, 5) should equal 8");
  assert.strictEqual(calc.subtract(9, 4), 5, "subtract(9, 4) should equal 5");
  assert.strictEqual(calc.multiply(6, 7), 42, "multiply(6, 7) should equal 42");
  assert.strictEqual(calc.divide(8, 2), 4, "divide(8, 2) should equal 4");
  assert.strictEqual(calc.divide(8, 0), "Nice try!", "divide(8, 0) should return snarky error");
  console.log("✓ Core math functions passed");

  console.log("=== 2. Testing operate() Helper ===");
  assert.strictEqual(calc.operate("+", 3, 5), 8);
  assert.strictEqual(calc.operate("-", 9, 4), 5);
  assert.strictEqual(calc.operate("−", 9, 4), 5);
  assert.strictEqual(calc.operate("*", 6, 7), 42);
  assert.strictEqual(calc.operate("×", 6, 7), 42);
  assert.strictEqual(calc.operate("/", 8, 2), 4);
  assert.strictEqual(calc.operate("÷", 8, 2), 4);
  assert.strictEqual(calc.operate("/", 8, 0), "Nice try!");
  assert.strictEqual(calc.operate("+", 0.1, 0.2), 0.3, "Floating point precision 0.1 + 0.2");
  assert.strictEqual(calc.operate("-", 5, 9), -4, "Negative result handling");
  console.log("✓ operate() helper passed");

  console.log("=== 3. Testing Basic Operations via UI ===");
  calc.clearCalculator();
  // 3 + 5 = 8
  calc.inputDigit("3");
  calc.inputOperator("+");
  calc.inputDigit("5");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "8", "3 + 5 = 8");

  // 9 - 4 = 5
  calc.clearCalculator();
  calc.inputDigit("9");
  calc.inputOperator("-");
  calc.inputDigit("4");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "5", "9 - 4 = 5");

  // 6 * 7 = 42
  calc.clearCalculator();
  calc.inputDigit("6");
  calc.inputOperator("*");
  calc.inputDigit("7");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "42", "6 * 7 = 42");

  // 8 / 2 = 4
  calc.clearCalculator();
  calc.inputDigit("8");
  calc.inputOperator("/");
  calc.inputDigit("2");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "4", "8 / 2 = 4");
  console.log("✓ Basic operations via UI passed");

  console.log("=== 4. Testing Chained Operations ===");
  // 12 + 7 - 1 = 18
  calc.clearCalculator();
  calc.inputDigit("1");
  calc.inputDigit("2");
  calc.inputOperator("+");
  calc.inputDigit("7");
  calc.inputOperator("-"); // intermediate 19
  assert.strictEqual(dom.elements["display-current"].textContent, "19", "Intermediate 12 + 7 = 19");
  calc.inputDigit("1");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "18", "12 + 7 - 1 = 18");

  // 5 * 3 + 2 = 17
  calc.clearCalculator();
  calc.inputDigit("5");
  calc.inputOperator("*");
  calc.inputDigit("3");
  calc.inputOperator("+"); // intermediate 15
  assert.strictEqual(dom.elements["display-current"].textContent, "15", "Intermediate 5 * 3 = 15");
  calc.inputDigit("2");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "17", "5 * 3 + 2 = 17");

  // 20 / 4 * 2 = 10
  calc.clearCalculator();
  calc.inputDigit("2");
  calc.inputDigit("0");
  calc.inputOperator("/");
  calc.inputDigit("4");
  calc.inputOperator("*"); // intermediate 5
  assert.strictEqual(dom.elements["display-current"].textContent, "5", "Intermediate 20 / 4 = 5");
  calc.inputDigit("2");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "10", "20 / 4 * 2 = 10");
  console.log("✓ Chained operations passed");

  console.log("=== 5. Testing Edge Cases ===");
  // Consecutive operators (12 + - 5 = 7)
  calc.clearCalculator();
  calc.inputDigit("1");
  calc.inputDigit("2");
  calc.inputOperator("+");
  calc.inputOperator("-"); // Should update operator to -, not calculate
  assert.strictEqual(dom.elements["display-current"].textContent, "12", "Consecutive operator should retain 12");
  calc.inputDigit("5");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "7", "12 - 5 = 7 after replacing + with -");

  // Equals with incomplete input (12 = should do nothing)
  calc.clearCalculator();
  calc.inputDigit("1");
  calc.inputDigit("2");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "12", "Equals without operator retains 12");

  // Equals after operator without second operand (12 + = should do nothing)
  calc.inputOperator("+");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "12", "Equals without second operand retains 12");

  // Repeated equals
  calc.inputDigit("3");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "15", "12 + 3 = 15");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "15", "Repeated equals does not recalculate");

  // New digit after completed calculation replaces displayed result
  calc.inputDigit("4");
  assert.strictEqual(dom.elements["display-current"].textContent, "4", "New digit replaces previous result");

  // Negative results (3 - 8 = -5)
  calc.clearCalculator();
  calc.inputDigit("3");
  calc.inputOperator("-");
  calc.inputDigit("8");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "-5", "Negative result 3 - 8 = -5");

  // Division by zero
  calc.clearCalculator();
  calc.inputDigit("9");
  calc.inputOperator("/");
  calc.inputDigit("0");
  calc.handleEquals();
  assert.strictEqual(dom.elements["display-current"].textContent, "Nice try!", "Division by zero shows snarky message");
  assert.strictEqual(dom.elements["display-current"].classList.contains("error"), true, "Error class is set");

  // Recovery with clear
  calc.clearCalculator();
  assert.strictEqual(dom.elements["display-current"].textContent, "0", "Recovery resets display to 0");
  assert.strictEqual(dom.elements["display-current"].classList.contains("error"), false, "Error class is removed");

  console.log("✓ Edge cases passed");

  console.log("=== 6. Testing Decimal & Backspace ===");
  // Multiple decimals prevented
  calc.clearCalculator();
  calc.inputDigit("3");
  calc.inputDecimal();
  calc.inputDigit("1");
  calc.inputDecimal(); // Attempt duplicate decimal
  calc.inputDigit("4");
  assert.strictEqual(dom.elements["display-current"].textContent, "3.14", "Duplicate decimal ignored");

  // Decimal starting from 0
  calc.clearCalculator();
  calc.inputDecimal();
  calc.inputDigit("5");
  assert.strictEqual(dom.elements["display-current"].textContent, "0.5", "Decimal starting with 0");

  // Backspace normal digit
  calc.clearCalculator();
  calc.inputDigit("1");
  calc.inputDigit("2");
  calc.inputDigit("3");
  calc.handleBackspace();
  assert.strictEqual(dom.elements["display-current"].textContent, "12", "Backspace removes last digit");

  // Backspace deleting decimal
  calc.inputDecimal();
  assert.strictEqual(dom.elements["display-current"].textContent, "12.", "Decimal added");
  calc.handleBackspace();
  assert.strictEqual(dom.elements["display-current"].textContent, "12", "Backspace deletes decimal");

  // Backspace on single digit reverts to 0
  calc.clearCalculator();
  calc.inputDigit("7");
  calc.handleBackspace();
  assert.strictEqual(dom.elements["display-current"].textContent, "0", "Backspace on single digit reverts to 0");

  // Backspace on 0 does not corrupt
  calc.handleBackspace();
  assert.strictEqual(dom.elements["display-current"].textContent, "0", "Backspace on 0 remains 0");
  console.log("✓ Decimal & Backspace passed");

  console.log("=== 7. Testing Keyboard Events ===");
  calc.clearCalculator();
  const triggerKey = (key) => {
    let prevented = false;
    global.window.dispatchKeyboard({
      key,
      preventDefault: () => { prevented = true; }
    });
  };

  triggerKey("4");
  triggerKey("5");
  assert.strictEqual(dom.elements["display-current"].textContent, "45", "Key 4 and 5 pressed");
  triggerKey("+");
  triggerKey("5");
  triggerKey("Enter");
  assert.strictEqual(dom.elements["display-current"].textContent, "50", "Key + 5 Enter gives 50");
  triggerKey("Escape");
  assert.strictEqual(dom.elements["display-current"].textContent, "0", "Escape key clears calculator");

  // Additional keyboard keys: -, *, /, Backspace, ., Delete
  triggerKey("9");
  triggerKey("-");
  triggerKey("4");
  triggerKey("=");
  assert.strictEqual(dom.elements["display-current"].textContent, "5", "Key 9 - 4 = gives 5");

  triggerKey("*");
  triggerKey("6");
  triggerKey("Enter");
  assert.strictEqual(dom.elements["display-current"].textContent, "30", "Key * 6 Enter gives 30");

  triggerKey("/");
  triggerKey("5");
  triggerKey("Enter");
  assert.strictEqual(dom.elements["display-current"].textContent, "6", "Key / 5 Enter gives 6");

  triggerKey("1");
  triggerKey("2");
  triggerKey("Backspace");
  assert.strictEqual(dom.elements["display-current"].textContent, "1", "Backspace key deletes last char");

  triggerKey(".");
  triggerKey("5");
  assert.strictEqual(dom.elements["display-current"].textContent, "1.5", "Decimal key adds point");

  triggerKey("Delete");
  assert.strictEqual(dom.elements["display-current"].textContent, "0", "Delete key clears calculator");

  console.log("✓ Keyboard events passed");
  console.log("\n==========================================");
  console.log("ALL TESTS PASSED SUCCESSFULLY! (100% PASS)");
  console.log("==========================================");
}

runTests();
