"use strict";

class Calculator {
  constructor() {
    this.input = document.querySelector(".input");
    this.clearButton = document.querySelector("button[data-clear]");
    this.deleteButton = document.querySelector("button[data-delete]");
    this.invertButton = document.querySelector("button[data-invert]");
    this.numberButtons = document.querySelectorAll("button[data-number]");
    this.operationButtons = document.querySelectorAll("button[data-operation]");

    this.floatMode = false;
    this.cancelMode = false;

    this.accumulator = 0;

    this.bindHandlers();
  }

  append(symbol) {
    let text = this.input.textContent;

    if (symbol === ",") {
      if (!this.floatMode) {
        this.floatMode = true;
      } else {
        return;
      }
    }

    this.value = text + symbol;

    text = this.floatMode ? text + symbol : this.value;

    this.input.textContent = text;
  }

  delete() {
    let text = this.input.textContent;

    if (text[text.length - 1] === ",") {
      this.floatMode = false;
    }

    text = text.slice(0, text.length - 1);
    this.value = text;

    this.input.textContent = text || this.value;
  }

  invert() {
    this.value = -this.value;
    this.input.textContent = String(this.value).replace(".", ",");
  }

  clear() {
    this.value = 0;
    this.input.textContent = "0";
    this.floatMode = false;
  }

  set value(value) {
    this.accumulator = Number(String(value).replace(",", "."));
  }

  get value() {
    return this.accumulator;
  }

  bindHandlers() {
    for (const button of this.numberButtons) {
      button.onclick = (e) => {
        this.append(e.target.textContent);
      };
    }

    for (const button of this.operationButtons) {
      button.onclick = (e) => {
        console.log(e.target.textContent);
        console.log(e.target.textContent.length);
      };
    }

    this.invertButton.onclick = this.invert.bind(this);
    this.clearButton.onclick = this.clear.bind(this);
    this.deleteButton.onclick = this.delete.bind(this);
  }
}

new Calculator();
