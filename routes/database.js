const express = require("express");
const router = express.Router();

// 모든 콜렉션 이름을 클라이언트에게 응답하는 엔드포인트
router.post("/collections", async (req, res) => {
  try {
    console.log(req.body);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).send("Error fetching collections");
  }
});

module.exports = router;
