import dayjs from "dayjs";

// Simple function to convert ISO string to human-readable format
export function formatDate(dateString) {
  if (!dateString) return "";
  return dayjs(dateString).format("MMMM D, YYYY");
}
