interface Step {
  range: [number, number];
  original: string;
  replacement: string;
}

interface UndoResult {
  delta: number;
  selectionStart: number;
  selectionEnd: number;
}

export class UndoManager {
  private maxSteps = 50;
  private steps: Step[] = [];
  private index = -1;
  text = "";

  private _enabled = true;
  set enabled(value: boolean) {
    this._enabled = value;
  }
  get enabled() {
    return this._enabled;
  }

  //用于设置按钮的状态
  get canUndo() {
    return this.index >= 0;
  }
  get canRedo() {
    return this.index < this.steps.length - 1;
  }
  undo(): UndoResult {
    if (this.index < 0 || !this._enabled) return { delta: 0, selectionStart: 0, selectionEnd: 0 };
    const step = this.steps[this.index];
    this.text =
      this.text.slice(0, step.range[0]) +
      step.original +
      this.text.slice(step.range[0] + step.replacement.length);
    this.index--;
    const delta = step.original.length - step.replacement.length;
    return {
      delta,
      selectionStart: step.range[0],
      selectionEnd: step.range[0] + step.original.length,
    };
  }

  redo(): UndoResult {
    if (this.index >= this.steps.length - 1 || !this._enabled)
      return { delta: 0, selectionStart: 0, selectionEnd: 0 };
    const step = this.steps[++this.index];

    this.text =
      this.text.slice(0, step.range[0]) +
      step.replacement +
      this.text.slice(step.range[0] + step.original.length);

    const delta = step.replacement.length - step.original.length;
    return {
      delta,
      selectionStart: step.range[0],
      selectionEnd: step.range[0] + step.replacement.length,
    };
  }

  addByValue(newValue: string): void {
    if (!this._enabled) return;
    const normalizedValue = newValue.replace("\r\n", "\n"); //解决因为换行符变化导致意外的结果

    if (this.text === normalizedValue) return;

    const oldValue = this.text;
    //找到公共前缀和后缀
    //夹在公共前缀和后缀之间的部分就是需要替换的部分
    let prefixLen = 0;
    while (
      prefixLen < oldValue.length &&
      prefixLen < normalizedValue.length &&
      oldValue[prefixLen] === normalizedValue[prefixLen]
    ) {
      prefixLen++;
    }

    let suffixLen = 0;
    while (
      suffixLen < oldValue.length - prefixLen &&
      suffixLen < normalizedValue.length - prefixLen &&
      oldValue[oldValue.length - 1 - suffixLen] ===
        normalizedValue[normalizedValue.length - 1 - suffixLen]
    ) {
      suffixLen++;
    }

    const start = prefixLen;
    const end = oldValue.length - suffixLen;

    const original = oldValue.slice(start, end);
    const replacement = normalizedValue.slice(start, normalizedValue.length - suffixLen);

    if (this.index < this.steps.length - 1) {
      this.steps.length = this.index + 1;
    }

    if (this.steps.length >= this.maxSteps) {
      this.steps.shift();
      this.index--;
    }

    this.steps.push({ range: [start, end], original, replacement });
    this.index = this.steps.length - 1;

    this.text = normalizedValue;
  }

  reset(): void {
    this.steps = [];
    this.index = -1;
  }
}
