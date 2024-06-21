import { read, utils } from 'xlsx';

export function xlsxToJson(bufferBase64: string, sheet: number) {
  const buffer = Buffer.from(bufferBase64, 'base64');
  const workbook = read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[sheet];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = utils.sheet_to_json(worksheet);
  return jsonData;
}
