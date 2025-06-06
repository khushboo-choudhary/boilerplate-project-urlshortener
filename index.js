require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");
const { URL } = require("url");

app.use(bodyParser.urlencoded({ extended: false }));


let urls = [];
let id = 1;
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlDatabase = [];
let counter = 1;

app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  let url;
  try {
    url = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  // Check DNS lookup for domain
  dns.lookup(url.hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const shortUrl = counter++;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

    res.json({
      original_url: originalUrl,
      short_url: shortUrl,
    });
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const id = parseInt(req.params.short_url);
  const entry = urlDatabase.find((item) => item.short_url === id);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: "No short URL found for given input" });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
