import { transformDate } from "@/utils/transformDate";

function Time(props: { date?: Date | null; format?: string }) {
  if (!props.date) return null;

  return transformDate(props.date, props.format);
}

export default Time;
