'use strict'

var xml2js = require('xml2js');
var Promise = require('bluebird');
var tpl = require('./tpl');
exports.parseXMLAsync = function(xml){
	return new Promise(function(resolve,reject){
		xml2js.parseString(xml,{trim:true},function(err,content){
			if (err) {reject(err)}
			else resolve(content)
		})
	})
}

function formatMessage(result){
	var message = {}
	if (typeof result == 'object') {
		var keys  = Object.keys(result)

		for (var i = keys.length - 1; i >= 0; i--) {
			var item = result[keys[i]];
			var key  = keys[i]

			if (!(item instanceof Array) || item.length == 0) {
				continue;
			}
			if (item.length == 1) {
				var val = item[0];
				if (typeof val == 'object') {
					message[key] = formatMessage(val)
				}else{
					message[key] = (val || '').trim()
				}
			}
			else{
				message[key] = []
				for (var j = item.length - 1; j >= 0; j--) {
					message[key].push(formatMessage(item[j]))
				}
			}
		}
	}
	return message;
}

exports.formatMessage = formatMessage;

exports.tpl = function(content,message){
	console.log('----content-----');
	console.log(content);
	console.log('----message-----');
	console.log(message);
	var info = {}
	var type = 'text'
	var fromUserName = message.FromUserName
	var toUserName = message.ToUserName
	if (Array.isArray(content)) {
		type = 'news'
	}
	type = content.type || type;
	info.content = content
	info.createTime = new Date().getTime();
	info.msgType = type;
	info.toUserName = fromUserName;
	info.fromUserName = toUserName;
	console.log('------- info --------');
	console.log(info);
	var tt =  tpl.compiled(info);
	 console.log('------- finished --------');
	 console.log(tt);
	return tt;
}