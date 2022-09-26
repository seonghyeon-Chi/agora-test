const express = require('express');
const cors = require('cors')
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
require('dotenv').config()

const PORT = process.env.PORT || 8080;
const APP_ID = process.env.APP_ID;
const APP_PW = process.env.APP_PW;

const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'DELETE']
}))


const noCache = (_, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next()
}

const generateRTCToken = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')

  const channelName = req.query.channel;
  if (!channelName) {
    next()
  }

  let uid = req.query.uid;
  if (!uid || uid === '') {
    next()
  }

  let role;
  if (req.query.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  } else if (req.query.role === 'subscriber') {
    role = RtcRole.SUBSCRIBER;
  } else {
    next()
  }

  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  let token;
  if (req.query.tokentype === 'userAccount') {
    token = RtcTokenBuilder.buildTokenWithAccount(APP_ID, APP_PW, channelName, uid, role, privilegeExpireTime);
  } else if (req.query.tokentype === 'uid') {
    token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_PW, channelName, uid, role, privilegeExpireTime);
  } else {
    next()
  }
  return res.json({rtcToken: token})
};

app.get('/rtc', noCache, generateRTCToken)

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({message: 'intenal error'})
})

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
})