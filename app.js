'use strict'

var Koa  = require('koa');
var path = require('path');
var wechat  = require('./wechat/g');
var Wechat = require('./wechat/wechat');
var util  = require('./libs/util');
var config = require('./config');
var crypto = require('crypto');
var weixin = require('./wx/reply');
var fs  = require('co-fs')
var wechat_file = path.join(__dirname,'./config/wechat.json')


//view
var movie = require('./view/movie.js');

var app = new Koa();
var ejs = require('ejs');
var heredoc = require('heredoc');

var createNonce = function(){
	return Math.random().toString(36).substr(2,15);
}

var createTimeTamp = function(){
	return 	parseInt(new Date().getTime()/1000,10)+'';
}
var _sign = function(noncestr,ticket,timestamp,url){
	var params = [
		'noncestr=' + noncestr,
		'jsapi_ticket=' + ticket,
		'timestamp=' + timestamp,
		'url=' + url 
	]
	var str = params.sort().join('&');
	var shasum = crypto.createHash('sha1');
	shasum.update(str);
	return shasum.digest('hex');
}
function sign(ticket , url){
	var noncestr = createNonce();
	var timestamp = createTimeTamp();
	var signature = _sign(noncestr,ticket,timestamp,url);
	return {
		noncestr  : noncestr ,
		timestamp : timestamp,
		signature : signature
	}
}

//如果路径中包涵电影路径则拦截路由
app.use(function *(next){
	//读取js接口安全域名配置文件
	if(this.url.indexOf('MP_verify_4MHoSDsVNCGBrjE2') > -1){
		this.body = yield fs.readFile('./public/MP_verify_4MHoSDsVNCGBrjE2.txt', 'utf8')
		return next;
	}
	//根据路由判断静态资源
	if(this.url.indexOf('public') > -1){
		this.body = yield fs.readFile('.'+this.url, 'utf8')
		return next;
	}
	if (this.url.indexOf('movie') > -1) {
		var wechatApi 		= new Wechat(config.wechat);
		var data 			= yield wechatApi.fetchAccessToken();
		var access_token 	= data.access_token;
		var ticketData 		= yield wechatApi.fetchTicket(access_token);
		var ticket 			= ticketData.ticket;
		var url			    = this.href;
		var params 			= sign(ticket , url);
		this.body 			= movie.compiled(params);
		return next;
	}
	yield next;
});
app.use(wechat(config.wechat , weixin.reply))

app.listen(4443);
console.log("listen : 4443");