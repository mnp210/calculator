# Calculator — The Odin Project Foundations

A clean, responsive, and tactile on-screen calculator built with vanilla HTML5, CSS3, and JavaScript as part of The Odin Project Foundations curriculum.

## Overview

This project implements a fully functional calculator replicating classic state-based desktop calculator behavior. It handles basic mathematical operations, chained expressions, floating-point numbers, negative values, and edge cases such as division by zero, all without relying on `eval()`, `new Function()`, or external libraries.

## Technologies Used

- **HTML5**: Semantic document structure with accessibility markup (`aria-label`, `aria-live`, role indicators).
- **CSS3**: Modern Flexbox, CSS Grid, custom properties (CSS variables), tabular typography, and responsive media queries.
- **JavaScript (ES6+)**: Pure vanilla JavaScript following an organized, procedural state-machine architecture.
- **Node.js**: Built-in test runner for automated unit and edge-case verification.

## Features

- **Core Mathematical Operations**: Addition (`+`), subtraction (`−`), multiplication (`×`), and division (`÷`).
- **Chained Calculations**: Automatically evaluates existing operations upon entering a subsequent operator (e.g., `12 + 7 − 1 = 18`).
- **Consecutive Operator Handling**: Seamlessly updates to the most recently selected operator without prematurely evaluating or corrupting state.
- **Division by Zero Protection**: Safely catches zero divisors and displays a short, friendly error message (`Nice try!`) without crashing or freezing.
- **Floating-Point Precision**: Formats long decimal outputs with controlled precision to avoid IEEE 754 quirks (such as `0.1 + 0.2 = 0.30000000000000004`) while stripping superfluous trailing zeros.
- **Extra Credit 1 — Decimal Input (`.`)**: Supports fractional inputs while preventing multiple decimal separators in a single number.
- **Extra Credit 2 — Backspace (`⌫`)**: Deletes the most recent character or decimal point, resetting single digits back to `0` without corrupting operation state.
- **Extra Credit 3 — Full Keyboard Support**: Enables comprehensive numeric and operational input directly from physical keyboards with visual button activation.
- **Dual Display**: Displays the current active operand or calculation result alongside a secondary expression history tracking prior operations.
- **Restrained Dark Theme**: Polished dark UI with clear visual hierarchy, accessible contrast ratios, tactile hover and active states, and full mobile responsiveness.

## Supported Keyboard Shortcuts

| Key | Calculator Action | Description |
| :--- | :--- | :--- |
| `0` – `9` | Digits `0` – `9` | Input numbers |
| `+` | Addition (`+`) | Add operation |
| `-` | Subtraction (`−`) | Subtract operation |
| `*` or `x` / `X` | Multiplication (`×`) | Multiply operation |
| `/` | Division (`÷`) | Divide operation (browser quick-find prevented) |
| `Enter` or `=` | Equals (`=`) | Calculate expression |
| `Backspace` | Backspace (`⌫`) | Delete last entered digit or decimal |
| `Escape` or `Delete` | All Clear (`AC`) | Reset all state variables and display |
| `.` | Decimal (`.`) | Insert decimal separator |

## How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mnp210/calculator.git
   cd calculator
   ```

2. **Open in Browser**:
   - Double-click `index.html` or open it with any modern web browser.
   - Alternatively, serve via a local static file server:
     ```bash
     npx serve .
     # or
     python -m http.server 8080
     ```

3. **Run Automated Tests**:
   Ensure Node.js is installed, then run:
   ```bash
   node tests/calculator.test.js
   ```

## Implementation Details

- **Mathematical Foundations**: Core arithmetic is cleanly isolated into individual functions: `add(a, b)`, `subtract(a, b)`, `multiply(a, b)`, and `divide(a, b)`. The central dispatcher `operate(operator, a, b)` coordinates inputs and performs floating-point stabilization via epsilon-factored rounding.
- **State Representation**: Calculator state is tracked using three distinct primary variables:
  - `firstNumber`: Stores the initial operand or previous calculated result.
  - `operator`: Holds the currently active binary operator.
  - `secondNumber`: Stores the subsequent operand when evaluating expressions.
- **Display Buffer Control**: `shouldResetDisplay` acts as a guard flag allowing subsequent digit presses to either append to an existing input string or start a fresh number following an operator or completed calculation.
- **Event Delegation & DOM Separation**: Logic adheres to unobtrusive JavaScript practices using modern `addEventListener` calls with dataset attributes, leaving markup semantic and clean.
