'use strict'
var path = require('path');
var wechat  = require('./wechat/g');
var util  = require('./libs/util');
var wechat_file = path.join(__dirname,'./config/wechat.json')
var wechat_ticket_file = path.join(__dirname,'./config/wechat_ticket.json')

var config = {
	wechat:{
		appId:'wx7615edc40c9af2db',
		appSecret:'1a9aa3d473200a2fd48c4de79784d1cc',
		token:'wx7615edc40c9af2db',
		getAccessToken 	: 	function(){
			return util.readFileAsync(wechat_file)
		},
		saveAccessToken : 	function(data){
			data = JSON.stringify(data);
			return util.writeFileAsync(wechat_file,data)
		},
		getTicket 		: 	function(){
			return util.readFileAsync(wechat_ticket_file)
		},
		saveTicket 		: 	function(data){
			data = JSON.stringify(data);
			return util.writeFileAsync(wechat_ticket_file,data)

		},
	}
}

module.exports = config;