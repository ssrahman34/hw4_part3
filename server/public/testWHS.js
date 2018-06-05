//const React = require('react');
//const ReactDOM = require('react-dom');
/* This array is just for testing purposes.  You will need to 
   get the real image data using an AJAX query. */
// Global; will be replaced by a call to the server! 
photos=[];
/*var photos = 
[
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/A%20Torre%20Manuelina.jpg", width: 574, height: 381 },
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Uluru%20sunset1141.jpg", width: 500 , height: 334 },
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Sejong tomb 1.jpg", width: 574, height: 430},
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Serra%20da%20Capivara%20-%20Painting%207.JPG", width: 574, height: 430},
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg", width: 574, height: 410},
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Red%20pencil%20urchin%20-%20Papahnaumokukea.jpg", width: 574 , height: 382 }
];*/  
console.log("In testWHS.js...");


window.dispatchEvent(new Event('resize'));
// Function to send AJAX request to server
function sendRequest() {
    console.log("Entered sendRequest...");
    var num = document.getElementById("num").value;
    var input = document.getElementById("num").value;
    //var numList = input.split(",");
    //var num = numList[0];
    
    console.log("Requested " + input);

   // if (Number(num) > 990 || Number(num) < 1 || isNaN(Number(num))) {
	//console.log("Invalid input! Please try again.");
   // }

    //else {
	var oReq = new XMLHttpRequest();
	//var url = "query?num=" + num;

	// Build url
	console.log("Building URL!");

	var url = "query?num="+input;
	/*for (i = 0; i < numList.length; i++) {
	    if (i == numList.length - 1)
		url = url + numList[i];
	    
	    else url = url + numList[i] + "+";
	}*/
	
	oReq.open("GET", url);
	console.log("Opened oReq...");
	
	// load --> when data is returned
	oReq.addEventListener("load", handleResponse2);
	// oReq.addEventListener("load", handleResponseMultiple);
	console.log("Added handleResponse listener...");
	oReq.send();
	console.log("Sent oReq...");
    //}

    // Callback function to display photo (db version)
    function handleResponse2() {
	console.log("Entered handleResponse2: " + oReq.responseText);

	var requestedRecords = oReq.responseText;
	var recordsObj = JSON.parse(requestedRecords); 
	var zeroIndex = "0";
	
	var startOfURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
	var photoName = recordsObj["0"]["fileName"];
	console.log("Photoname: " + photoName);
	
	var photoURL =  encodeURI(startOfURL + photoName);

	console.log("Filename: " + photoName);
	console.log("Final url: " + photoURL);
//	var display = document.getElementById("photoImg");
//	display.src = photoURL;	

	// Print all photo names requested
	console.log("End of Part 4: Printing all fileNames of photos requested...");
	var len = Object.keys(recordsObj).length;
	var URL="http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/"
	//This will be the object that has each photos fileName, width and height
	photos=[];
	for (i = 0; i < len; i++) {
	    var photoRow = new Object();
	    var iStr = i.toString();
	    photoRow.src = encodeURI(URL+recordsObj[iStr]["fileName"]);
	    photoRow.width = recordsObj[iStr]["width"];
	    photoRow.height = recordsObj[iStr]["height"];
	    photos.push(photoRow);	    
	    console.log(i + ": " + photoName); 
	}
	callReact();
	function callReact(){
		const reactContainer = document.getElementById("react");
		//while(reactContainer.firstChild){
		//	reactContainer.removeChild(reactContainer.firstChild);
		//}
		var reactApp = ReactDOM.render(React.createElement(App),reactContainer);
		window.dispatchEvent(new Event('resize'));
	}//where we reder React DOM
	for (var i = 0; i < photos.length; i++){
		console.log(photos[i]);
	}

    }
    
    // Callback function to display name of photo corresponding to number requested by browser
    // function handleResponse() {
    // 	console.log("Entered handleResponse!");
    // 	console.log("Entering handleResponse. This is the value of responseText: " + oReq.responseText);

    // 	if (oReq.status >= 400) {
    // 	    console.log("The requested input is not valid! Please try again.");
    // 	}

    // 	var startOfURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
    // 	var photoName = oReq.responseText;
    // 	var photoURL =  startOfURL + photoName;

    // 	console.log("Final url: " + photoURL);
    // 	var display = document.getElementById("photoImg");
    // 	display.src = photoURL;
    // }
}



// function sendRequest2() {
//     // Parse numList by comma

//     // For each num,
//     // check if w/in bounds
//     // based on # have server retrieve fileName, width, height from db
//     // push each to dictList
// }


// Called when the user pushes the "submit" button 
/*function photoByNumber() {
    //sendRequest();
    var num = document.getElementById("num").value;
    num = num.trim();
    var photoNum = Number(num);
    if (photoNum != NaN) {
	var photoURL = photoURLArray[photoNum].url;
	var display = document.getElementById("photoImg");
	display.src = photoURL;
    }
}
*/

class Tag extends React.Component {

    render () {
	return React.createElement('p',  // type
	    { className: 'tagText'}, // properties
	   this.props.text);  // contents
    }
};


// A react component for controls on an image tile
class TileControl extends React.Component {

    render () {
	// remember input vars in closure
        var _selected = this.props.selected;
        var _src = this.props.src;
        // parse image src for photo name
	var photoName = _src.split("/").pop();
	photoName = photoName.split('%20').join(' ');

        return ( React.createElement('div', 
 	 {className: _selected ? 'selectedControls' : 'normalControls'},  
         // div contents - so far only one tag
              React.createElement(Tag,
		 { text: photoName })
	    )// createElement div
	)// return
    } // render
};


// A react component for an image tile
class ImageTile extends React.Component {

    render() {
	// onClick function needs to remember these as a closure
	var _onClick = this.props.onClick;
	var _index = this.props.index;
	var _photo = this.props.photo;
	var _selected = _photo.selected; // this one is just for readability

	return (
	    React.createElement('div', 
	        {style: {margin: this.props.margin, width: _photo.width},
			 className: 'tile',
                         onClick: function onClick(e) {
			    console.log("tile onclick");
			    // call Gallery's onclick
			    return _onClick (e, 
					     { index: _index, photo: _photo }) 
				}
		 }, // end of props of div
		 // contents of div - the Controls and an Image
		React.createElement(TileControl,
		    {selected: _selected, 
		     src: _photo.src}),
		React.createElement('img',
		    {className: _selected ? 'selected' : 'normal', 
                     src: _photo.src, 
		     width: _photo.width, 
                     height: _photo.height
			    })
				)//createElement div
	); // return
    } // render
} // class


// The react component for the whole image gallery
// Most of the code for this is in the included library
class App extends React.Component {

  constructor(props) {
    super(props);
	this.state = { photos: photos };
    this.selectTile = this.selectTile.bind(this);
  }

  selectTile(event, obj) {
    console.log("in onclick!", obj);
    let photos = this.state.photos;
    photos[obj.index].selected = !photos[obj.index].selected;
    this.setState({ photos: photos });
  }

  render() {
    return (
       React.createElement( Gallery, {photos: this.state.photos,
       onClick: this.selectTile, 
       ImageComponent: ImageTile} )
      );
  }
}

/* Finally, we actually run some code */


		/* Workaround for bug in gallery where it isn't properly arranged at init */
		window.dispatchEvent(new Event('resize'));
function updateImages()
{
  var reqIndices = document.getElementById("req-text").value;

  if (!reqIndices) return; // No query? Do nothing!

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/query?numList=" + reqIndices.replace(/ |,/g, "+")); // We want more input sanitization than this!
  xhr.addEventListener("load", (evt) => {
    if (xhr.status == 200) {
        reactApp.setState({photos:JSON.parse(xhr.responseText)});
        window.dispatchEvent(new Event('resize')); /* The world is held together with duct tape */
    } else {
        console.log("XHR Error!", xhr.responseText);
    }
  } );
  xhr.send();
}
window.dispatchEvent(new Event('resize'));
console.log("THEEEEE new version...");
const reactContainer = document.getElementById("react");
var reactApp = ReactDOM.render(React.createElement(App),reactContainer);
