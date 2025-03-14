function transformDate(date: Date, format?: string) {
  if (!format) return date.toLocaleString();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours() + 1;
  const minute = date.getMinutes() + 1;
  const second = date.getSeconds() + 1;

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

function Time(props: { date?: Date | null; format?: string }) {
  if (!props.date) return null;

  return transformDate(props.date, props.format);
}

export default Time;
