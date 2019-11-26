var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');
var config = require("./webpack.config");
var WebpackShellPlugin = require("webpack-shell-plugin");
var helmet = require("helmet");

if (process.env.NODE_ENV !== 'production') {
    // onBuildEnd 只會在build之後
    config.plugins.push(new WebpackShellPlugin({onBuildEnd: ['node server.js']}));
};

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(helmet()); // 設定安全相關的http-header

app.use(express.static(path.resolve(__dirname, './public'))); // 根目錄

app.use("/", function(req, res){
    var html = path.resolve(__dirname, './public/index.html');
    fs.readFile(html, 'utf8', function(err, htmlString){
        if (err) {
            console.error("fs.readFile ERROR ", err);
            return res.status(500).end();
        };
        res.status(200).send(htmlString);
    });
})

var server = http.createServer(app);
var PORT = 3000;

server.listen(PORT, function() { 
    console.log("已啟動server")
});