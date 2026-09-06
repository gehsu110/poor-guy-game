import { createClothMesh } from "../../character/clothMotion.js";

const VERTEX = `
attribute vec2 aPosition;
attribute vec3 aCloth;
attribute vec2 aBody;
uniform vec2 uSize;
uniform vec2 uNeck;
uniform float uTime;
varying vec2 vUV;
void main() {
  vUV = aPosition / uSize;
  vec2 p = aPosition;
  float breeze = (sin(uTime * 1.4 + aCloth.z) + .28 * sin(uTime * 2.6 + aCloth.z)) / 1.28;
  p += aCloth.xy * breeze;
  float breath = sin(uTime * 1.309);
  p.y -= 6.0 * breath * aBody.x;
  float angle = sin(uTime * .88) * .005 * aBody.y;
  vec2 relative = p - uNeck;
  p = uNeck + mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * relative;
  gl_Position = vec4(p.x / uSize.x * 2.0 - 1.0, 1.0 - p.y / uSize.y * 2.0, 0, 1);
}`;

const FRAGMENT = `
precision mediump float;
uniform sampler2D uImage;
varying vec2 vUV;
void main() { gl_FragColor = texture2D(uImage, vUV); }
`;

export function createClothRenderer(canvas, frame, fields, neck, attachment) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const resources = [];
  const dispose = () => {
    for (const [type, resource] of resources) gl[`delete${type}`](resource);
  };
  try {
    const shader = (type, source) => {
      const result = gl.createShader(type);
      resources.push(["Shader", result]);
      gl.shaderSource(result, source);
      gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS))
        throw new Error("Character shader unavailable");
      return result;
    };
    const program = gl.createProgram();
    resources.push(["Program", program]);
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Character animation unavailable");
    gl.useProgram(program);

    const mesh = createClothMesh(frame, fields, attachment);
    const buffer = gl.createBuffer();
    resources.push(["Buffer", buffer]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
    for (const [name, size, offset] of [
      ["aPosition", 2, 0],
      ["aCloth", 3, 2],
      ["aBody", 2, 5],
    ]) {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(
        location,
        size,
        gl.FLOAT,
        false,
        7 * 4,
        offset * 4,
      );
    }
    const index = gl.createBuffer();
    resources.push(["Buffer", index]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
    const texture = gl.createTexture();
    resources.push(["Texture", texture]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.uniform1i(gl.getUniformLocation(program, "uImage"), 0);
    gl.uniform2f(
      gl.getUniformLocation(program, "uSize"),
      frame.width,
      frame.height,
    );
    gl.uniform2f(gl.getUniformLocation(program, "uNeck"), neck[0], neck[1]);
    const time = gl.getUniformLocation(program, "uTime");
    return {
      upload(image) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
      },
      draw(seconds) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(time, seconds);
        gl.drawElements(
          gl.TRIANGLES,
          mesh.indices.length,
          gl.UNSIGNED_SHORT,
          0,
        );
      },
      dispose,
    };
  } catch {
    dispose();
    return null;
  }
}
