/**
 * Converts an array of objects to a CSV string.
 * @param data The array of objects to convert.
 * @returns The CSV string.
 */
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        let field =
          obj[header] === null || obj[header] === undefined
            ? ""
            : String(obj[header]);
        // Escape quotes by doubling them
        field = field.replace(/"/g, '""');
        // Enclose fields containing commas, quotes, or newlines in double quotes
        if (/[",\n]/.test(field)) {
          field = `"${field}"`;
        }
        return field;
      })
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Triggers a browser download for the given CSV string.
 * @param filename The name of the file to download.
 * @param csvData The CSV data string.
 */
export function exportToCsv(filename: string, data: any[]) {
  const csvString = convertToCSV(data);
  if (!csvString) {
    console.warn("No data to export.");
    return;
  }

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  if (link.download !== undefined) {
    // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
