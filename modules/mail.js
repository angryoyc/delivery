/** @module mail
 * @name mail
 * @author Serg A. Osipov
 * @email serg.osipov@gmail.com
 * @overview Отправка почты с промайсами и попытками.
 */

var nodemailer = require("nodemailer");
var q=[]; // очередь заданий на отправку
var busy=false;
var q_delay = 3000; // неуспешные задания ждут в очереди 3 секунды
var q_retry_max = 10; // количество попыток отправки почты, прежде, чем задание будет полностью снято

var RSVP = require('rsvp');
var cf = require('cf');

module.exports=function(){
/**
 * Обработка очереди
 * @return {undefined}
 */
	var do_next = function(){
		if(!busy && q.length>0){
			busy=true;
			var task=q.shift();
			if(task.start_last && ((new Date() - task.start_last)<q_delay)){
				q.push(task);					// если задание еще не настоялось после последней неудачной попытки, то возвращаем задание в очередь
				busy = false;					// продолжаем ожидания следующей попытки.
			}else{
				directsend(task.arg, task.conf)
				.then(
					function(result){
						//- console.log('mail to ' + task.arg.to, 'successfuly sended!');
						busy = false;			// задание успешно отработано.
						task.resolve(result);
					},
					function(err){
						//- console.log(err);
						if(task.trycount > 0){
							task.trycount--;
							task.start_last = new Date();
							q.push(task);		// возвращаем задание в очередь
							busy = false;
						}else{
							busy = false;
							task.reject(err);
						};
					}
				).catch(function(err){
					busy = false;
					task.reject(err);
				});
			};
		};
	}

/**
 * Постановка задания в очередь
 * @param  {Object} arg         	Объект, описывающий параметры письма: кому, тема. тело письма, аттачменты
 * @param  {number} number_of_try	Количество попыток.
 * @return {Promise}            	Промайс, resolve которого получит результат выполнения операции или reject получит последнюю ошибку
 */
	var push = function(arg, conf, number_of_try, resolve, reject){
		var task = {
			trycount: Math.min(number_of_try, q_retry_max),
			arg: arg,
			conf: conf,
			start_first: new Date(),
			resolve: resolve,
			reject: reject
		};
		q.push(task);
		process.nextTick(do_next);
	}

/**
 * Основной метод - отправка почты.
 * @param  {Object} arg         	Объект, описывающий параметры письма: кому, тема. тело письма, аттачменты
 * @return {Promise}            	Промайс, resolve которого получит результат выполнения операции или reject получит ошибку
 */
	var directsend = function (arg, conf, resolve, reject){
		var transport_options={auth:{}};
		if(conf.service){
			transport_options.service=conf.service;
		}else{
			transport_options.host=conf.host;
			transport_options.port=conf.port;
			if(conf.secure){
				transport_options.secure=true;
				transport_options.secureConnection=true;
			};
		};
		transport_options.auth.user=conf.user;
		transport_options.auth.pass=conf.pass;
		var transport = nodemailer.createTransport(transport_options);
		var mail_options={};
		mail_options.from = 'Система оповещения '+conf.name+' <'+conf.user+'>';
		if(isArray(arg.to)){
			var a=[];
			arg.to.forEach(function(item){
				if(isObject(item)){
					a.push(item.email);
				}else if(typeof(item)=='string'){
					a.push(item);
				};
			});
			mail_options.to = a.join(', ');
		}else if(typeof(arg.to)=='string'){
			mail_options.to=arg.to;
		};
		if(mail_options.to.length>0){
			mail_options.subject=arg.subj;
			mail_options.text=arg.text;
			if(arg.attachments){
				arg.attachments.forEach(function(att){
					att.filename = translit(att.filename);
				});
				mail_options.attachments=arg.attachments;
			};
			transport.sendMail(mail_options, function (err, info) {
				if(!err) {
					var data={};
					data.sent=true;
					//- console.log("Mail sent: " + info.response);
					data.info=info;
					transport.close();
					resolve(data);
				}else{
					//- console.log("Mail send error: " + err.message);
					transport.close();
					reject(err);
				};
			});
		}else{
			reject(new Error('Mail send: Empty destination address'));
		};
	} 

	var mail={
/*
		send2: function(arg, conf, number_of_try){
			if(number_of_try>0){
				return push(arg, conf, number_of_try);
			}else{
				return directsend(arg, conf);
			};
		},
*/
		send: function(arg, conf, number_of_try, cb, cb_err, data){
			return cf.asy(arguments, function(arg, conf, number_of_try, resolve, reject){
				if(number_of_try>0){
					push(arg, conf, number_of_try, resolve, reject);
				}else{
					directsend(arg, conf, resolve, reject);
				};
			});
		}
	};

	setInterval(do_next, 1000);
	return mail;
};


// Вспомогательная мелочёвка
function isArray(obj){
	if(typeof(obj)=='undefined') return false;
	return Object.prototype.toString.call(obj) == '[object Array]';
};

function isObject(obj){
	if(typeof(obj)=='undefined') return false;
	return Object.prototype.toString.call(obj) == "[object Object]";
};

function translit(s){
	var A = new Array();
	A["Ё"]="YO";A["Й"]="I";A["Ц"]="TS";A["У"]="U";A["К"]="K";A["Е"]="E";A["Н"]="N";A["Г"]="G";A["Ш"]="SH";A["Щ"]="SCH";A["З"]="Z";A["Х"]="H";A["Ъ"]="'";
	A["ё"]="yo";A["й"]="i";A["ц"]="ts";A["у"]="u";A["к"]="k";A["е"]="e";A["н"]="n";A["г"]="g";A["ш"]="sh";A["щ"]="sch";A["з"]="z";A["х"]="h";A["ъ"]="'";
	A["Ф"]="F";A["Ы"]="I";A["В"]="V";A["А"]="A";A["П"]="P";A["Р"]="R";A["О"]="O";A["Л"]="L";A["Д"]="D";A["Ж"]="ZH";A["Э"]="E";
	A["ф"]="f";A["ы"]="i";A["в"]="v";A["а"]="a";A["п"]="p";A["р"]="r";A["о"]="o";A["л"]="l";A["д"]="d";A["ж"]="zh";A["э"]="e";
	A["Я"]="YA";A["Ч"]="CH";A["С"]="S";A["М"]="M";A["И"]="I";A["Т"]="T";A["Ь"]="'";A["Б"]="B";A["Ю"]="YU";
	A["я"]="ya";A["ч"]="ch";A["с"]="s";A["м"]="m";A["и"]="i";A["т"]="t";A["ь"]="'";A["б"]="b";A["ю"]="yu";
	return s.replace(/([\u0410-\u0451])/g,
		function (str, p1, offset, s) {
			if (A[str] != 'undefined'){return A[str];}
		}
	);
};
