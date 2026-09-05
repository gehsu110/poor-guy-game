#!/usr/bin/env bash
# Convert the fixed 720×1280 magenta character master to the shared 360×480 alpha canvas.
set -euo pipefail
input_video=${1:?input video required}
output_webp=${2:?output WebP required}
loop_count=${3:-0}
frame_dir=$(mktemp -d)
trap 'rm -rf "$frame_dir"' EXIT
ffmpeg -hide_banner -loglevel error -y -i "$input_video" -vf "crop=720:960:0:160,format=rgba,colorkey=0xff00ff:0.36:0.08,geq=r='r(X,Y)':g='if(lt(alpha(X,Y),250),max(g(X,Y),min(r(X,Y),b(X,Y))),g(X,Y))':b='b(X,Y)':a='alpha(X,Y)',scale=360:480:flags=lanczos,fps=10" -t 5 "$frame_dir/%03d.png"
img2webp -loop "$loop_count" -lossy -q 78 -d 100 "$frame_dir/"*.png -o "$output_webp"
if [ "$loop_count" = 0 ]; then
  cwebp -quiet -q 86 "$frame_dir/001.png" -o "${output_webp%-idle.webp}.webp"
fi
