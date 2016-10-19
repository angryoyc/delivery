delivery
-----

Simple wrap for delivery services: email, SMS and etc.


Install
--------

npm install git+https://github.com/angryoyc/delivery.git


Example
--------
```
var delivery = require('delivery');
var conf = {
	"service": "Gmail",
	"user": "abunfv@gmail.com",
	"pass": "abunfv"
};
delivery.mail.send({to: 'abunfv@gmail.com', subj: 'test1', text: 'test1 text'}, conf, 2,
	function(result){
		console.log(result);
	},
	function(err){
		console.log(err);
	}
);

```

Tests
------
1. Copy ./test/config.json.example to ./test/config.json
2. Edit ./test/config.json end set the correct sender mail parameters and then
```
make test
```
