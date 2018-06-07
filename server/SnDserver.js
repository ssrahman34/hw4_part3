const React = require('react');
const ReactDOM = require('react-dom');

var http  = require("http");
var staticServer = require("node-static");
var fileServer = new staticServer.Server("./public");

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./PhotoQ.db');

const util = require('util')

var auto = require("./makeTagTable");


var tagTable = {};   // global
auto.makeTagTable(tagTableCallback);
function tagTableCallback(data) {
   tagTable = data;
}

function sendTags(request,response){
console.log("In senTags! ------------>");
	var url = request.url;

	if(url.search("query") != -1 && url.search("tag")==-1 && url.search("add")==-1 && url.search("autocomplete") != -1 ){
		console.log("Detected autocompelte in request in sendTags. Writing respone to send back all the autocomplete tags!");
		var query_arr = url.split("=");
       		var chars = query_arr[1];
		console.log(chars);
        	response.writeHead(200, {"Content-Type": "text/html"});
        	response.write("sarah rahman")
        	response.end(); 
        	console.log("end response")
	}//if autocomplete
}
/* Initialize global array that will contain all photo names*/
imgList = [];
imgListLoaded = false;

// like a callback
function sendFiles (request, response) {

    var url = request.url;
    
      if (url.search("html") !=-1 && url.split("/")[1].search("testWHS") == -1 && url.split("/")[1].search("autocomplete") == -1)
	{
	response.writeHead(404, {"Content-Type": "text/html"});
	response.write("<!DOCTYPE html><html><body><h1>404 Error</h1><p>Page not found.</p></body></html>");
	response.end();
	console.log("This is the value of url:");
	console.log(url);
    }

      else if(url.search("query") != -1 && url.search("tag")==-1 && url.search("add")==-1 && url.search("autocomplete") != -1 ){
                console.log("Detected autocompelte in request in sendTags. Writing respone to send back all the autocomplete tags!");
                var query_arr = url.split("=");
                var chars = query_arr[1];
		var resp = ""
                if(tagTable[chars] != null){
			var theTags = tagTable[chars]['tags']
			resp_list = Object.keys(theTags)
			if(resp_list.length > 1){
				for(var i = 0; i < resp_list.length; i++){
					console.log("resp_list [i] in the loop is ",resp_list[i])
					resp = resp + resp_list[i]
				}
				//console.log(typeof(resp))
				//console.log("resp[0]", resp[0])
				//console.log(typeof(resp[0]));
			}//only get the unique values!
			else{
				resp = resp_list; // only one resp
			}
		}//we have tags!
		else{
			resp = ""
		}//we don't have tags
		console.log(resp, "Resp is");
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write(resp)
                response.end();
                console.log("end response") 
        }//if autocomplete

    // Handling client-side queries
    else if (url.search("query") != -1 && url.search("tag")==-1 && url.search("add")==-1 && url.search("autocomplete") == -1) {
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
	
	
	var cmd = "SELECT fileName, width, height, csvtags FROM photoTags WHERE " + fcmd;
	
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

	/* Callback function to delete tag from database */
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
		if(allTags.length!= 0){
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
			console.log("WE HAVE DELETED FROM DB WITH UPDATE");
		    }
		}
	    }//if tags.length !=0
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

