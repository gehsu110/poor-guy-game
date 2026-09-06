function decodeImage(src) {
  const image = new Image();
  image.src = src;
  return image.decode().then(() => image);
}

// Failed requests are not cached. A subsequent mount or outfit change can retry.
// Share in-flight decodes between the main character, portrait and inspector.
export function createCharacterImageLoader(decode = decodeImage) {
  const images = new Map();
  return (sources) =>
    Promise.all(
      [...new Set(sources.filter(Boolean))].map((src) => {
        if (!images.has(src)) {
          const request = Promise.resolve()
            .then(() => decode(src))
            .catch((error) => {
              images.delete(src);
              throw error;
            });
          images.set(src, request);
        }
        return images.get(src);
      }),
    );
}

export const loadCharacterImages = createCharacterImageLoader();
