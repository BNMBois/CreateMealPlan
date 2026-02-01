import express from "express";
import multer from "multer";
import axios from "axios";
import { verifyToken } from "../middleware/auth";
import { db } from "../config/firebase";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/scan",
  verifyToken,
  upload.single("image"),
  async (req: any, res) => {
    const base64 = req.file.buffer.toString("base64");

    const gemini = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: "Extract grocery items with quantities as JSON." },
              {
                inlineData: {
                  mimeType: req.file.mimetype,
                  data: base64,
                },
              },
            ],
          },
        ],
      }
    );

    const text = gemini.data.candidates[0].content.parts[0].text;
    const items = JSON.parse(text.match(/\[.*\]/s)?.[0] || "[]");

    const batch = db.batch();
    items.forEach((item: any) => {
      const ref = db.collection("pantry").doc();
      batch.set(ref, {
        uid: req.user.uid,
        name: item.name,
        quantity: item.quantity ?? 1,
        source: "receipt",
        createdAt: new Date(),
      });
    });

    await batch.commit();
    res.json({ items });
  }
);

export default router;
