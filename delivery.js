/** @module delivery
 * @name delivery
 * @author Serg A. Osipov
 * @email serg.osipov@gmail.com
 * @overview Доставка сообщений раличными траспортами: почта, SMS, SMS-сервис
 */
'use strict';
var mail = require('./modules/mail');
var sms = require('./modules/sms');
module.exports={
	mail: mail,
	sms: sms
};
