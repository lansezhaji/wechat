'use strict'
var sha1 = require('sha1');
var Promise = require('bluebird');
var request = require('request');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');
var util = require('./util');



module.exports = function(opts,handler){
	var wechat  = new Wechat(opts)
	return function *(next){
		console.log(this.query);
		var that  = this;
		var token = opts.token;
		var signature = this.query.signature;
		var nonce = this.query.nonce;
		var timestamp = this.query.timestamp;
		var echostr = this.query.echostr;
		var str = [token ,timestamp , nonce].sort().join('');
		var sha = sha1(str);

		if (this.method === 'GET') {
			console.log('message from get');
			if (sha === signature) {
				this.body = echostr + '';
			}
			else{
				this.body = "your request is error"
			}
		}else if (this.method === 'POST') {
			console.log('message from Post');

			if (sha != signature) {
				this.body = 'error'
				return false;
			}
			var data = yield getRawBody(this.req,{
				length:this.length,
				limit:'1mb',
				encoding:this.charset
			})
			var content = yield util.parseXMLAsync(data)
			console.log('---------------- 这里是分割线啦 --------------------');
			var message  = util.formatMessage(content.xml);
			console.log(message);
			// －－－－－－－－－－－－－－－－ 自动回复 －－－－－－－－－－－－－
			this.weixin  = message;
			yield handler.call(this,next);  
			wechat.reply.call(this);
			return 	
		}

		if (sha == signature) {
			this.body = echostr + '';
		}else{
			console.log('=========== 签名信息不正确 =================');
			console.log(sha);
			console.log(signature);
			this.body = '=========== 签名信息不正确 =================';
		}
	}
}

