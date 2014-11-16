var wh = wh || {};
wh.dungeon = {
	rawTiles:{},
	current : {},
	popup : function(room) {
		var thedoc = window.open('','test','width=100,height=100,titlebar=0');
		thedoc.document.write('BOOO');
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
		var tiles = wh.dungeon.rawTiles,
		items = $(tiles).find("tile").filter(function(){
              return $('type', this).text() == type;
        });		
        console.log(items)
		return items;
		},
	setupObjectives : function() {
		var objectiveList = document.getElementById('objectiveType'),
		objs = wh.dungeon.getTileType('Objective'),
		objHtml = "";
		$.each(objs, function(i,v) {
			objHtml += "<li>" + $(v).find('name').text() + "</li>";
		});
		objectiveList.innerHTML = objHtml;
		wh.dungeon.handleObjectiveClicks();
	},
	handleObjectiveClicks : function() {
		$(document.getElementById('objectiveType')).on('click','li', function(e) {
			console.log('cleek');
			wh.dungeon.setObjective(e.target.innerHTML);
		});
	},
	setObjective : function(objective) {
		wh.dungeon.current.objective = objective;
		wh.dungeon.current.numberOfTiles = document.getElementById('numberOfRooms').value;
	},
	init : function() {
		wh.dungeon.readDungeon();
		$(document).ajaxComplete(function() {
			wh.dungeon.setupObjectives();
		});
	}
};

$(document).ready(function(){
	
	wh.dungeon.init();

    $('#generateRoom').click(function(){
    	console.log('yay, clicked');
    	wh.dungeon.popup();
    });
    
});