"use-strict";
//Connect to vsblty-cluster with a random clientId
var server = 'nats://3.85.168.100:4222';
var cluster = 'vsblty-cluster';
var clientId = 'vsblty-nodejs-sub-' +  Math.floor((Math.random() * 10000) + 1);
var stan = require('node-nats-streaming').connect(cluster, clientId, {url: server});

stan.on('connect', function () {	
  console.log('Connected to ' + cluster + ' as client ' + clientId + '\n\n');
  
  //Channel to subscribe: 'vsblty-channel-facialrecognition-' + endpointId (Guid)
  var endpointId = '40908dc9-a792-4aab-84f8-c7024b14c72a';
  //IdentitySearch
  //var channel = 'vsblty-channel-facialrecognition-' + endpointId;
  //Object detecttion
  //var channel = 'vsblty-channel-objectdetection-' + endpointId;
  //Metrics - DataCaptor
  var channel = 'vsblty-channel-frameprocessed-' + endpointId;
  
  // Subscribe and get all available messages
  var opts = stan.subscriptionOptions().setDeliverAllAvailable();
  var subscription = stan.subscribe(channel, opts);
  subscription.on('message', function (msg) {
    //console.log('Received a message with sequence [' + msg.getSequence() + ']');
	
	//Generate json filename based on sequence and date
	var dateFormat = require('dateformat');
	var actualDate = dateFormat(new Date(), "yyyymmddhMMss");
	var filename = msg.getSequence() + '_' + actualDate + '.json';
	
	//Write json file with received data
	var fs = require('fs');
	fs.writeFile ('./files/' + filename, msg.getData(), function(err) {
		if (err) throw err;
		console.log('Writing file ' + filename + ' to disk completed!\n');
	});
  });
});

stan.on('close', function() {
  process.exit();
});

