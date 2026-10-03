export function arrivalAge(arrivedAt: number, now = Date.now()) {
  const minutes = Math.floor(Math.max(0, now - arrivedAt) / 60000);
  return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
}
