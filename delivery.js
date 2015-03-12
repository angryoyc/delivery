/** @module delivery
 * @name delivery
 * @author Serg A. Osipov
 * @email serg.osipov@gmail.com
 * @overview Доставка сообщений раличными траспортами: почта, SMS, SMS-сервис
 */
module.exports=function(conf){
	return {
		mail: require('./modules/mail')(conf)
	}
};
