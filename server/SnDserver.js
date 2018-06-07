const React = require('react');
const ReactDOM = require('react-dom');

var http  = require("http");
var staticServer = require("node-static");
var fileServer = new staticServer.Server("./public");

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./PhotoQ.db');

const util = require('util')

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
    else if (url.search("query") != -1 && url.search("tag")==-1 && url.search("add")==-1) {
	// Parse query
	var query_arr = url.split("=");
	var tags = query_arr[1]; //everything after num=

	// Get all queries separated by plus sign
	//var nums = query_arr[1];
	console.log("Browser requested tag: " + tags);
	
	// Split queries into separate numbers on plus sign
	tags.replace(new RegExp("\\+","g"),' ')
	var num_list = tags.split(/[+]/gm);

	// Test split num_list
	console.log("Contents of split num_list:");
	for (i = 0; i < num_list.length; i++) {
	    console.log(num_list[i]);
	}

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
	var ids = num_list[0];
		fcmd ="";
	    console.log("Adding query numbers to sql cmd list");
	    for (j = 0; j < num_list.length; j++) {
		console.log(num_list[j]);
		if (j == num_list.length - 1)
			fcmd = fcmd + "(csvtags LIKE " + "'%" + decodeURIComponent(num_list[j]) + "%')";
		else
		    fcmd = fcmd + "(csvtags LIKE " + "'%" + decodeURIComponent(num_list[j]) + "%')"+ "AND ";
	    }
	    
	    //var cmd = "SELECT fileName, width, height FROM photoTags WHERE idNum=" + Number(num);
	    var cmd = "SELECT fileName, width, height, csvtags FROM photoTags WHERE " + fcmd;
	    //var cmd = "SELECT fileName, width, height FROM photoTags WHERE (csvtags LIKE "+ "'%" + decodeURIComponent(ids) + "%')"+ "AND (csvtags LIKE " +"'%" + decodeURIComponent(num_list[1]) + "%')";
	    console.log("WE WANNA DISPLAY PHOTOS AND TAGS: ----------- ");
		console.log("multiple query cmd: " + cmd + "fcmd" + fcmd);
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
        else if (url.search("query") != -1 && url.search("tag")!=-1){
                console.log("handling tag from SnDServer")
                var query_arr = url.split("=");
                var photoAndTag = query_arr[1]; //everything after num=
                photoAndTag.replace(new RegExp("\\+","g"),' ')
                var photoTagList = photoAndTag.split(/[+]/gm);
                console.log("Photo is " + photoTagList[0] + "TAG IS " + photoTagList[1]);
                
                var fileName = photoTagList[0];
                var tag = photoTagList[1]
                var cmd = "SELECT csvtags FROM photoTags WHERE (csvtags LIKE "+ "'%" + decodeURIComponent(tag) + "%')"+ "AND fileName='" + decodeURIComponent(fileName) +"'";
		console.log(cmd);
		db.all(cmd,deleteCallback);
		function deleteCallback(err,rows){
			if (err){console.log("Error: "+ err);}
			else{

                    	// Create object to contain all requested records
                    	var requestedImage = new Object();
			var index = "0";
			requestedImage[index] = rows[0];	
                    	//for (k = 0; k < rows.length; k++) {
                        //	console.log(rows[k]);
                        //	var index = k.toString();
                        //requestedRecords[index] = rows[k];
                    //}
                    var jsonString = JSON.stringify(requestedImage);
                    response.writeHead(200, {"Content-Type": "application/json"});
                    response.write(jsonString);
                    response.end();
		    var allTags = util.inspect(rows);
			console.log(allTags);
                        console.log(typeof(allTags));
			var csv = allTags.split("'");
			var str = csv[1];
			var tagList =str.split(",");
			console.log(tagList);
			var index = tagList.indexOf(tag);
			console.log(index);
			tagList.splice(index,1);
			console.log(tagList + "FINAL");
			var newTags = '';
			for (var k = 0; k < tagList.length-1; k++) {
				newTags = newTags + tagList[k]+ ",";
			}
			newTags= newTags + tagList[tagList.length-1];
			console.log(newTags);
			var cmd = "UPDATE photoTags set csvtags = '"+ newTags + "' WHERE fileName = '" + decodeURIComponent(fileName) + "'";
			console.log("Update command" + cmd);
			db.run(cmd,updateCallBack);
			function updateCallBack(){
				console.log("WE HAVE DELETED FORM DB WITH UPDATE");
			}
			}
		}//delete
	}
	else if (url.search("query") != -1 && url.search("add")!=-1){
		console.log("MADE IT TO ADD TAG");
                var query_arr = url.split("=");
                var photoAndTag = query_arr[1]; //everything after num=
                photoAndTag.replace(new RegExp("\\+","g"),' ')
                var photoTagList = photoAndTag.split(/[+]/gm);
                console.log("Photo is " + photoTagList[0] + "TAG IS " + photoTagList[1]);

                var fileName = photoTagList[0];
                var tag = photoTagList[1]
                var cmd = "SELECT csvtags FROM photoTags WHERE fileName='" + decodeURIComponent(fileName) +"'";
		console.log(cmd);
                db.all(cmd,addCallback);
                
		function addCallback(err,rows){
                        if (err){console.log("Error: "+ err);}
                        else{

                        // Create object to contain all requested records
                        var requestedImage = new Object();
                        var index = "0";
                        requestedImage[index] = rows[0];
                        //for (k = 0; k < rows.length; k++) {
                        //      console.log(rows[k]);
                        //      var index = k.toString();
                        //requestedRecords[index] = rows[k];
                    //}
                    var jsonString = JSON.stringify(requestedImage);
                    response.writeHead(200, {"Content-Type": "application/json"});
                    response.write(jsonString);
                    response.end();
                    var allTags = util.inspect(rows);
                        console.log(allTags);
                        console.log(typeof(allTags));
                        var csv = allTags.split("'");
                        var str = csv[1];
                        var tagList =str.split(",");
                        console.log(tagList);
			tagList.push(tag);                        
                        console.log(tagList + "FINAL");
                        var newTags = '';
			if (tagList.length <= 7){
                        for (var k = 0; k < tagList.length-1; k++) {
                                newTags = newTags + tagList[k]+ ",";
                        }
                        newTags= newTags + tagList[tagList.length-1];
                        console.log(newTags);
                        var cmd = "UPDATE photoTags set csvtags = '"+ newTags + "' WHERE fileName = '" + decodeURIComponent(fileName) + "'";
                        console.log("Update command" + cmd);
                        db.run(cmd,updateCallBack);
                        function updateCallBack(){
                                console.log("WE HAVE added to DB WITH UPDATE");
                        }
                        }// if < 7 
			}//else
                }//addCB




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

