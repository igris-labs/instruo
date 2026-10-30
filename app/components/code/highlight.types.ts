import type { JsonFold } from "./json-folds";

export interface CodeRow {
  line: number;
  foldEnd?: number;
}
export interface CodeWindow {
  key: string;
  rows: CodeRow[];
}
export type HighlightRequest =
  | {
      type: "document";
      version: number;
      source: string;
      language: string;
      foldable: boolean;
      window: CodeWindow;
    }
  | { type: "viewport"; version: number; window: CodeWindow };
export type HighlightResponse =
  | { type: "result"; version: number; key: string; lines: string[]; folds?: JsonFold[] }
  | { type: "error"; version: number };
