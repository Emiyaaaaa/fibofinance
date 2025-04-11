export function transformDate(date: Date, format?: string) {
  if (!format) return date.toLocaleString();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const dateString = format
    .replace("YYYY", year.toString())
    .replace("YY", year.toString().slice(2))
    .replace("MON", date.toLocaleString("en-US", { month: "long" }))
    .replace("MM", month.toString())
    .replace("DD", day.toString())
    .replace("HH", hour.toString().padStart(2, "0"))
    .replace("mm", minute.toString().padStart(2, "0"))
    .replace("ss", second.toString().padStart(2, "0"));

  return dateString;
}
