export const showStart = (s) => {
  if (!s) return 0;
  let t = String(s.startTime || "00:00").match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
  if (!t) return 0;
  let h = +t[1];
  if (t[3]) h = (h % 12) + (t[3].toUpperCase() === "PM" ? 12 : 0);
  return Date.parse(
    `${String(s.showDate).slice(0, 10)}T${String(h).padStart(2, "0")}:${t[2]}:00+05:30`,
  );
};
