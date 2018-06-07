//const React = require('react');
//const ReactDOM = require('react-dom');
/* This array is just for testing purposes.  You will need to 
   get the real image data using an AJAX query. */
// Global; will be replaced by a call to the server! 
photos=[];

console.log("In testWHS.js...");

// Global tags array; will be used for React rendering
tagsArray = [];

window.dispatchEvent(new Event('resize'));

// Function to send AJAX request to server
function sendRequest() {
    console.log("Entered sendRequest...");
    var num = document.getElementById("num").value;
    var input = document.getElementById("num").value;
    var numList = input.split(",");
    var num = numList[0];
    tagsArray = numList; //We will use this for react only
    const tagContainer = document.getElementById("tags");
    
    if (tagsArray.length > 0){
	while(tagContainer.firstChild){
            tagContainer.removeChild(tagContainer.firstChild);
        }
        var txt = document.createElement('p');
        //newTag.className= "txti";
        var txtnode = document.createTextNode("You searched for ");
	txt.style.fontStyle = "italic";
	txt.style.color = "Navy";
        txt.appendChild(txtnode);
        tagContainer.appendChild(txt);
    }
    for (var k = 0; k < tagsArray.length;k++){ 
	var newTag = document.createElement('div');
	newTag.className= "tagbtn";
	var tagText = document.createTextNode(tagsArray[k]);
        newTag.appendChild(tagText);
        tagContainer.appendChild(newTag);
    }
    //var reactApp = ReactDOM.render(React.createElement(App),tagContainer);
    
    console.log("Requested " + input);

    var oReq = new XMLHttpRequest();

    // Build url
    console.log("Building URL!");
    
    var url = "query?num=";

    for (i = 0; i < numList.length; i++) {
	if (i == numList.length - 1)
	    url = url + numList[i];
	
	else url = url + numList[i] + "+";
    }
    console.log("our urlsis " + url)
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
	console.log("requestedRecords" + requestedRecords);

	if(Object.keys(requestedRecords).length === 0){
		console.log("0");
	}

	var recordsObj = JSON.parse(requestedRecords); 
	var zeroIndex = "0";
	
	var startOfURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
	var photoName = recordsObj["0"]["fileName"];
	console.log("Photoname: " + photoName);
	
	var photoURL =  encodeURI(startOfURL + photoName);

	console.log("Filename: " + photoName);
	console.log("Final url: " + photoURL);

	// Print all photo names requested
	console.log("End of Part 4: Printing all fileNames of photos requested...");

	var len = Object.keys(recordsObj).length;
	var URL="http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/"

	//This will be the object that has each photos fileName, width and height
	console.log("len is long?" +len);

	/* Clear out photos from old query */
	photos=[];
	var max = len < 12 ? len : 12; //either go from len if it is less than 12, if len is more than 12 go until 12

	for (i = 0; i < max; i++) {
	    var photoRow = new Object();
	    var iStr = i.toString();
	    photoRow.src = encodeURI(URL+recordsObj[iStr]["fileName"]);
	    photoRow.width = recordsObj[iStr]["width"];
	    photoRow.height = recordsObj[iStr]["height"];
	    csvTagsStr = recordsObj[iStr]["csvtags"];
	    photoRow.tags = csvTagsStr.split(",");

	    photos.push(photoRow);	    

	    console.log("OUR VARIABLES: PHOTROW.SRC: " + photoRow.src +" photoRow.width: " + photoRow.width + " photoRow.height: "+ photoRow.height);
	}
	callReact();

	function callReact(){
	    const reactContainer = document.getElementById("react");
	    while(reactContainer.firstChild){
		reactContainer.removeChild(reactContainer.firstChild);
	    }
	    var reactApp = ReactDOM.render(React.createElement(App),reactContainer);
	    window.dispatchEvent(new Event('resize'));
	}//where we render React DOM

	for (var i = 0; i < photos.length; i++){
	    console.log(photos[i]);
	}
    }    
}


class addTag extends React.Component {
    constructor(props) {
	super(props);
	this.thisPhoto = '';
	this.thisTag = '';
	this.addDBRequest = this.addDBRequest.bind(this);
    }
    
    addDBRequest(e){
	e.stopPropagation();
        console.log("============= ADD TAG OBJ is " + e);
	console.log("Photo: " + this.thisPhoto)   
        console.log("tag is " + e.target.value);
	console.log("typeoftag is " + typeof(e.target.value)); 
	e.stopPropagation();
	if(e.target.value!= ""){
	    console.log("TEST");
	
            console.log("This is our tag" + e.target.value+ "and Image: " + this.thisPhoto);
            var oReq = new XMLHttpRequest();

            // Build url
            console.log("Building URL!");
	    
            var url = "query?add=" + this.thisPhoto+ "+"+ e.target.value;
	    
            console.log("Our request url is " + url)
            oReq.open("GET", url);
            console.log("Opened oReq...");
	    
            // load --> when data is returned
            oReq.addEventListener("load", function(){console.log("returned from deleteFrontEnd")});
            // oReq.addEventListener("load", handleResponseMultiple);
            console.log("Added deleteFrontEnd listener...");
            oReq.send();
            console.log("Sent oReq..."); 
	}  
    }//fn


    render () {
	this.thisPhoto = this.props.photoName;
	
        return React.createElement('input',  // type
				   //{className: 'addtagText',placeholder: 'Enter a tag' , onClick: this.addDBRequest(e),  disabled: true});  // contents
				   
				   {className: 'addtagText',placeholder: 'Enter a tag' , onClick: this.addDBRequest});  // contents
    }
};    


class Tag extends React.Component {
    constructor(props) {
	super(props);
	this.thisTag = '';
	this.thisPhoto = '';
	this.sendDBRequest = this.sendDBRequest.bind(this);
	//        this.state = { tagsArray: tagsArray };
	//   this.selectTile = this.selectTile.bind(this); 
    }


    sendDBRequest(e){
	console.log("OBJ is " + e);
	e.stopPropagation();
	console.log("This is our tag" + this.thisTag+ "and Image: " + this.thisPhoto);
	var oReq = new XMLHttpRequest();
	
        // Build url
        console.log("Building URL!");
	
        var url = "query?tag=" + this.thisPhoto+ "+"+ this.thisTag;
	
        console.log("Our request url is " + url)
        oReq.open("GET", url);
        console.log("Opened oReq...");
	
        // load --> when data is returned
        oReq.addEventListener("load", function(){console.log("returned from deleteFrontEnd")});
        // oReq.addEventListener("load", handleResponseMultiple);
        console.log("Added deleteFrontEnd listener...");
        oReq.send();
        console.log("Sent oReq...");
    }
    render () {
	this.thisTag = this.props.text;
	this.thisPhoto = this.props.photoName;
	return React.createElement('p',  // type
				   { className: 'tagText', onClick : this.sendDBRequest}, // properties
				   this.props.text);  // contents
    }
};


// A react component for controls on an image tile
class TileControl extends React.Component {
    constructor(props) {
    	super(props);
	//this.photoName = this.props.photo;
    	this.sendDBRequest = this.sendDBRequest.bind(this);
    }
    
    sendDBRequest(event, obj){
	console.log("YAY"+event+obj)
    }
    addTagDB(){
	console.log("WHERE WE SEND REQUEST");
	
	
    };
    
    render () {
	// remember input vars in closure
        var _selected = this.props.selected;
        var _src = this.props.src;
	var _tags = this.props.tags;
        // parse image src for photo name
	var photoName = _src.split("/").pop();
	photoName = photoName.split('%20').join(' ');
	var allTags = [];
	//atags =  _tags;

	allTags.push('div');
	allTags.push({className: _selected ? 'selectedControls' : 'normalControls'});
	allTags.push(React.createElement(
       	        addTag,{text: "add a Tag", photoName: photoName, inputValue : ''}));
	for(var i = 0; i < _tags.length; i++){
	    allTags.push(React.createElement(
		Tag,{text: _tags[i], photoName: photoName}));
	}		    

	return (React.createElement.apply(null,allTags))

    }//render
};

// A react component for an image tile
class ImageTile extends React.Component {
    
    render() {
	// onClick function needs to remember these as a closure
	var _onClick = this.props.onClick;
	var _index = this.props.index;
	var _photo = this.props.photo;
	var _selected = _photo.selected; // this one is just for readability
//	var _addTag = this.props.addNewTag
	return (
	    React.createElement('div', 
				{style: {margin: this.props.margin, width: _photo.width},
				 className: 'tile',
				 onClick: function onClick(e) {
				     console.log("tile onclick");

				     return _onClick (e, 
						      { index: _index, photo: _photo}) 
				 }
				}, // end of props of div
				// contents of div - the Controls and an Image
				React.createElement(TileControl,
						    {selected: _selected, 
						     src: _photo.src,
						     tags: _photo.tags}),
				React.createElement('img',
						    {className: _selected ? 'selected' : 'normal', 
						     src: _photo.src, 
						     width: _photo.width, 
						     height: _photo.height
						    }
						    
   
						   )//createElement img
			       )//create elem div
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
    //React.createElement('div', {},
    //    React.createElement('input', {id: 'addTagBox'+obj.index})
    //    React.createElement('button',{onClick: addNewTag}, '+')
    //)
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
console.log("The new version...");
const reactContainer = document.getElementById("react");
var reactApp = ReactDOM.render(React.createElement(App),reactContainer);
