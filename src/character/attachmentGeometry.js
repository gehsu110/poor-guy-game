// Local attachment pivots are shared by SVG, the canvas compositor and motion.
export function attachmentPivot(item) {
  return {
    x: item.x + (item.pivot?.x ?? item.width / 2),
    y: item.y + (item.pivot?.y ?? 60),
  };
}

export function attachmentPoint(item, x, y) {
  const pivot = attachmentPivot(item);
  const angle = (item.angle * Math.PI) / 180;
  return {
    x: pivot.x + (x - pivot.x) * Math.cos(angle) - (y - pivot.y) * Math.sin(angle),
    y: pivot.y + (x - pivot.x) * Math.sin(angle) + (y - pivot.y) * Math.cos(angle),
  };
}
