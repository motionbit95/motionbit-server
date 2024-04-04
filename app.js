const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// JSON 파싱 미들웨어 추가
app.use(bodyParser.json());

// 모든 도메인에서의 요청을 허용하는 CORS 설정
app.use(cors());

// API 라우트를 설정합니다.
app.use("/api", require("./routes/api"));

// 또는 특정 도메인에서의 요청만 허용하는 경우
// app.use(cors({ origin: 'https://example.com' }));

// Express 서버 시작
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
