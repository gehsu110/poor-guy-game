"""Run with python3 -m unittest discover -s tools -p 'test_character_crop.py'."""

import unittest

from PIL import Image, ImageChops, ImageStat

from export_character_crop import crop_part


class CharacterCropTest(unittest.TestCase):
    layout = {
        "canvas": {"width": 400, "height": 600},
        "head": {"x": 100, "y": 40, "width": 180, "height": 150},
    }

    def test_resized_source_keeps_the_same_landmarks_and_alpha(self):
        original = Image.new("RGBA", (400, 600))
        for y in range(600):
            for x in range(400):
                original.putpixel((x, y), (x // 2, y // 3, 90, 255 if y > 70 else 0))
        expected = crop_part(original, self.layout, "head")
        actual = crop_part(original.resize((200, 300)), self.layout, "head")
        self.assertEqual(actual.size, expected.size)
        background = Image.new("RGBA", expected.size, "white")
        difference = ImageChops.difference(
            Image.alpha_composite(background, actual),
            Image.alpha_composite(background, expected),
        )
        # Allow two 8-bit levels for interpolation at the transparent boundary.
        self.assertLess(max(ImageStat.Stat(difference).mean), 2)
        self.assertEqual(actual.getpixel((70, 10))[3], 0)
        self.assertEqual(actual.getpixel((70, 100))[3], 255)

    def test_different_camera_frame_requires_registration(self):
        with self.assertRaisesRegex(ValueError, "register"):
            crop_part(Image.new("RGBA", (400, 400)), self.layout, "head")

    def test_bad_crop_fails_instead_of_exporting_transparent_padding(self):
        layout = {**self.layout, "head": {"x": 350, "y": 0, "width": 180, "height": 150}}
        with self.assertRaisesRegex(ValueError, "outside"):
            crop_part(Image.new("RGBA", (400, 600)), layout, "head")
