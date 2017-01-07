#!/usr/bin/env node
"use strict";

var http = require("http"),
		url = require("url"),
		path = require("path"),
		fs = require("fs"),
		dir = "/build",
		port = process.argv[2] || 8888;

http.createServer(function(request, response) {
	const map = {
			'html': 'text/html',
			'json': 'application/json',
			'js': 'text/javascript',
			'ico': 'image/x-icon',
			'css': 'text/css',
			'txt': 'text/plain',
			'png': 'image/png',
			'jpg': 'image/jpeg',
			'wav': 'audio/wav',
			'mp3': 'audio/mpeg',
			'svg': 'image/svg+xml',
			'pdf': 'application/pdf',
			'doc': 'application/msword'
		};
	var uri = url.parse(request.url).pathname,
	    filename = path.join(__dirname + dir + '/', uri),
	    ext = filename.split('.'),
	    ext = ext[ext.length - 1];

	 fs.exists(filename, function(exists) {
		if(!exists) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n"+filename);
			response.end();
			return;
		}

		if (fs.statSync(filename).isDirectory())
			filename += 'index.html';

		fs.readFile(filename, "binary", function(err, file) {
			if(err) {
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			}
			response.writeHead(200, {"Content-Type": map[ext] || "text/html"});
			response.write(file, "binary");
			response.end();
		});
	});
}).listen(parseInt(port, 10));

console.log("Static file server running at  => http://localhost:" + port + "/\nCTRL + C to shutdown");
