export default function handler(req, res) {
  if (req.method === "POST") {
    global.messages = [];
    res.status(200).json({ success: true, message: "Chat cleared" });
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
