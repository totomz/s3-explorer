require('dotenv').config();

const express = require('express');
const AWS = require('aws-sdk');

const app = express();
const port = 8090;

app.use('/static', express.static(__dirname + '/static'))
app.use('/libs', express.static(__dirname + '/node_modules'))

app.get('/', (req, res) => {
    return res.redirect('/static/index.html');
});

app.get('/api', (req, res) => {
    res.send('Hello World!');
});

app.get('/nodes', async (req, res) => {
    const s3 = new AWS.S3();
    console.log(req.query.id)

    const Prefix = (req.query.id === '#')? '' : req.query.id;

    const objects = await s3.listObjectsV2({
        Bucket: process.env.S3_BUCKET,
        Delimiter: '/',
        Prefix,
        MaxKeys: 1000,
    }).promise();

    const keys = objects.CommonPrefixes.map(o => {
        return {
            id: o.Prefix,
            text: o.Prefix.replace(Prefix, ''),
            children: true
        }
    })

    const values = objects.Contents.map(c => {
        return {
            id: c.Key,
            text: c.Key.replace(Prefix, ''),
            children: false
        }
    })

    res.send(keys.concat(values));
    // res.send([
    //     {text: "/prod", children: true},
    //     {text: "/gamma", children: true}
    // ]);
});

app.get("/value", async (req, res) => {
    const s3 = new AWS.S3();
    const object = await s3.getObject({
        Bucket: process.env.S3_BUCKET,
        Key: req.query.id
    }).promise();

    res.send(JSON.parse(object.Body.toString()))

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
