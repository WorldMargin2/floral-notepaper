import type { UndoManager } from "./Undo";

export interface IndentResult {
  result: string;
  firstLineIndentBlankCount: number;
}

export function indentLine(line: string, indent: string): string {
  let blankCount = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === " ") {
      blankCount++;
    } else {
      break;
    }
  }
  const nowLevel = blankCount / indent.length;
  return indent.repeat(nowLevel + 1) + line.slice(blankCount);
}

export function outdentLine(line: string, indent: string): string {
  let blankCount = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === " ") {
      blankCount++;
    } else {
      break;
    }
  }
  if (blankCount >= indent.length) {
    return line.slice(indent.length);
  }
  return line;
}

export function indentText(lines: string[], indent: string): IndentResult {
  const firstLineIndentBlankCount = indentLine(lines[0], indent).length - lines[0].length;
  return {
    result: lines.map((line) => indentLine(line, indent)).join("\n"),
    firstLineIndentBlankCount,
  };
}

export function outdentText(lines: string[], indent: string): IndentResult {
  const firstLineIndentBlankCount = outdentLine(lines[0], indent).length - lines[0].length;
  return {
    result: lines.map((line) => outdentLine(line, indent)).join("\n"),
    firstLineIndentBlankCount,
  };
}

export function handleIndent(
  textarea: HTMLTextAreaElement,
  setContent: (v: string) => void,
  markDirty: () => void,
  undoManager?: UndoManager,
) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const before = value.slice(0, start);
  const after = value.slice(end);
  const selected = value.slice(start, end);
  const lineStart = before.lastIndexOf("\n") + 1;
  const currentLine = before.slice(lineStart);

  const indent = "    ";
  let result: string;
  let cursorStart: number;
  let cursorEnd: number;

  if (selected.includes("\n")) {
    const tmp_lines = selected.split("\n");
    tmp_lines[0] = currentLine + tmp_lines[0];
    const tmp_indent = indentText(tmp_lines, indent);
    result = before.slice(0, lineStart) + tmp_indent.result + after;
    cursorStart = start + indent.length;
    cursorEnd = cursorStart + tmp_indent.result.length - indent.length - currentLine.length;
  } else {
    const lineEnd = value.indexOf("\n", start);
    const fullLine = lineEnd === -1 ? value.slice(lineStart) : value.slice(lineStart, lineEnd);
    const indentedLine = indentLine(fullLine, indent);
    const delta = indentedLine.length - fullLine.length;
    result =
      value.slice(0, lineStart) + indentedLine + (lineEnd === -1 ? "" : value.slice(lineEnd));
    const selectionInLine = start - lineStart;
    cursorStart = lineStart + delta + selectionInLine;
    cursorEnd = cursorStart + (end - start);
  }

  if (undoManager) {
    undoManager.addByValue(result);
  }

  setContent(result);
  markDirty();
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(cursorStart, cursorEnd);
  });
}

export function handleOutdent(
  textarea: HTMLTextAreaElement,
  setContent: (v: string) => void,
  markDirty: () => void,
  undoManager?: UndoManager,
) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const before = value.slice(0, start);
  const after = value.slice(end);
  const selected = value.slice(start, end);
  const lineStart = before.lastIndexOf("\n") + 1;
  const currentLine = before.slice(lineStart);

  const indent = "    ";
  let result: string;
  let cursorStart: number;
  let cursorEnd: number;

  if (selected.includes("\n")) {
    const tmp_lines = selected.split("\n");
    tmp_lines[0] = currentLine + tmp_lines[0];
    const tmp_outdent = outdentText(tmp_lines, indent);
    const outdentBlankCount = tmp_outdent.firstLineIndentBlankCount;
    result = before.slice(0, lineStart) + tmp_outdent.result + after;
    cursorStart = start + outdentBlankCount;
    cursorEnd = cursorStart + tmp_outdent.result.length - outdentBlankCount - currentLine.length;
  } else {
    const lineEnd = value.indexOf("\n", start);
    const line = lineEnd === -1 ? value.slice(lineStart) : value.slice(lineStart, lineEnd);
    const outdented = outdentLine(line, indent);
    const delta = line.length - outdented.length;
    result = value.slice(0, lineStart) + outdented + (lineEnd === -1 ? "" : value.slice(lineEnd));
    const selectionInLine = start - lineStart;
    cursorStart = lineStart - delta + selectionInLine;
    cursorEnd = cursorStart + (end - start);
  }

  if (undoManager) {
    undoManager.addByValue(result);
  }

  setContent(result);
  markDirty();
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(cursorStart, cursorEnd);
  });
}
