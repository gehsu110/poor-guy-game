import layout from "../../character/wind-rig-layout.json";

export function createCharacterTexture(outfit, attachment, images) {
  const { canvas: frame, head } = layout;
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 2048 / frame.height);
  canvas.width = Math.round(frame.width * scale);
  canvas.height = Math.round(frame.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Character composition unavailable");

  function draw(blink = false) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(canvas.width / frame.width, canvas.height / frame.height);
    context.drawImage(
      images.get(outfit.poster),
      0,
      0,
      frame.width,
      frame.height,
    );

    context.save();
    context.translate(head.x, head.y);
    context.globalCompositeOperation = "destination-out";
    context.fill(new Path2D(outfit.headClip));
    context.globalCompositeOperation = "source-over";
    context.clip(new Path2D(outfit.headClip));
    context.drawImage(images.get(outfit.head), 0, 0, head.width, head.height);
    if (blink && images.has(outfit.blink)) {
      context.beginPath();
      for (const [x, y, rx, ry, angle] of outfit.eyes) {
        context.moveTo(
          x + rx * Math.cos((angle * Math.PI) / 180),
          y + rx * Math.sin((angle * Math.PI) / 180),
        );
        context.ellipse(x, y, rx, ry, (angle * Math.PI) / 180, 0, 2 * Math.PI);
        context.closePath();
      }
      context.clip();
      context.drawImage(
        images.get(outfit.blink),
        0,
        0,
        head.width,
        head.height,
      );
    }
    context.restore();

    if (attachment) {
      const { x, y, width, height, angle, src, handInFront } = attachment;
      context.save();
      context.translate(x + width / 2, y + 60);
      context.rotate((angle * Math.PI) / 180);
      context.drawImage(images.get(src), -width / 2, -60, width, height);
      context.restore();
      if (handInFront) {
        context.save();
        context.clip(new Path2D(outfit.hand));
        context.drawImage(
          images.get(outfit.poster),
          0,
          0,
          frame.width,
          frame.height,
        );
        context.restore();
      }
    }
    return canvas;
  }
  return { canvas, draw };
}
