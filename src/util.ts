/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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