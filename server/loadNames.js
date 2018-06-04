var url = require('url');
var http = require('http');
var sizeOf = require('image-size');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./PhotoQ2.db');
imgList=[];

readJson();

function readJson(){
    var fs = require('fs');
    loadImageList();

    function loadImageList () {

	var data = fs.readFileSync('photoList.json');

	if (! data) {
	    console.log("cannot read the .json");
	} else {
	    listObj = JSON.parse(data);
	    imgList = listObj.photoURLs;
	    console.log(imgList[0], imgList[1]);
	}

	for (var i = 1; i < imgList.length; i++){
	    console.log(imgList[i]);
	    //var cmdStr="INSERT INTO photoTags VALUES(i, 'Dtring', 0,0,'','')"
	    fillDB(imgList[i], i);
	}

	function fillDB(imgUrl, i){
	    var width;
	    var height;
	    var options = url.parse(imgUrl);

	    http.get(options, function (response) {
  		var chunks = [];
  		response.on('data', function (chunk) {
   		    chunks.push(chunk);
  		}).on('end', function() {
    		    var buffer = Buffer.concat(chunks);
		    dim=sizeOf(buffer);
		    width = dim.width;
		    height = dim.height; 

		    //console.log(width, height); 
		    console.log("i"+ i);

		    urlList = imgUrl.split('/');
		    console.log("Widht and h"+width, height);

		    var fileName = urlList[urlList.length -1];
		    fileName = decodeURIComponent(fileName);
		    console.log(fileName);				

		    var cmdStr = "INSERT OR REPLACE INTO photoTags VALUES(" + i + ", '" + fileName + "','"+width+"','"+height+"', '', '')";
		    //var cmdStr = "INSERT INTO photoTags VALUES(" + i + "," + fileName + "," + width + "," + height+ ",'','')"
		    db.run(cmdStr, dbCallback);
		});
	    });
	}
	
	dumpDB();

	function dbCallback(err) {
	    if (err) { console.log(err); }

	    else {
		console.log("Inserted row"); 
	    }  
	}
    } // loadImg
}

// Print out contents of database
function dumpDB() {
	console.log("in dump");
	db.all( 'SELECT * FROM photoTags', dataCallback);
		function dataCallback( err, data ) {
		  	console.log(err);
			console.log(data) 
		} } 
