import tempfile
import unittest
from pathlib import Path

from upload_policy import safe_upload_path, write_limited_upload


class FakeUpload:
    def __init__(self, body: bytes):
        self.body = body
        self.sent = False

    async def read(self, _size: int) -> bytes:
        if self.sent:
            return b""
        self.sent = True
        return self.body


class UploadPolicyTests(unittest.IsolatedAsyncioTestCase):
    def test_rejects_unsupported_mime_type(self):
        with self.assertRaises(ValueError):
            safe_upload_path("uploads", "application/pdf")

    def test_ignores_untrusted_filename_and_uses_safe_extension(self):
        path = safe_upload_path("uploads", "image/png")
        self.assertEqual(path.parent, Path("uploads"))
        self.assertEqual(path.suffix, ".png")
        self.assertNotIn("..", path.name)

    async def test_removes_partial_file_when_limit_is_exceeded(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "upload.jpg"
            with self.assertRaises(OverflowError):
                await write_limited_upload(FakeUpload(b"123456"), destination, 5)
            self.assertFalse(destination.exists())


if __name__ == "__main__":
    unittest.main()
