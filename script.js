var wh = wh || {};
wh.dungeon = {
	rawTiles:{},
	current : {},
	popup : function(room) {
		//get template
		var templateText = document.getElementById('cardTemplate').innerHTML;
		
	
		var thedoc = window.open('','test','width=100,height=200,addressBar=0');
		thedoc.document.write(templateText);
	},
	shownTiles : [],
	readDungeon : function() {
		$.ajax({
        	type: "GET",
	        url: "dungeonclassic.xml",
    	    dataType: "xml",
        	success: wh.dungeon.setRawTiles
	    });	
	},
	setRawTiles : function(xml) {
		wh.dungeon.rawTiles = $(xml);
	},
	getTileType : function (type) {
		var tiles = $.extend(true,{},wh.dungeon.rawTiles),
		items = $(tiles).find("tile").filter(function(){
              return $('type', this).text() == type;
        });		
		return items;
	},
	getAllButTileType : function (type) {
		var tiles = $.extend(true,{},wh.dungeon.rawTiles),
		items = $(tiles).find("tile").filter(function(){
              return $('type', this).text() != type;
        });		
		return items;
	},
	getNumberOfRooms : function() {
		return document.getElementById('numberOfRoomsInput').value;
	},
	setupObjectives : function() {
		var objectiveList = document.getElementById('objectiveType'),
		objs = wh.dungeon.getTileType('Objective'),
		objHtml = "";
		wh.dungeon.rawTiles.allObjectives = objs;
		$.each(objs, function(i,v) {
			objHtml += "<li>" + $(v).find('name').text() + "</li>";
		});
		objectiveList.innerHTML = objHtml;
		wh.dungeon.handleObjectiveClicks();
	},
	handleObjectiveClicks : function() {
		$(document.getElementById('objectiveType')).on('click','li', function(e) {
			wh.dungeon.setObjective(e.target.innerHTML);
			//only highlight one at once.
			if(document.querySelectorAll('.selected').length) {
				document.querySelectorAll('.selected')[0].className="";
			}
			e.target.className = "selected";
			wh.dungeon.handleGeneratorClicks();
		});
	},
	handleGeneratorClicks : function() {
		$(document.getElementById('generateDungeon')).click(function() {
			wh.dungeon.current.numberOfTiles = wh.dungeon.getNumberOfRooms();
			wh.dungeon.generateDungeon();
		});
	},
	generateDungeon : function(){
		//count non-dungeon tiles
		var tiles = wh.dungeon.getAllButTileType('Objective'), nos, 
		finalArray = [],
		firstHalf = [],
		secondHalf = [],
		divisionIndex;
		wh.dungeon.rawTiles.nonObjectives = nos = tiles;
		//generate x random numbers / tile references
				divisionIndex = wh.dungeon.getDivisionIndex();

		for(var i = 0; i < nos.length;i++) {
			finalArray.push(i);
		}
		
		finalArray = wh.dungeon.shuffle(finalArray); 
		finalArray = finalArray.slice(0,wh.dungeon.current.numberOfTiles-1);
		firstHalf = finalArray.slice(0,divisionIndex);
		secondHalf = finalArray.slice(divisionIndex);
		secondHalf.push('Objective');
		secondHalf = wh.dungeon.shuffle(secondHalf);
		finalArray = firstHalf.concat(secondHalf);
		wh.dungeon.current.order = finalArray;
	},
	setObjective : function(objective) {
		wh.dungeon.current.objective = objective;
	},
	getDivisionIndex : function() {
		divisor = 2;
		divisionIndex = wh.dungeon.current.numberOfTiles / divisor;
		return Math.ceil(divisionIndex);
	},
	init : function() {
		wh.dungeon.readDungeon();
		$(document).ajaxComplete(function() {
			wh.dungeon.setupObjectives();
		});
	},
	shuffle : function (array) { //http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
		var currentIndex = array.length, temporaryValue, randomIndex ;

  		// While there remain elements to shuffle...
  		while (0 !== currentIndex) {

	    	// Pick a remaining element...
    		randomIndex = Math.floor(Math.random() * currentIndex);
    		currentIndex -= 1;

	    	// And swap it with the current element.
    		temporaryValue = array[currentIndex];
    		array[currentIndex] = array[randomIndex];
    		array[randomIndex] = temporaryValue;
		}
  		return array;
	}
};

$(document).ready(function(){
	
	wh.dungeon.init();

    $('#generateRoom').click(function(){
    	console.log('yay, clicked');
    	wh.dungeon.popup();
    });
    
});