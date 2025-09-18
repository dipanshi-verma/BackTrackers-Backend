import LostItem from "../models/LostItem.js";
import FoundItem from "../models/FoundItem.js";

// Search Items (Lost + Found)
export const searchItems = async (req, res) => {
  try {
    const { query } = req.query;
    const lostItems = await LostItem.find({
      title: { $regex: query, $options: "i" },
    });
    const foundItems = await FoundItem.find({
      title: { $regex: query, $options: "i" },
    });
    res.json({ lostItems, foundItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const lost = await LostItem.find();
    const found = await FoundItem.find();
    res.json({ lost, found });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
