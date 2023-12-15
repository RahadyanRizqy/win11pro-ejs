const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const jwtSecretKey = 'arcueid-brunestud';
const jwtTokenMap = {};
let currentKey = '';

function generateRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  currentKey = randomString;
}


app.use((req, res, next) => {
    console.log(`${req.ip} [${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next(); // Call the next middleware in the stack
});

app.all('/', (req, res) => {
    switch (req.method) {
        case 'GET':
            const token = req.query.token;
            if (!token) {
                return res.status(401).json({ msg: 'You\'re not authorized' });
            }
            else {
                if (!(jwtTokenMap['expiry'] < Date.now())) {
                    if (token == jwtTokenMap['key']) {
                        const decoded = jwt.verify(token, jwtSecretKey)
                        res.json(
                            {
                                msg: 'You\'re not authorized',
                                dec: decoded
                            }
                        ).status(200);
                    }
                }
            }
            break;
        case 'POST':
            const password = Null;
            res.json(
                {
                    msg: 'CRACKED here is the password ' + `${password}`
                }
            ).status(200)
    }
});


app.all('/send', (req, res) => {
    const password = req.body.password;
    switch (req.method) {
        case 'GET':
            res.status(401).json(
                {
                    msg: 'You\'re not authorized'
                }
            ).status(401);
            break;
        case 'POST':
            if (!password) {
                res.status(401).send(
                    {
                        msg: 'You\'re not authorized'
                    }
                );
            }
            const token = jwt.sign({ password }, jwtSecretKey, { expiresIn: '10s' });
            const expiry = 9000;

            jwtTokenMap['key'] = token;
            jwtTokenMap['expiry'] = Date.now() + expiry;

            setTimeout(() => {
                delete jwtTokenMap[token];
            }, expiry);

            console.log(jwtTokenMap);
            res.status(200).send(
                {
                    key: jwtTokenMap['key'],
                    expiry: jwtTokenMap['expiry']
                }
            );
            break;
        default:
            res.status(400).send(
                {
                    msg: 'What on earth are you requesting?'
                }
            );
    }

});

app.all('/get', (req, res) => {
    if (Object.keys(jwtTokenMap).length === 0) {
        return res.status(404).json({ msg: 'No token available' });
    }

    if (jwtTokenMap['expiry'] < Date.now()) {
        delete jwtTokenMap['key'];
        return res.status(401).json({ msg: 'Token has expired' });
    }

    res.status(200).json({ msg: 'Current token', token: jwtTokenMap['key']});
}); 
// app.post('/accept', (req, res) => {
//     const { mykey } = req.body;

//     if (mykey && mykey.toLowerCase() === 'albert') {
//         return res.status(200).json({ msg: `You are accepted, ${mykey}` });
//     }

//     res.status(401).json({ msg: 'Access denied' });
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  setInterval(() => {
    generateRandomString(10);
    console.log(`New key generated: ${currentKey}`);
  }, 15000);
});