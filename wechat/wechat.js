'use strict'

var sha1 = require('sha1');
var Promise = require('bluebird');
var request = require('request');
var util = require('./util');
var _ = require('lodash');
var fs = require('fs');

var bathPath = "https://api.weixin.qq.com/cgi-bin/";
var semanticUrl = "https://api.weixin.qq.com/semantic/search?" ;
var api = {
	semanticUrl : semanticUrl , //语意化接口
	access_token : bathPath+'token?grant_type=client_credential',
	temporary:{
		upload:bathPath+'media/upload?',
		fetch:bathPath+'media/fetch'
	},
	permanent:{
		fetch:bathPath+'material/get_material?',
		upload:bathPath+'material/add_material?',
		uploadNews:bathPath+'material/add_news?',
		uploadNewsPic:bathPath+'media/uploadimg?',
		del:bathPath+'material/del_meterial?',
		update:bathPath+'material/update_news?',
		count:bathPath+'material/get_materialcount?',
		batch:bathPath+'material/batchget_material?',

	},
	group:{
		create 			: bathPath + 'groups/create?',
		fetch 			: bathPath + 'groups/get?',
		check 			: bathPath + 'groups/getid?',
		update 			: bathPath + 'groups/update?',
		move 			: bathPath + 'groups/members/update?',
		batchupdate 	: bathPath + 'groups/members/batchupdate?',
		del 			: bathPath + 'groups/delete?',

	},
	user:{
		remark 		: bathPath + 'user/info/updateremark?',
		fetch 		: bathPath + 'user/info?',
		batchFetch 	: bathPath + 'user/info/batchget?',
		list 		: bathPath + 'user/get?',//获取关注列表
	},
	mass : {
		group : bathPath + 'message/mass/sendall?',
	},
	menu : {
		create	: bathPath + 'menu/create?',
		get 	: bathPath + 'menu/get?',
		del		: bathPath + 'menu/delete?',
		current : bathPath + 'get_current_selfmeu_info?'
	},
	ticket : {
		get : bathPath + 'ticket/getticket?'
	}
	
}

//获取toke
Wechat.prototype.fetchAccessToken = function(data){
	var that = this; 
	return this.getAccessToken()
		.then(function(data){
			// console.log('正在获取token：'+data);
			try{
				data = JSON.parse(data)
			}catch(e){
				return that.updateAccessToken(data)
			}

			if (that.isValidAccessToken(data)) {
				return Promise.resolve(data)
			}else{
				console.log("token 失效，重新校验");
				return that.updateAccessToken();
			}
		}).then(function(data){
			console.log("复制token："+JSON.stringify(data) );
			that.saveAccessToken(data);
			return Promise.resolve(data);
		})
}
//获取票据
Wechat.prototype.fetchTicket = function(access_token){
	var that = this;
	// console.log('－－－－－－－－ 		fetchTicket	－－－－－－+   access_token－－－－－:'+access_token);
	return this.getTicket()
		.then(function(data){
			// console.log('获取ticket：'+data);
			try{
				data = JSON.parse(data)
			}catch(e){
				return that.updateTicket(access_token)
			}

			if (that.isValidAccessToken(data)) {
				return Promise.resolve(data)
			}else{
				console.log("token 失效，重新校验");
				return that.updateTicket(access_token);
			}
		}).then(function(data){
			console.log("复制token："+data);
	
			that.saveTicket(data);
			return Promise.resolve(data);
		})
}
Wechat.prototype.isValidAccessToken = function(data){
	if (!data || !data.access_token || !data.expires_in) {
		return false;
	}

	var access_token = data.access_token;
	var expires_in = data.expires_in;
	var now = (new Date().getTime())

	if (now < expires_in) {
		console.log("校验token成功");
		return true;
	}else{
		console.log("校验token失败");
		return false;
	}
}

Wechat.prototype.isValidTicket = function(data){
	if (!data || !data.ticket || !data.expires_in) {
		return false;
	}

	var ticket = data.ticket;
	var expires_in = data.expires_in;
	var now = (new Date().getTime())

	if (ticket && now < expires_in) {
		console.log("校验token成功");
		return true;
	}else{
		console.log("校验token失败");
		return false;
	}
}

Wechat.prototype.updateAccessToken = function(){
	var appId = this.appId;
	var appSecret = this.appSecret;
	var url = api.access_token + "&appid="+appId+"&secret="+appSecret;

	return new Promise(function(resolve,reject){
		request(url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			var now = (new Date().getTime())
			var expires_in = now + (data.expires_in -20)*1000;

			data.expires_in = expires_in
			resolve(data)
		  }
		})

	})
}
Wechat.prototype.updateTicket = function(access_token){
	var appId = this.appId;
	var appSecret = this.appSecret;
	var url = api.ticket.get + "&access_token="+access_token+'&type=jsapi';
	return new Promise(function(resolve,reject){
		request(url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			var now = (new Date().getTime())
			var expires_in = now + (data.expires_in -20)*1000;

			data.expires_in = expires_in
			resolve(data)
		  }
		})

	})
}

Wechat.prototype.uploadMeterial = function(type,material,permanent){
	var that = this;
	var form = {};
	var uploadUrl = api.temporary.upload;
	if (permanent) {
		uploadUrl = api.permanent.upload;
		_.extend(form ,permanent);
	}
	if (type == 'pic') {
		uploadUrl = api.permanent.uploadNewsPic
	}
	if (type == 'news') {
		uploadUrl = api.permanent.uploadNews
	}
	else{
		form.media = fs.createReadStream(material);
	}
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = uploadUrl + 'access_token=' + data.access_token ;
			if (!permanent) {
				url += '&type='+type;
			}else{
				form.access_token = data.access_token;
			}

			var opts = {
				method:'POST',
				json:true,
				url:url
			}
			if (type == 'news') {
				opts.body = form
			}else{
				opts.formData = form;
			}
			request(opts, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－uploadMeterial－－－－:'+JSON.stringify(body));
			    }
			});
		})
	})
}

Wechat.prototype.fetchMeterial = function(mediaId,type,permanent){
	var that = this;
	var form = {};
	var fetchUrl = api.temporary.fetch;
	if (permanent) {
		fetchUrl = api.permanent.fetch;
	}
 
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = fetchUrl + 'access_token=' + data.access_token +'&media_id='+mediaId;
			var form = {}
			var opts = {
				media_id : mediaId,
				access_token:data.access_token,
			}
			if (permanent) {
				form.media_id = mediaId;
				form.access_token = data.access_token;
				opts.body = form;
			}else{
				if (type == 'video') {
					url.replace('https://','http://');
				}
				url += '&media_id='+mediaId +'&access_token='+data.access_token;
			}
			if (type == 'news' || type == 'video') {
				request({url: url,method: "POST",json: true,body:form
				}, function(error, response, body) {
				    if (!error && response.statusCode == 200) {
				    	resolve(body);
				    	console.log(' －－－－－－－－ fetchMeterial－－－－－－－－－－: '+body.mediaId);
				    }
				});				
			}else{
				resolve(url);
			}

		})
	})
}

Wechat.prototype.deleteMeterial = function(mediaId){
	var that = this;
	var form = {
		media_id:mediaId
	};
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = api.permanent.del + 'access_token=' + data.access_token +'&media_id='+mediaId;

			request({url: url,method: "POST",json: true,body:form
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ delete meterial－－－－－－－－－－: '+body.mediaId);
			    }else{
			    	throw new Error (' deleteMeterial Error ')
			    }
			});

		}).catch(function(err){
			reject(err)
		})
	})
}

Wechat.prototype.countMeterial = function(){
	var that = this;

	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = api.permanent.count + 'access_token=' + data.access_token;

			request({url: url,method: "GET",json: true,
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ countMeterial－－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' countMeterial Error ')
			    }
			});

		}).catch(function(err){
			reject(err)
		})
	})
}

Wechat.prototype.batchMeterial = function(options){
	var that = this;
	options.type = options.type || 'image';
	options.offset = options.offset || 0;
	options.count = options.count || 1;
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = api.permanent.count + 'access_token=' + data.access_token;

			request({url: url,method: "GET",json: true,body:options
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ delete meterial－－－－－－－－－－: '+body.mediaId);
			    }else{
			    	throw new Error (' batchMeterial Error ')
			    }
			});

		}).catch(function(err){
			reject(err)
		})
	})
}


Wechat.prototype.updateMeterial = function(mediaId,news){
	var that = this;
	var form = {
		media_id:mediaId
	};
	_.extend(form,news);
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = api.permanent.update + 'access_token=' + data.access_token +'&media_id='+mediaId;

			request({url: url,method: "POST",json: true,body:form
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ delete meterial－－－－－－－－－－: '+body.mediaId);
			    }else{
			    	throw new Error (' updateMeterial Error ')
			    }
			});

		}).catch(function(err){
			reject(err)
		})
	})
}
// 创建分组
Wechat.prototype.createGroup = function(name){
	var that = this;

	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = api.group.create + 'access_token=' + data.access_token;
			var options = {
				group:{
					name : name
				}
			}
			request({url: url,method: "POST",json: true,body:options
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ createGroup－－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' createGroup Error ')
			    }
			});

		}).catch(function(err){
			reject(err)
		})
	})
}
//获得分组名单
Wechat.prototype.fetchGroups = function(name){
	var that = this;

	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = api.group.fetch + 'access_token=' + data.access_token;
			request({url: url,json: true}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ fetchGroup －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' fetchGroup Error')
			    }
			});

		}).catch(function(err){
			reject(err)
		})
	})
}
//校验分组
Wechat.prototype.checkGroup = function(openId){
	var that = this;

	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = api.group.check + 'access_token=' + data.access_token;
			var opts = {
				openid : openId
			}
			request({method:'POST',body:opts, url: url,json: true
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ checkGroup －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' checkGroup Error ')
			    }
			});

		}).catch(function(err){
			reject(err)
		})
	})
}
//更新分组
Wechat.prototype.updateGroup = function(id,name){
	var that = this;

	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = api.group.update + 'access_token=' + data.access_token;
			var form = {
				group : {
					id : id ,
					name : name
				}
			}
			request({method:'POST',body:form, url: url,json: true
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ updateGroup －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' update Error ')
			    }
			});

		}).catch(function(err){
			reject(err)
		})
	})
}

//移动分组
Wechat.prototype.moveGroup = function(openId , to ){
	var that = this;

	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = '';
			var form = {
				to_groupid 	: to,
				openid : openId
			};
		 	url = api.group.move + 'access_token=' + data.access_token;
			request({method:'POST',body:form, url: url,json: true
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ moveGroup －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' moveGroup Error ')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}
//批量移动分组
Wechat.prototype.batchMoveGroup = function(openIds , to ){
	var that = this;

	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = '';
			var form = {
				to_groupid 	: to
			};
			if (_.isArray(openIds)) {
				url = api.group.batchupdate + 'access_token=' + data.access_token;
				form.openid = openIds;
			}else{
				form.openid  = openIds;
			 	url = api.group.move + 'access_token=' + data.access_token;
			}
			var opts = {
				openid_list: openIds,
				to_groupid:to,
			}
			request({method:'POST',body:opts, url: url,json: true
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ batchMoveGroup －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' batchMoveGroup Error ')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}
//删除分组
Wechat.prototype.deleteGroup = function(id ){
	var that = this;

	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = api.group.del + 'access_token=' + data.access_token;
			var form = {
				group:{
					id : id
				}
			};

			request({method:'POST',body:form, url: url,json: true,body:form
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ deleteGroup －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' deleteGroup Error')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}

//给用户设置备注
Wechat.prototype.remarkUser = function(openId,remark ){
	var that = this;

	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var url = api.user.remark + 'access_token=' + data.access_token;
			var form = {
				openid : openId,
				remark : remark
			};

			request({method:'POST',body:form, url: url,json: true,body:form
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ deleteGroup －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' deleteGroup Error')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}

//（批量）获得用户信息 
Wechat.prototype.fetchUsers = function(openIds ,lang){
	var that = this;
	var lang = lang || 'zh_CN'
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			var opts = {
				json : true
			}
			if (_.isArray(openIds )) {
				opts.url = api.user.batchFetch + 'access_token=' + data.access_token;
				opts.body = {
					user_list : openIds
				};
				opts.method  =  'POST'
			}else{
				opts.url = api.user.fetch + 'access_token=' + data.access_token + '&openid='+openIds +'&lang='+lang;
			}
			console.log('fetchUsers : '+ JSON.stringify(opts));
			request(opts, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ fetchUsers －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' fetchUsers Error')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}
// 获取关注列表
Wechat.prototype.listUsers = function(openId ){
 	var that = this;
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){

			var url = api.user.list + 'access_token=' + data.access_token ;
			if (openId) {
				url += '&openid=' + openId
			}
			var opts = {
				url 	: url,
				json 	: true,
				method 	: 'GET'
			}
			request(opts, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ fetchUsers －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' fetchUsers Error')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}

// 消息群发
Wechat.prototype.sendByGroup = function(type,message,groupId ){
 	var that = this;
 	var msg = {
 		filter : {},
 		msgtype : type
 	}
 	msg[type] = message
 	if (!groupId) {
 		msg.filter.is_to_all = true
 	}else{
 		msg.filter = {
 			is_to_all : false,
 			group_id : groupId
 		}
 	}
 	console.log(' ------------- msg :'+JSON.stringify(msg));
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){

			var url = api.mass.group + 'access_token=' + data.access_token ;

			var opts = {
				url 	: url,
				json 	: true,
				method 	: 'POST',
				body 	: msg,
			}
			request(opts, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ sendByGroup －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' sendByGroup Error')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}
// 创建菜单
Wechat.prototype.createMenu = function(menu ){
 	var that = this;
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){

			var url = api.menu.create + 'access_token=' + data.access_token ;
			var opts = {
				url 	: url,
				json 	: true,
				method 	: 'POST',
				body 	: menu
			}
			request(opts, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ createMenu －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' createMenu Error')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}
// 获取菜单列表
Wechat.prototype.getMenu = function( ){
 	var that = this;
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){

			var url = api.menu.get + 'access_token=' + data.access_token ;
			var opts = {
				url 	: url,
				json 	: true
			}
			request(opts, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ getMenu －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' getMenu Error')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}
// 删除菜单列表
Wechat.prototype.deleteMenu = function( ){
 	var that = this;
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){

			var url = api.menu.del + 'access_token=' + data.access_token ;
			var opts = {
				url 	: url,
				json 	: true
			}
			request(opts, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ deleteMenu －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' deleteMenu Error')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}
// 获取当前菜单
Wechat.prototype.getCurrentMenu = function( ){
 	var that = this;
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){

			var url = api.menu.current + 'access_token=' + data.access_token ;
			var opts = {
				url 	: url,
				json 	: true
			}
			request(opts, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ getCurrentMenu －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' getCurrentMenu Error')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}
// 语义化接口
Wechat.prototype.semantic = function(semanticData ){
 	var that = this;
	return new Promise(function(resolve,reject){
		that
		.fetchAccessToken()
		.then(function(data){
			semanticData.appId = data.appId;
			var url = api.semanticUrl + 'access_token=' + data.access_token ;
			var opts = {
				url 	: url,
				json 	: true,
				method 	: 'POST',
				body 	: semanticData
			}
			request(opts, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	resolve(body);
			    	console.log(' －－－－－－－－ semantic －－－－－－－－－－: '+JSON.stringify(body));
			    }else{
			    	throw new Error (' semantic Error')
			    }
			});

		})
		.catch(function(err){
			reject(err)
		})
	})
}
Wechat.prototype.reply = function(){
	var content = this.body
	var message = this.weixin
	var xml = util.tpl(content,message);

	var that ={} ;
	this.staus = 200
	this.type = 'application/xml'
	this.body = xml;
	return ;
}

// 构造函数
function Wechat(opts){
	var that = this;
	this.appId = opts.appId;
	this.appSecret = opts.appSecret;
	this.getAccessToken = opts.getAccessToken;
	this.saveAccessToken = opts.saveAccessToken;
	
	this.getTicket = opts.getTicket;
	this.saveTicket = opts.saveTicket;
	this.fetchAccessToken();
}

module.exports =  Wechat;