#!/bin/bash
# 下載 Higgsfield 生成的外觀圖到 assets

DIR="$(dirname "$0")/src/assets/academy-art/generated/outfits"
mkdir -p "$DIR"

declare -A IMGS=(
  ["girl-crystal-gown"]="https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260621_034232_fcc287af-9cb7-4f1e-b3a9-55f5ce083808.png"
  ["girl-starcloak"]="https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260621_034238_057f2cc3-b41f-44d1-866a-00625ec50299.png"
  ["girl-suit"]="https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260621_034245_c888e0de-41cf-4bcf-b1b6-42d3f6c3b8b8.png"
  ["girl-mint-coat"]="https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260621_032731_3ba02fe8-a98e-47e8-a67f-d039e88515ba.png"
  ["boy-base"]="https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260621_034414_03b890f7-8e1f-4a07-a016-dacb7c5b5d96.png"
  ["boy-crystal-gown"]="https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260621_034809_8f9b2f5e-4b27-43b1-a165-e7a27462e9fc.png"
  ["boy-starcloak"]="https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260621_034815_953e0df6-5c32-41ab-a027-041e2557639a.png"
  ["boy-suit"]="https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260621_034821_df9e1958-2d22-4b95-86db-6d37672fc045.png"
)

for name in "${!IMGS[@]}"; do
  echo -n "下載 ${name}.png ... "
  curl -s -o "$DIR/${name}.png" "${IMGS[$name]}" && echo "✓" || echo "✗"
done

echo ""
echo "完成！圖片在：$DIR"
