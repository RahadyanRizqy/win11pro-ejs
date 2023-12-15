const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config()

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({express: true}));

const jwtSecretKey = process.env.SECRET_KEY;
let jwtTokenMap = {};
let currentKey = process.env.PASSWORD;
const tokenExpiry = 20000;

const theFlag = process.env.FLAG;

const getKey = (flag) => {
    return bcrypt.hashSync(flag, bcrypt.genSaltSync(saltRounds));
}

const genKey = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randString = '';
    for (let i = 0; i < length; i++) {
        const randInt = Math.floor(Math.random() * chars.length);
        randString += chars.charAt(randInt);
    }
    currentKey = randString;
}

app.get('/', (req, res) => {
    try {
        const paramToken = req.query.token;
        if (Object.keys(jwtTokenMap).length === 0) {
            return res.status(404).json({ msg: 'No token available' });
        }
    
        else if (jwtTokenMap['expiry'] < Date.now()) {
            delete jwtTokenMap;
            return res.status(401).json({ msg: 'Token has expired' });
        }

        else {
            if (paramToken == jwtTokenMap['token']) {
                return res.status(200).json({licenseKey: getKey(theFlag), paramToken: paramToken})
            }
            return res.status(401).json({ msg: 'Token has expired' });
        }
    }
    catch (err) {
        res.status(401).json({
            key: 'Unauthorized'
        });     
    }
})

app.get('/get-token', (req, res) => {
    try {
        const key = req.query.key;
        if (1 <= key.length <= 10 && key && (key !== '') && key === currentKey) {
            const token = jwt.sign({ key }, jwtSecretKey, { expiresIn: '20s' });
            jwtTokenMap['token'] = token;
            jwtTokenMap['expiry'] = Date.now() + tokenExpiry;

            console.log(jwtTokenMap);

            res.status(200).json({
                token: jwtTokenMap['token'],
                expiry: jwtTokenMap['expiry'],
                status: 'Valid'
            });
        }
        else {
            res.status(401).json({
                key: 'Unauthorized'
            });     
        }
    }
    catch (err) {
        res.status(401).json({
            msg: 'Unauthorized' + `${err}`
        });     
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    // const keyLength = 7;
    // genKey(keyLength)
    console.log(`CURRENT KEY: ${currentKey}`);
    // console.log(jwtTokenMap);
    // console.log(`NEW KEY: ${currentKey}`);
    // console.log(process.env.PASSWORD)
    setInterval(() => {
        // genKey(keyLength);
        // console.log(jwtTokenMap);
        // console.log(`NEW KEY: ${currentKey}`);
        console.log(`CURRENT KEY: ${currentKey}`);
        delete jwtTokenMap['token'];
    }, tokenExpiry);
  });