/**
 *  DEPENDENCIES
 */
var express = require("express");        // Load express
var app = express();                     // Create an intance of express and assign that to app
var bodyParser = require('body-parser'); // Pull information from HTML POST
var path = require("path");              // For working with files and directory paths


/**
 * CONFIGURATIONS
 */
const PORT = 3000 || process.argv[2];
const CLIENT_FOLDER = path.join(__dirname + '/../client');


console.log("Serving client files at ", CLIENT_FOLDER);
app.use(express.static(CLIENT_FOLDER));   // Serve static files

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname + '/../client/index.html'));
});

app.get("/501", function(){
	throw new Error('testing 500 errors');
})

app.use(function (err, req, res, next) {
	res.status(500).sendFile(path.join(CLIENT_FOLDER + '/errors/500.html'));
});

app.use(function (req, res) {
	res.status(401).sendFile(CLIENT_FOLDER + "/errors/404.html");
});

// Start server on PORT
app.listen(PORT, function () {
	console.log("Running server on http://localhost:%s", PORT);

});