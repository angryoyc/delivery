/** @module sms
 * @name sms
 * @author Serg A. Osipov
 * @email serg.osipov@gmail.com
 * @overview Отправка sms с промайсами и попытками.
 */
'use strict';
var nodemailer = require("nodemailer");
var q = []; // очередь заданий на отправку
var busy = false;
var q_delay = 3000; // неуспешные задания ждут в очереди 3 секунды
var q_retry_max = 10; // количество попыток отправки почты, прежде, чем задание будет полностью снято

//var RSVP = require('rsvp');
var cf = require('cf');


/**
 * Точка входа. Здесь формируется задание на отправку почты, которое будет стоять в очереди, отправляться и т.п.
 * @return {undefined}
 */
exports.send = function(arg, conf, number_of_try, cb, cb_err, data){
	return cf.asy(arguments, function(arg, conf, number_of_try, resolve, reject){
		if(number_of_try>0){
			push(arg, conf, number_of_try, resolve, reject);
		}else{
			directsend(arg, conf, resolve, reject);
		};
	});
};

setInterval(do_next, 1000);


/**
 * Обработка очереди
 * @return {undefined}
 */
function do_next(){
	if(!busy && q.length>0){
		busy=true;
		var task=q.shift();
		if(task.start_last && ((new Date() - task.start_last)<q_delay)){
			q.push(task);					// если задание еще не настоялось после последней неудачной попытки, то возвращаем задание в очередь
			busy = false;					// продолжаем ожидания следующей попытки.
		}else{
			directsend(task.arg, task.conf,
				function(result){
					//- console.log('sms to ' + task.arg.to, 'successfuly sended!');
					busy = false;			// задание успешно отработано.
					task.resolve(result);
				},
				function(err){
					//- console.log(err);
					task.trycount--;
					if(task.trycount > 0){
						task.start_last = new Date();
						q.push(task);		// возвращаем задание в очередь
						busy = false;
					}else{
						busy = false;
						task.reject(err);
					};
				}
			);
		};
	};
}

/**
 * Постановка задания в очередь
 * @param  {Object} arg         	Объект, описывающий параметры письма: кому, текст сообщения
 * @param  {number} number_of_try	Количество попыток.
 * @return {Promise}            	Промайс, resolve которого получит результат выполнения операции или reject получит последнюю ошибку
 */
function push(arg, conf, number_of_try, resolve, reject){
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
 * Основной метод - отправка sms.
 * @param  {Object} arg         	Объект, описывающий параметры сообщения: кому, текст сообщения
 * @return {Promise}            	Промайс, resolve которого получит результат выполнения операции или reject получит ошибку
 */
function directsend(arg, conf, resolve, reject){
	if(true){
		reject(new Error('SMS send: Not implemented'));
	}else{
		reject(new Error('SMS send: Empty destination address'));
	};
};
