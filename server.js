const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// GitHub 설정 (Railway 환경변수로 주입)
const SERVER_CONFIG = {
  owner:     process.env.GITHUB_OWNER     || '',
  repo:      process.env.GITHUB_REPO      || '',
  branch:    process.env.GITHUB_BRANCH    || 'master',
  token:     process.env.GITHUB_TOKEN     || '',
  vaultPath: process.env.VAULT_PATH       || '',
};

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
    const [, creds] = auth.split(' ');
    const [user, pass] = Buffer.from(creds, 'base64').toString().split(':');
    if (user === BASIC_USER && pass === BASIC_PASS) return next();
    res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard"');
    return res.status(401).send('인증 실패');
  });
}

// index.html 요청 시 서버 config 주입
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');
  const injection = `<script>window.__SERVER_CONFIG = ${JSON.stringify(SERVER_CONFIG)};</script>`;
  html = html.replace('<head>', '<head>\n' + injection);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Dashboard running on port ${PORT}`));
