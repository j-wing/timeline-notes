import { INDENT_LENGTH } from './NoteLine'

export function computeIndentString(units: number): string {
    /*eslint no-array-constructor: "error"*/
    return new Array(units * INDENT_LENGTH)
        .fill(" ")
        .join("");
}

export function removeIndent(str: string): string {
    if (str.slice(0, INDENT_LENGTH - 1).trim().length === 0) {
        return str.slice(INDENT_LENGTH);
    }
    
    return str;
}