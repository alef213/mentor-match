export const SESSION_CAPACITY = 2;
export const SESSION_TIME = "4:30 PM – 7:00 PM";

export function getUpcomingThursdays(count = 6): string[] {
  const dates: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);

  // Move to nearest Thursday (today if Thursday, otherwise next one)
  const daysUntil = (4 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + daysUntil);

  while (dates.length < count) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
    d.setDate(d.getDate() + 7);
  }

  return dates;
}
