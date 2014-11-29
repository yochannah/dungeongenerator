var Card = Class.extend({
  init: function(xml){
  	console.log(xml);
  }
});

var Room = Card.extend({
  init: function(xml){
  	console.log("Room", xml);
  }
});


var wh = wh || {};
wh.dungeon = {
	rawTiles:{},
	current : {
		position: 0
	},
	popup : function(room) {
		//get template
		//TODO: Make this dryer. Maybe make a room object model
		var template = document.getElementById('cardTemplate'),
		name = $(room).find('name').text(),
		rules = $(room).find('rules').text(),
		flavourtext = $(room).find('flavourtext').text(),
		type = $(room).find('type').text();	
		var thedoc = window.open('',name,'width=200,height=300,top=260');
		thedoc.document.write(template.innerHTML);
		thedoc.document.querySelectorAll('h1')[0].innerHTML = name;
		thedoc.document.querySelectorAll('.rules')[0].innerHTML = rules;
		thedoc.document.querySelectorAll('.cardType')[0].innerHTML = type;
		thedoc.document.querySelectorAll('.flavourtext')[0].innerHTML = flavourtext;
	},
	getNextCard : function(){
		var position = wh.dungeon.current.position;
		wh.dungeon.current.position++;
		
		position = wh.dungeon.current.order[position];
		if(position === "Objective") {
			wh.dungeon.handleObjective();
			return wh.dungeon.getObjective();
		}
		return wh.dungeon.rawTiles.nonObjectives[position];
	},
	handleObjective : function() {
	 	var liveArea = document.getElementById('liveGame');
	 	liveArea.className += "objectiveRoom";
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
	getObjective : function (index) {
		if(typeof index == "number") {
			return wh.dungeon.rawTiles.allObjectives[index];
		} else if (wh.dungeon.current.objective) {
			return wh.dungeon.current.objective;
		} else {
			return false;
		}		
	},
	setupObjectives : function() {
		var objectiveList = document.getElementById('objectiveType'),
		objs = wh.dungeon.getTileType('Objective'),
		objHtml = "";
		wh.dungeon.rawTiles.allObjectives = objs;
		$.each(objs, function(i,v) {
			objHtml += "<li data-index='" + i +"'>" + $(v).find('name').text() + "</li>";
		});
		objectiveList.innerHTML = objHtml;
		wh.dungeon.handleObjectiveClicks();
	},
	handleObjectiveClicks : function() {
		$(document.getElementById('objectiveType')).on('click','li', function(e) {
			console.log($(e.target).data('index'))
			var obj = wh.dungeon.getObjective($(e.target).data('index'));
			wh.dungeon.setObjective(obj);
			//only highlight one at once.
			if(document.querySelectorAll('.selected').length) {
				document.querySelectorAll('.selected')[0].className="";
			}
			e.target.className = "selected";
			wh.dungeon.showGenerator();
			wh.dungeon.handleGeneratorClicks();
		});
	},
	handleGeneratorClicks : function() {
		$(document.getElementById('generateDungeon')).click(function() {
			wh.dungeon.current.numberOfTiles = wh.dungeon.getNumberOfRooms();
			document.getElementById('roomNumber').innerHTML = (wh.dungeon.current.numberOfTiles);
			wh.dungeon.generateDungeon();
			document.getElementById('liveGame').style.display = "block";
			document.getElementById('gameSetup').style.display = "none";
			//first card, yay
    	    wh.dungeon.showCard(wh.dungeon.getNextCard());
		});
	},
	showGenerator : function() {
		document.getElementById('generateDungeon').style.display = 'block';		
	},
	generateDungeon : function(){
		//count non-dungeon tiles
		var tiles = wh.dungeon.getAllButTileType('Objective'), nos, 
		finalArray = [], firstHalf = [], secondHalf = [],
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
		console.log(($(objective).find('name').text()));
		document.getElementById('scenarioName').innerHTML = ($(objective).find('name').text());
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
	shuffle : function (array) { 
		//http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
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
	},
	showCard : function (room) {
		var cardArea = document.getElementById('liveCards'),
	    template = document.getElementById('cardTemplate').innerHTML,
		name = $(room).find('name').text(),
		rules = $(room).find('rules').text(),
		flavourtext = $(room).find('flavourtext').text(),
		type = $(room).find('type').text();	
		
		cardArea.innerHTML = template;			
		
		cardArea.querySelectorAll('h1')[0].innerHTML = name;
		cardArea.querySelectorAll('.flavourtext')[0].innerHTML = flavourtext;	
		cardArea.querySelectorAll('.cardType')[0].innerHTML = type;	
		cardArea.querySelectorAll('.rules')[0].innerHTML = rules;	
		
	}
};



$(document).ready(function(){
	
	wh.dungeon.init();

    $('#generateRoom').click(function(){
    	var card = wh.dungeon.getNextCard();
    	console.log(card);
    	wh.dungeon.showCard(card);
    });
    
});