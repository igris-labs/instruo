import type { JsonFold } from "./json-folds";

export interface CodeRow {
  line: number;
  foldEnd?: number;
}
export interface HighlightRequest {
  type: "document";
  version: number;
  source: string;
  language: string;
  foldable: boolean;
}
export type HighlightResponse =
  | { type: "result"; version: number; lines: string[]; folds?: JsonFold[] }
  | { type: "error"; version: number };
