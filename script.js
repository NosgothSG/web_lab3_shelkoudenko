"use strict";

const MAX_LENGTH = 15;

class Calculator {
  constructor() {
    this.input = document.querySelector(".input");
    this.clearButton = document.querySelector("button[data-clear]");
    this.deleteButton = document.querySelector("button[data-delete]");
    this.invertButton = document.querySelector("button[data-invert]");
    this.equalsButton = document.querySelector("button[data-equals]");
    this.numberButtons = document.querySelectorAll("button[data-number]");
    this.operationButtons = document.querySelectorAll("button[data-operation]");

    this.numberButtonsCaptions = [...this.numberButtons].map((b) => b.textContent);
    this.operationButtonsCaptions = [...this.operationButtons].map((b) =>
      b.getAttribute("data-symbol")
    );

    this.floatMode = false;
    this.waitingForOperand = true;
    this.clearAll = true;
    this.canDelete = true;
    this.error = false;

    this.operation = "";
    this.accumulator = 0;
    this.firstOperand = null;

    this.bindHandlers();
  }

  set value(value) {
    this.accumulator = Number(String(value).replace(",", "."));
  }

  get value() {
    return this.accumulator;
  }

  set output(value) {
    this.input.textContent =
      String(value).length > MAX_LENGTH
        ? String(Number(value.toPrecision(MAX_LENGTH))).replace(".", ",")
        : String(value).replace(".", ",");
  }

  get output() {
    return this.input.textContent;
  }

  append(symbol) {
    if (this.error) {
      return;
    }

    if (this.waitingForOperand) {
      this.output = symbol === "," ? "0" : "";
      this.waitingForOperand = false;
    }

    if (this.clearAll) {
      this.clearAllValues();
      this.clearAll = false;
    }

    let text = this.output;

    if (text.length === MAX_LENGTH) {
      return;
    }

    if (symbol === ",") {
      if (!this.floatMode) {
        this.floatMode = true;
      } else {
        return;
      }
    }

    this.value = text + symbol;

    text = this.floatMode ? text + symbol : this.value;

    this.output = text;

    this.canDelete = true;
    this.equalsButton.focus();
  }

  invert() {
    if (this.error) {
      return;
    }

    this.value = -this.value;
    this.output = this.value;
  }

  delete() {
    if (!this.canDelete) {
      return;
    }

    let text = this.output;

    if (text[text.length - 1] === ",") {
      this.floatMode = false;
    }

    text = text.slice(0, text.length - 1);

    if (text.length === 1 && text === "-") {
      text = "0";
    }

    this.value = text;
    this.output = text || this.value;
  }

  clear() {
    this.clearAllValues();
    this.releaseOperationButtons();
    this.output = "0";
    this.operation = "";
    this.error = false;
  }

  operate(operation) {
    if (this.error) {
      return;
    }

    if (this.firstOperand !== null) {
      this.equals();
    }

    this.waitingForOperand = true;
    this.clearAll = false;
    this.floatMode = false;
    this.operation = operation;
    this.firstOperand === null && (this.firstOperand = this.value);
    this.value !== this.firstOperand && (this.value = this.firstOperand);
  }

  equals() {
    if (this.error) {
      return;
    }

    let result = this.value;

    if (this.operation === "+") {
      result = this.firstOperand + this.value;
    } else if (this.operation === "-") {
      result = this.firstOperand - this.value;
    } else if (this.operation === "*") {
      result = this.firstOperand * this.value;
    } else if (this.operation === "/") {
      result = this.firstOperand / this.value;
    }

    console.log(this.firstOperand, this.operation, this.value, "=", result);

    if (
      isNaN(result) ||
      !isFinite(result) ||
      String(result).length > MAX_LENGTH ||
      result > Number.MAX_SAFE_INTEGER ||
      result < Number.MIN_SAFE_INTEGER
    ) {
      result = "Error";
      this.error = true;
    }

    this.output = result;
    this.firstOperand = result;

    this.inputBlink();

    this.canDelete = false;
    this.waitingForOperand = true;
    this.clearAll = true;
  }

  clearAllValues() {
    this.value = 0;
    this.firstOperand = null;
    this.floatMode = false;
  }

  select(button) {
    if (this.error && button !== this.clearButton) {
      return;
    }

    button.classList.add("active");
  }

  deselect(button) {
    button.classList.remove("active");
  }

  setActive(button) {
    this.select(button);

    setTimeout(() => {
      this.deselect(button);
    }, 50);
  }

  releaseOperationButtons() {
    for (const button of this.operationButtons) {
      this.deselect(button);
    }
  }

  inputBlink() {
    const saveText = this.output;
    this.output = "";

    setTimeout(() => {
      this.output = saveText;
    }, 50);
  }

  bindHandlers() {
    for (const button of this.numberButtons) {
      button.onclick = () => {
        this.append(button.textContent);
      };
    }

    for (const button of this.operationButtons) {
      button.onclick = () => {
        this.releaseOperationButtons();
        this.select(button);
        this.operate(button.getAttribute("data-symbol"));
      };
    }

    this.invertButton.onclick = this.invert.bind(this);
    this.clearButton.onclick = this.clear.bind(this);
    this.deleteButton.onclick = this.delete.bind(this);
    this.equalsButton.onclick = () => {
      this.equals();
      this.releaseOperationButtons();
    };
  }
}

const calculator = new Calculator();

window.addEventListener("keyup", (e) => {
  if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", ","].includes(e.key)) {
    const key = e.key === "." ? "," : e.key;
    const index = calculator.numberButtonsCaptions.findIndex((i) => i === key);
    calculator.setActive(calculator.numberButtons[index]);

    calculator.append(key);
  } else if (e.code === "KeyI") {
    calculator.setActive(calculator.invertButton);

    calculator.invert();
  } else if (["+", "-", "*", "/"].includes(e.key)) {
    const index = calculator.operationButtonsCaptions.findIndex((i) => i === e.key);
    calculator.releaseOperationButtons();
    calculator.select(calculator.operationButtons[index]);

    calculator.operate(e.key);
  } else if (e.code === "Escape") {
    calculator.setActive(calculator.clearButton);

    calculator.clear();
  } else if (e.code === "Backspace") {
    calculator.setActive(calculator.deleteButton);

    calculator.delete();
  } else if (e.key === "=") {
    calculator.setActive(calculator.equalsButton);

    calculator.equals();
    calculator.releaseOperationButtons();
  } else if (["Enter"].includes(e.code)) {
    calculator.setActive(calculator.equalsButton);

    if (document.activeElement !== calculator.equalsButton) {
      calculator.equals();
      calculator.releaseOperationButtons();
    }
  }
});
