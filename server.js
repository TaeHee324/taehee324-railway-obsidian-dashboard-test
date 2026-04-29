const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 기본 인증 (선택) — BASIC_USER, BASIC_PASS 환경변수 설정 시 활성화
const BASIC_USER = process.env.BASIC_USER;
const BASIC_PASS = process.env.BASIC_PASS;

if (BASIC_USER && BASIC_PASS) {
  app.use((req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard"');
      return res.status(401).send('인증이 필요합니다.');
    }
    const [type, creds] = auth.split(' ');
    const [user, pass] = Buffer.from(creds, 'base64').toString().split(':');
    if (user === BASIC_USER && pass === BASIC_PASS) return next();
    res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard"');
    return res.status(401).send('인증 실패');
  });
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Dashboard running on port ${PORT}`));
