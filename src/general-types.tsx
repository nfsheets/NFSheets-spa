export interface Spreadsheet {
  [cellId: string]: Cell;
}

export interface Cell {
  value: string;
  attributes: CellAttributes;
}

export interface CellAttributes {
  font: string;
  color: string;
  [otherAttributeName: string]: string;
}
