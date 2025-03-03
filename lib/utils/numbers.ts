// Persian numbers: ۰۱۲۳۴۵۶۷۸۹
// English numbers: 0123456789
export function convertPersianToEnglish(str: string): string {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return str.replace(/[۰-۹]/g, char => persianNumbers.indexOf(char).toString())
} 