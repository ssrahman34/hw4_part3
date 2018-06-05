const React = require('react');
const ReactDOM = require('react-dom');
/* "Hello world" server code */

// like include
//var http  = require('http');

// like a callback
// function handler (request, response) {
//     var url = request.url;
//     url = url.replace("/","");
//     response.writeHead(200, {"Content-Type": "text/html"});
//     response.write("<h1>Hello!</h1>");
//     response.write("<p>You asked for <code>" + url + "</code></p>");
//     response.end();
// }

// var server = http.createServer(handler);

/* node-static code */

// var static = require('node-static');
// var root = './public';
// var myPort = 55899;

// var fileServer = new static.Server(root);

// require('http').createServer(function (request, response) {
//     request.addListener('end', function () {
//         // fileServer.serve(request, response);
// console.log("Listened!");
// fileServer.serveFile('testWHS.html', 500, {}, request, response);
//     }).resume();
// }).listen(myPort);

// Fill in YOUR port number!
//server.listen(53974);

/* Updated node-static code */

// like include
var http  = require("http");
var staticServer = require("node-static");
var fileServer = new staticServer.Server("./public");

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./PhotoQ.db');

/* Initialize global array that will contain all photo names*/
imgList = [];
imgListLoaded = false;

// like a callback
function sendFiles (request, response) {
    var url = request.url;
    //if (url.search("html") 
    //if (url.split("/")[1].search("testWHS") == -1 && url.search("query") == -1) 
      if (url.search("html") !=-1 && url.split("/")[1].search("testWHS") == -1)
	{
	response.writeHead(404, {"Content-Type": "text/html"});
	response.write("<!DOCTYPE html><html><body><h1>404 Error</h1><p>Page not found.</p></body></html>");
	response.end();
	console.log("This is the value of url:");
	console.log(url);
    }

    // Handling client-side queries
    else if (url.search("query") != -1) {
	// Parse query
	var query_arr = url.split("=");
	var tag = query_arr[1];

	// Get all queries separated by plus sign
	//var nums = query_arr[1];
	console.log("Browser requested tag: " + tag);
	
	// Split queries into separate numbers on plus sign
	// nums.replace(new RegExp("\\+","g"),' ')
	//var num_list = nums.split(/[+]/gm);

	// Test split num_list
	/*console.log("Contents of split num_list:");
	for (i = 0; i < num_list.length; i++) {
	    console.log(num_list[i]);
	}*/

	// Remove all invalid queries from num_list
	/*console.log("Removing all invalid queries");
	for (i = 0; i < num_list.length; i++) {
	    var num = num_list[i];
	    if (Number(num) > 990 || Number(num) < 1 || isNaN(Number(num))) {
		// console.log("Invalid input!");
		// response.writeHead(404, {"Content-Type": "text/plain"});
		// response.write("Invalid input");
		// response.end();
		console.log("Removing " + num_list[i]);
		num_list.splice(i, 1); // Remove invalid element from num_list
	    }    
	}*/

//	console.log("After splicing: " + num_list + " length: " + num_list.length);

	// If all queries have been found to be invalid
	/*if (num_list.length == 0) {
	    console.log("All inputs invalid!");
	    response.writeHead(404, {"Content-Type": "text/plain"});
	    response.write("Response: All inputs invalid!");
	    response.end();
	}*/
	
	/* Responding to single-number queries */
	// else {
	//     console.log("Returning: " + imgList[Number(num)]);
	//     console.log(imgListLoaded);
	//     response.writeHead(200, {"Content-Type": "text/plain"});
	//     response.write(imgList[Number(num)]);
	//     response.end();
	// }

	//else {

	    // Build query list
	    //var ids = "(";
	var ids = tag;
	    /*console.log("Adding query numbers to sql cmd list");
	    for (j = 0; j < num_list.length; j++) {
		console.log(num_list[j]);
		if (j == num_list.length - 1)
		    ids = ids + num_list[j];
		else
		    ids = ids + num_list[j] + ",";
	    }

	    ids = ids + ")";*/
	    
	    //var cmd = "SELECT fileName, width, height FROM photoTags WHERE idNum=" + Number(num);
	    var cmd = "SELECT fileName, width, height FROM photoTags WHERE csvtags LIKE "+ "'%" + decodeURIComponent(ids) + "%'";
	    console.log("multiple query cmd: " + cmd);
	    db.all(cmd, dbCallback);

	    // Callback function to return error or get from db if no error
	    function dbCallback(err, rows) {

		if (err) {
		    console.log("errCallback: returning error: ", err);
		}

		else {

		    console.log("Returning user's requested photos...");

		    // Create object to contain all requested records
		    var requestedRecords = new Object();
		    
		    for (k = 0; k < rows.length; k++) {
			console.log(rows[k]);
			var index = k.toString();
			requestedRecords[index] = rows[k];
		    }
		    var jsonString = JSON.stringify(requestedRecords);
		    response.writeHead(200, {"Content-Type": "application/json"});
		    response.write(jsonString);
		    response.end();
		}
	    }
	    
	//}
	
    }
    
    else {
	request.addListener('end', findFile).resume();
    }

    function findFile() {
	// dynamic query part
	console.log("Serving files...");

	// Fill up imgList before serving HTML file
	// Not necessary to do this before serving files but makes for a cleaner flow
	if (imgListLoaded == false) {
	    fillUpImageList();
	    imgListLoaded = true;
	    testFillUp(imgList);
	    
	    function testFillUp(imgList) {
		console.log("Testing fill up of imgList...")
		console.log(imgList[25]);
	    }
	}

	fileServer.serve(request, response, function(err, result) {
	    if (err) {
		console.error("Error! " + err.message);
	    }

	    else {
		console.log("Success: " + request.url + " " + response.message);
	    }
	});
    }
}

var finder = http.createServer(sendFiles);

// fill in YOUR port number!
finder.listen("53974");

/* This function fills up the global variable imgList[] with the JSON file of photo names */
function fillUpImageList() {
    // global variables
    var fs = require('fs');  // file access module

    // code run on startup
    loadImageList();

    // just for testing, you can cut this out
    console.log(imgList[354]);

    function loadImageList () {
	var data = fs.readFileSync('photoList.json');
	if (! data) {
	    console.log("cannot read photoList.json");
	} else {
	    listObj = JSON.parse(data);
	    imgList = listObj.photoURLs;
	}
    }
}

