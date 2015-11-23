#!/usr/local/bin/node
var should = require('should');

var delivery = require('../delivery');
var conf={
	"service": "Gmail",
	"user": "serg.osipov@gmail.com",
	"pass": "wbrkjgtynfygthublhjatyfynhty4865"
};

describe('delivery', function(){
	describe('mail', function(){
		describe('send', function(){
			it('should send mail and return object', function(done){
				this.timeout(15000);
				delivery.mail.send({to: 'serg.osipov@gmail.com', subj: 'test1', text: 'test1 text'}, conf, 2,
					function(result){
						result.should.type('object');
						result.info.should.type('object');
						result.info.accepted.should.type('object');
						result.info.accepted.length.should.above(0);
						done();
					},
					done
				)
			});
		});
	});
});
