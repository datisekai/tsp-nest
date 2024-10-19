export function removeCodeFencing(markdownCode: string) {
  // Tách các dòng thành một mảng
  const lines = markdownCode.trim().split('\n');

  // Kiểm tra và loại bỏ dòng đầu và cuối nếu chúng bắt đầu bằng ```
  if (lines[0].startsWith('```')) {
    lines.shift(); // Loại bỏ dòng đầu tiên
  }
  if (lines[lines.length - 1].startsWith('```')) {
    lines.pop(); // Loại bỏ dòng cuối cùng
  }

  // Ghép lại phần code đã được xử lý
  const cleanedCode = lines.join('\n').trim();

  return cleanedCode;
}
