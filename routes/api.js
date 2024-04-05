const admin = require("firebase-admin");
const express = require("express");
const serviceAccount = require("../serviceAccountKey.json"); // Firebase 프로젝트 설정 파일
const router = express.Router();

// Firebase Admin SDK 초기화
admin.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  credential: admin.credential.cert(serviceAccount),
});

// Firestore 데이터베이스 참조
const db = admin.firestore();

router.get("", async (req, res) => {
  res.send("Hello, World!");
});

router.post("/addNumber", async (req, res) => {
  console.log(req.body.num1, req.body.num2);
  const result = req.body.num1 + req.body.num2;
  res.send({ result });
});

// Express 라우트 예제
router.get("/users", async (req, res) => {
  try {
    const users = await admin.auth().listUsers(); // Firebase Authentication에서 사용자 목록 가져오기
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

// 특정 콜렉션의 특정 문서 가져오기
router.get(
  "/collection/:collectionName/document/:documentId",
  async (req, res) => {
    const { collectionName, documentId } = req.params;
    console.log(collectionName, documentId);

    try {
      // Firestore에서 해당 콜렉션과 문서를 참조하여 데이터 가져오기
      const docRef = db.collection(collectionName).doc(documentId);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      const data = docSnapshot.data();
      res.json({ document: { ...data, uid: docSnapshot.id } });
    } catch (error) {
      console.error("Error getting document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// 모든 콜렉션 이름 가져오는 함수
async function getAllCollections() {
  const collections = await db.listCollections();
  const collectionNames = collections.map((collection) => collection.id);
  return collectionNames;
}

// 모든 콜렉션 이름을 클라이언트에게 응답하는 엔드포인트
router.get("/collections", async (req, res) => {
  try {
    const collectionNames = await getAllCollections();
    res.json(collectionNames);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).send("Error fetching collections");
  }
});

// 전체 필드 리스트를 가져오는 엔드포인트
router.get("/getAllFields/:collectionName", async (req, res) => {
  const { collectionName } = req.params;
  try {
    // Firestore 쿼리 작성
    const snapshot = await db.collection(collectionName).get();

    // 필드 리스트 초기화
    const allFields = [];

    // 쿼리 결과 처리
    snapshot.forEach((doc) => {
      const data = doc.data();
      const fields = Object.keys(data); // 문서의 모든 필드를 가져옴
      allFields.push(...fields);
    });

    // 중복 필드 제거
    const uniqueFields = [...new Set(allFields)];

    res.json(uniqueFields);
  } catch (error) {
    console.error("Error getting documents", error);
    res.status(500).json({ error: "Error getting documents" });
  }
});

// 콜렉션 내의 문서 필드를 검색하여 반환하는 엔드포인트
router.get("/search/:collectionName/:fieldName", async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const fieldName = req.params.fieldName;
    const fieldValue = req.query.fieldValue;

    // fieldValue가 한글을 포함하면 디코딩하여 처리
    const decodedValue = decodeURIComponent(fieldValue);
    console.log(collectionName + ", " + fieldName + ", " + decodedValue);

    // Firestore 쿼리 작성
    const snapshot = await db.collection(collectionName.toString()).get();

    // 쿼리 결과 처리
    const documents = [];
    snapshot.forEach((doc) => {
      if (fieldName) {
        console.log(doc.data()[fieldName].includes(decodedValue));
        if (doc.data()[fieldName].includes(decodedValue))
          documents.push(doc.data());
      }
    });
    console.log(documents);
    res.json(documents);
  } catch (error) {
    console.error("Error getting documents", error);
    res.status(500).json({ error: "Error getting documents" });
  }
});

// 특정 콜렉션의 모든 문서를 반환하는 엔드포인트
router.get("/search/:collectionName", async (req, res) => {
  try {
    const collectionName = req.params.collectionName;

    // Firestore 쿼리 작성
    const snapshot = await db.collection(collectionName).get();

    // 쿼리 결과 처리
    const documents = [];
    snapshot.forEach((doc) => {
      documents.push(doc.data());
    });

    res.json(documents);
  } catch (error) {
    console.error("Error getting documents", error);
    res.status(500).json({ error: "Error getting documents" });
  }
});

module.exports = router;
