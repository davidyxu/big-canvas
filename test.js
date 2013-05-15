mongo linus.mongohq.com:10045/app15526437 -u <user> -p<password>

mongo = require('mongodb')
Server = mongo.Server
Db = mongo.Db
BSON = mongo.BSONPure;
con = null;

server = new Server('linus.mongohq.com', '10045', {auto_reconnect: true});
DBCon = new Db('app15526437', server, {safe: false});
DBCon.open(function(err, db) {
  if(!err) {
    db.authenticate('heroku', 'testtest', function(err){
      if(!err) con = db;
      collection = new mongo.Collection(con, "canvasURI");
      metaCollection = new mongo.Collection(con, "overviewURI");

    })
  }
});

				metaCollection = new mongo.Collection(con, "overviewURI");
				loadEdges();
					app.get('/overview', function (req, res) {
	  res.sendfile(__dirname + '/overview.html');
	});


	loadEdges();

				if (startX > largestX) {
				largestX = startX;
				changedEdges = true;
			} else if (startX < smallestX) {
				smallestX = startX;
				changedEdges = true;
			}

			if (startY > largestY) {
				largestY = startY;
				changedEdges = true;
			} else if (startY < smallestY) {
				smallestY = startY;
				changedEdges = true;
			}


			loadEdges = function() {
	metaCollection.find({edges: { $exists : true }}).nextObject(function(err, docs) {
		if (err) {
			console.log(err);
		} else if (docs) {
			largestX = docs.edges.largestX;
			largestY = docs.edges.largestY;
			smallestX = docs.edges.smallestX;
			smallestY = docs.edges.smallestY;	

			updateOverview();
		}
	});
}


updateOverview = function() {
	var loadedImages = {};
	var loadedImagesSize = 0;

	var width = largestX - smallestX;
	var height = largestY - smallestY;

	if (height > width) {
		var scale = 2/height;
	} else {
		var scale = 2/width;
	}

	collection.find({}).toArray(function(err, results) {
		if (err) {
			console.log(err);
		} else if (results) {
			console.log(results.length);
			for (var i = 0; i < results.length; i++) {
				var parsedID = results[i].roomID.slice(1).split('y');
				var x = parseInt(parsedID[0]);
				var y = parseInt(parsedID[1]);

				var offsetX = (x - smallestX) * scale * dimension;
				var offsetY = (y - smallestY) * scale * dimension;

				loadedImages[i] = new Image();

				loadedImages[i].offsetX = offsetX
				loadedImages[i].offsetY = offsetY

				loadedImages[i].onload = function() {
					if (++loadedImagesSize >= results.length) {
						drawImages(loadedImages, scale);
					}
				};
				loadedImages[i].src = results[i].uri;
			}
		}
	});
}


drawImages = function(loadedImages, scale) {
	var overviewCanvas = new Canvas(4000, 4000);
	var context = overviewCanvas.getContext('2d');	

	for (var i in loadedImages) {
		context.drawImage(loadedImages[i], loadedImages[i].offsetX, loadedImages[i].offsetY, scale, scale);
	}

	metaCollection.update({overview: {$exists: true}}, {$set: {overview: overviewCanvas.toDataURL()}}, {safe: true, upsert: true}, function(err, object) {
		if (err) {
			console.log("Overview: " + err);
		} else {
			console.log("Overview updated");
		}
	});
}



	if (changedEdges) {
		var edges = {
			smallestX: smallestX, 
			smallestY: smallestY,
			largestX: largestX,
			largestY: largestY
		};
		metaCollection.update({edges: { $exists : true }}, {$set: {edges: edges}}, {safe: true, upsert: true}, function(err, object) {
			if (err) {
				console.log("Edges: " + err);
			} else {
				console.log("Edges updated");
				changedEdges = false;
				updateOverview();
			}
		});
	}
		socket.on('getOverview', function() {
			metaCollection.find({overview: {$exists: true}}).nextObject(function(err, docs) {
				if (err) {
					console.log(err);
				} else if (docs) {
					socket.emit('loadOverview', docs.overview);
				}
			});
		})

