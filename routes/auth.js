const admin = require("firebase-admin");
const express = require("express");
const router = express.Router();

// Firestore 데이터베이스 참조
const db = admin.firestore();

router.post("/partners", async (req, res) => {
  // 필수 파라미터가 전달 되었는지 확인
  if (!req.body.cst_key) {
    res
      .status(400)
      .json({ error: "Invalid request [cst_key]", err_code: "E0001" });
    return;
  }

  try {
    // Firestore에서 유저 key(doc id)로 문서 가지고 오기
    const docRef = db.collection("users").doc(req.body.cst_key);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      res
        .status(404)
        .json({ result_msg: "Document not found", result: "E0002" });
      return;
    }

    const data = docSnapshot.data();
    res.json({
      ...data,
      uid: docSnapshot.id,
      result: "success",
      result_msg: "사용자 인증완료",
    });
  } catch (error) {
    console.error("Error getting document:", error);
    res
      .status(500)
      .json({ result_msg: "Internal server error", result: "E0003" });
  }
});

router.post("/create_password", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({ error: "Invalid request", err_code: "E0001" });
    return;
  }

  try {
    const userCredential = await admin.auth().createUser({
      email: req.body.email,
      password: req.body.password,
    });
    res.json({
      uid: userCredential.uid,
      result: "success",
      result_msg: "비밀번호 생성",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ result_msg: "Internal server error", result: "E0003" });
  }
});

module.exports = router;
