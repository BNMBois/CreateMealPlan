import { Request, Response } from "express";
import { db } from "../config/firebase";

export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;

    const ref = db.collection("users").doc(userId);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        proteinTarget: 140,
        createdAt: new Date()
      });
    }

    const data = (await ref.get()).data();
    res.status(200).json(data);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
};

export const updateProteinTarget = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;
    const { proteinTarget } = req.body;

    if (
      typeof proteinTarget !== "number" ||
      proteinTarget < 30 ||
      proteinTarget > 300
    ) {
      return res.status(400).json({ error: "Invalid protein target" });
    }

    await db.collection("users").doc(userId).set(
      {
        proteinTarget,
        updatedAt: new Date()
      },
      { merge: true }
    );

    res.status(200).json({
      message: "Protein target updated",
      proteinTarget
    });
  } catch (err) {
    console.error("Update protein target error:", err);
    res.status(500).json({ error: "Failed to update protein target" });
  }
};
