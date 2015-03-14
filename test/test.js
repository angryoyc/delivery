#!/usr/local/bin/node
var RSVP = require('rsvp');

var delivery = require('../delivery');
var conf={
	"service": "Gmail",
	"user": "serg.osipov@gmail.com",
	"pass": "wbrkjgtynfygthublhjatyfynhty4865"
};



delivery.mail.send({to: 'serg.osipov@gmail.com', subj: 'test1', text: 'test1 text'}, conf, 2,
	function(result){
		console.log(result);
	},
	function(err){
		console.log(err);
	}
);
console.log('Ok, Google!');
/*
*/