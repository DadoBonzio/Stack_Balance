const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

const red = '\\x1b[31m';
const green = '\\x1b[32m';
const reset = '\\x1b[0m';


app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.get('/info', (req, res) => {
    console.log(red);
    console.log(req.query);
    res.type('application/json');
    const username = req.query.username;
    console.log(username);
    let scores;

    try {
        scores = JSON.parse(fs.readFileSync('Files/Scores.json', 'utf8'));
    } catch (err) {
        return res.status(500).send('Error reading scores file');
    }

    const userInfo = scores.userinfos.find(info => info.username === username);
    if (userInfo !== undefined) {
        res.send({ username: username, height: userInfo.score });
    } else {
        res.send(scores);
    }
});

app.post('/info', express.json(), (req, res) => {
    console.log(reset);
    console.log("Post request body: ", req.body)
    const { username, password, height } = req.body;
    var score = height;
    console.log("Username: ", username, " Score: ", score);
    if (!username || typeof score !== 'number') {
        return res.status(400).send('Invalid request body');
    }

    let scores;
    let userPassword;
    try {
        scores = JSON.parse(fs.readFileSync('Files/Scores.json', 'utf8'));
        userPassword = JSON.parse(fs.readFileSync('Files/Passwords.json', 'utf8'));
    } catch (err) {
        return res.status(500).send('Error reading scores file');
    }

    const correctPassword = userPassword.users.some(info => info.username === username && info.password === password);
    console.log(correctPassword)
    if (!correctPassword && userPassword.users.some(info => info.username === username)) {
        res.send("Incorrect Password");
        return;
    }
    else if (!correctPassword) {
        userPassword.users.push({ username, password })
        fs.writeFileSync('Files/Passwords.json', JSON.stringify(userPassword, null, 2), 'utf8');
    }
    const userExists = scores.userinfos.some(info => info.username === username);
    if (userExists)
        scores.userinfos = scores.userinfos.map(info => {
            if (info.username === username) {
                return { username, score };
            }
            return info;
        });
    else
        scores.userinfos.push({ username, score });


    try {
        fs.writeFileSync('Files/Scores.json', JSON.stringify(scores, null, 2), 'utf8');
    } catch (err) {
        return res.status(500).send('Error writing scores file');
    }

    res.send('Score updated');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});