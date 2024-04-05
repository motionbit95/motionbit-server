const admin = require("firebase-admin");
const express = require("express");
const serviceAccount = require("../serviceAccountKey.json"); // Firebase 프로젝트 설정 파일
const router = express.Router();

// Firestore 데이터베이스 참조
const db = admin.firestore();

router.post("/isPartners", async (req, res) => {
  // 필수 파라미터가 전달 되었는지 확인
  if (!req.body.cst_key) {
    res
      .status(400)
      .json({ error: "Invalid request [cst_key]", err_code: "E0001" });
    return;
  }
  if (!req.body.cst_id) {
    res
      .status(400)
      .json({ error: "Invalid request [cst_id]", err_code: "E0001" });
    return;
  }

  try {
    // Firestore에서 유저 key(doc id)로 문서 가지고 오기
    const docRef = db.collection("users").doc(req.body.cst_key);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      res.status(404).json({ error: "Document not found", err_code: "E0002" });
      return;
    }

    const data = docSnapshot.data();
    res.json({ ...data, uid: docSnapshot.id });
  } catch (error) {
    console.error("Error getting document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
