// Node module for working with a request to an API or other fellow-server
const sqlite3 = require('sqlite3').verbose();
var APIrequest = require('request');
var index = 0;
let db = new sqlite3.Database('./PhotoQ.db');
    function loadImageList () {
	    var fs = require('fs');
        var data = fs.readFileSync('photoList.json');

        if (! data) {
            console.log("cannot read the .json");
        } else {
            listObj = JSON.parse(data);
            imgList = listObj.photoURLs;
            console.log(imgList[0], imgList[1]);
		return imgList;
//            callback();

	//function callback() {
		console.log("imgList should be loaded. starting callback...");
        //	for (var i = 0; i < 55; i++){
          //      if (i != 49) {	
	//		console.log(imgList[i]);
//			annotateImage(imgList[i]);
		//}
        	//}
	//}
	}
}

imgList = loadImageList();

// An object containing the data the CCV API wants
// Will get stringified and put into the body of an HTTP request, below
function annotateImage(id) {
if (id > 50){
return; //end at the 50
}

APIrequestObject = {
  "requests": [
    {
      "image": {
        "source": {"imageUri": encodeURI(imgList[id])}
        },
      "features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
    }
  ]
}

url = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDqlXnBXLZ3TB7LhsPJv7KJaokWZF9nxPY';

fileNameURL = APIrequestObject.requests[0].image.source.imageUri;
console.log("In annotatateImage, we are requesting tags for fileNameURL:");
console.log(fileNameURL);

fileNameArray = fileNameURL.split('/');

fileName = fileNameArray[fileNameArray.length - 1];

fileName = decodeURIComponent(fileName);

//console.log("FileName:")
//console.log(fileName)

// function to send off request to the API
	// The code that makes a request to the API
	// Uses the Node request module, which packs up and sends off 
	// an HTTP message containing the request to the API server
	APIrequest(
	    { // HTTP header stuff
		url: url,
		method: "POST",
		headers: {"content-type": "application/json"},
		// will turn the given object into JSON
		json: APIrequestObject
	    },
	    // callback function for API request
	    APIcallback
	);


	// callback function, called when data is received from API
	function APIcallback(err, APIresponse, body) {
	    console.log("In APIcallback");
    	    if ((err) || (APIresponse.statusCode != 200)) {
		console.log("Got API error");
		console.log(err);
		console.log(body);
    	    } else {
		//add the new data to the database here using SQL UPDATE
		APIresponseJSON = body.responses[0];
		//console.log(APIresponseJSON);
		//console.log("APIresponseJSON.labelAnnotations: ");
		//console.log(APIresponseJSON.labelAnnotations);
		//console.log(APIresponseJSON.landmarkAnnotations);
		//console.log(APIresponseJSON.labelAnnotations.length)
		console.log("No error.");
		console.log(fileName);
		if (APIresponseJSON.labelAnnotations != null){
		console.log("Response is not null!");        
		var max = APIresponseJSON.labelAnnotations.length < 6 ? APIresponseJSON.labelAnnotations.length : 6;
                var tagList = []
                for(var i = 0; i < max; i++){
                    tagList.push(APIresponseJSON.labelAnnotations[i].description);
			        //console.log(APIresponseJSON.labelAnnotations[i].description);
                }
		console.log(tagList)
        var cmd = "UPDATE photoTags SET csvtags='"+tagList+"' WHERE fileName=\""+fileName+"\"";
                db.run(cmd, function(error){
                megaCall(id);
                })
               
		}
		else {
		console.log("Response was null.");
		var cmd = "UPDATE photoTags SET csvtags='No tags' WHERE fileName=\""+fileName+"\"";
        	db.run(cmd, function(error){
		megaCall(id);
		})	
		}

                
	    }		
    	} // end callback function
	function megaCall(id){
		index = index + 1;
		id = id + 1
		annotateImage(id);
	}

} // end annotateImage
// Do it! 
annotateImage(index);
