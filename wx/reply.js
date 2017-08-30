'use strict'

var config = require('../config');
var Wechat = require('../wechat/wechat');
var path = require('path');
var menu = require('./menu');
var fs = require('fs');
var wechatApi = new Wechat(config.wechat);




exports.reply = function *(next){
	var message = this.weixin;


	if (message.MsgType == 'event') {
		if (message.Event == 'subscribe') {
			if (message.EventKey) {
				console.log('扫二维码进来：'+message.EventKey +''+message.ticket);
			}
			this.body = '哈哈，你订阅了这个号！欢迎使用谭军一的测试帐号';
		}else if(message.Event == 'unsubscribe'){
			console.log('无情取消关注');
		}else if(message.Event == 'LOCATION'){
			this.body = '您上报的位置是：'+message.Latitude + '/'+message.Longitude + '-'+message.Precision
		}else if(message.Event == 'CLICK'){
			this.body = '您点击了菜单：'+message.EventKey
		}else if(message.Event == 'SCAN'){
			console.log('关注后扫描二维码'+message.EventKey+'/'+message.Ticket)
			this.body = '看到你扫了一下哦';
  		}else if(message.Event == 'VIEW'){
  			this.body = '您点击了菜单的连接：'+message.EventKey;
  		}else if(message.Event == 'scancode_push'){
  			console.log(message.ScanCodeInfo.ScanType);
  			console.log(message.ScanCodeInfo.ScanResult);
  
  			this.body = '您点击了菜单的连接：'+message.EventKey;
  		}else if(message.Event == 'scancode_waitmsg'){
  			console.log(message.ScanCodeInfo.ScanType);
  			console.log(message.ScanCodeInfo.ScanResult);
  			this.body = '您点击了菜单的连接：'+message.EventKey;
  		}else if(message.Event == 'pic_sysphoto'){
  			console.log(message.SendPicInfo.PicList);
  			console.log(message.SendPicInfo.Count);
  			this.body = '您点击了菜单的连接：'+message.EventKey;

  		}else if(message.Event == 'pic_photo_or_album'){
  			console.log(message.ScanCodeInfo);
  			console.log(message.ScanResult);
  			this.body = '您点击了菜单的连接：'+message.EventKey;

  		}else if(message.Event == 'pic_weixin'){
  			console.log(message.ScanCodeInfo);
  			console.log(message.ScanResult);
  			this.body = '您点击了菜单的连接：'+message.EventKey;
  		}else if(message.Event == 'location_select'){
  			console.log(message.ScanLocationInfo.Location_X);
  			console.log(message.ScanLocationInfo.Location_Y);
  			console.log(message.ScanLocationInfo.Scale);
  			console.log(message.ScanLocationInfo.Label);
  			console.log(message.ScanLocationInfo.Poiname);
  			console.log(message.ScanResult);
  			this.body = '您点击了菜单的连接：'+message.EventKey;
  		}

	}else if(message.MsgType == 'text'){
		var content =  message.Content;
		var reply = "你说的‘"+message.Content+"’太复杂，我不懂"
		if (content == '前端组') {
			reply = '哇，你们前端组真的是太漂亮了'
		}else if(content == '谭排骨'){
			reply  = '谭排骨实在是太瘦了'
		}else if(content == '煮饭'){
			reply = '煮饭是世界上最困难的事情'
		}else if (content == '新闻') {
			reply =  [{
				title : '美军B-52轰炸机',
				description:'资料图：美军现役尚有76架B-52H轰炸机',
				picUrl:'http://photocdn.sohu.com/20170106/Img477916712.jpg',
				url:'http://mil.sohu.com/20170106/n477916711.shtml'
			}]
		}else if(content == '5'){
			var data = yield wechatApi.uploadMeterial('image',path.join(__dirname,'../2.png') )
			reply = {
				type:'image',
				mediaId:data.media_id
			}
		}else if(content == '6'){
			var data = yield wechatApi.uploadMeterial('video',path.join(__dirname,'../WeChatSight214.mp4') )
			reply = {
				type:'video',
				title:'卖萌妹子，不可以随便看',
				description:'傻妹子卖萌',
				mediaId:data.media_id
			}
		}else if(content == '7'){
			var data = yield wechatApi.uploadMeterial('image',path.join(__dirname,'../2.png') )
			reply = {
				type:'music',
				title:'雨黄昏',
				MUSIC_Url:'https://dn-wapptest.qbox.me/%E6%9D%8E%E6%98%8E%E9%9C%96%20-%20%E9%9B%A8%E9%BB%84%E6%98%8F.mp3',
				description:'好听的歌',
				mediaId:data.media_id
			}
		}else if(content == '8'){
			var data = yield wechatApi.uploadMeterial('image',path.join(__dirname,'../2.png'),{type:'image'})
			reply = {
				type:'image',
				mediaId:data.media_id
			}
		}else if(content == '9'){
			var data = yield wechatApi.uploadMeterial('video',path.join(__dirname,'../WeChatSight214.mp4'),{description:'{"title":"张彩霞的视频","introduction":"傻妹子就晓得卖萌"}'})
			reply = {
				type:'video',
				title:'卖萌妹子的永久素材',
				description:'傻妹子卖萌，这是一个永久素材',
				mediaId:data.media_id
			}
		}else if(content == '10'){
			var picData = yield wechatApi.uploadMeterial('image',path.join(__dirname,'../2.png'),{})
			var media = {
				articles:[{
					title:'totuto',
					thumb_media_id:picData.media_id,
					author:'tanjunyi',
					digest:'没有摘要',
					show_cover_pic:1,
					content:'没有内容',
					content_source_url:"www.baidu.com"
				}]
			}
			data = yield wechatApi.uploadMeterial('news',media,{});
			data = yield wechatApi.fetchMeterial(data.media_id,'news',{});
			console.log(data);
			var items = data.news_item
			var news = [];
			items.forEach(function(item){
				news.push({
					title:item.title,
					description:item.digest,
					picUrl:picData.url,
					url:item.url
				})
			})
			reply = news;
		}else if(content == '11'){
			var counts = yield wechatApi.countMeterial();
			console.log(JSON.stringify(counts));
			var result = yield [
				wechatApi.fetchMeterial({
					type:'image',
					offset:0,
					count:10
				})
			]
			console.log("－－－－－－－－－－ 统计结果："+JSON.stringify(result));
			reply = '统计结果：'+JSON.stringify(result);
		}else if (content ==12) {
			// var group = yield wechatApi.createGroup('wechat2');
			// console.log('新分组');
			// console.log(group);

			var groups = wechatApi.fetchGroups()
			console.log('加了 wechat后的分组列表');
			console.log(groups);

			var group2 = yield wechatApi.checkGroup(message.FromUserName);
			console.log('查看我在哪个分组');
			console.log(group2);

			var group3 = yield wechatApi.moveGroup(message.FromUserName,101);
			console.log('移动到101分组');
			console.log(group3);

			var groups2 = wechatApi.fetchGroups()
			console.log('移动后的分组列表');
			console.log(groups2);
			//批量移动
			var group4 = yield wechatApi.batchMoveGroup([message.FromUserName],102);
			console.log('批量移动到102分组');
			console.log(group4);

			var groups3 = wechatApi.fetchGroups()
			console.log('移动后的分组列表');
			console.log(groups3);

			//分组更名
			var result3 = wechatApi.updateGroup(101,'更名后的分组');
			console.log('更名后的分组');
			console.log(result3);

			var groups4 = wechatApi.fetchGroups()
			console.log('改名后后的分组列表');
			console.log(groups4);

			reply = 'Group Done !'
		}else if(content == "我的分组"){
			var group2 = yield wechatApi.checkGroup(message.FromUserName);
			console.log('查看我在哪个分组');
			console.log(group2);
			reply = JSON.stringify(group2);
		}
		else if (content ==13) {
			var groups = wechatApi.fetchGroups()
			console.log('删除前的分组列表');
			console.log(groups);
			wechatApi.deleteGroup(103);
			wechatApi.deleteGroup(104);
			wechatApi.deleteGroup(105);
			wechatApi.deleteGroup(106);
			wechatApi.deleteGroup(107);
			var groups = wechatApi.fetchGroups()
			console.log('删除后后的分组列表');
			console.log(groups);

			reply = 'delete Done !'
		}else if (content =='我是谁') {  //获取用户信息
			var user = yield wechatApi.fetchUsers(message.FromUserName);
			console.log(user);

			var openIds = [
				{
					openid : message.FromUserName,
					lang:'en'
				}
			]

			var users = yield wechatApi.fetchUsers(openIds);
			console.log(users);
			reply =  user.subscribe.nickname;
		}else if (content == 15) {
			var userlist = yield wechatApi.listUsers();
			console.log('获得用户列表');
			console.log(userlist);
			reply = userlist.total 
		}else if (content == 16) {
			// var data = yield wechatApi.uploadMeterial('image',__dirname+'/2.png')
			// var mpnews = {
			// 	media_id : 'RY94BpfaMxpBdyzc75G1qbN6wDE0sIwxC4W5_tmQ54ADFnLg'
			// }
			var text = {
				content : "Hello Danlu"
			}
			var msgData = yield wechatApi.sendByGroup('text',text,102)
			console.log(" －－－－－－－－ msgData："+msgData);
			reply = '群发消息'
		}else if (content == 'menu') {
			//删除菜单，并且初始化
			console.log('－－－－－－－－－－－－－－－－－－－－删除菜单列表－－－－－－－－－－－－－－－－－');
			wechatApi.deleteMenu().then(function(){
				return wechatApi.createMenu(menu)
			}).then(function(msg){
				console.log('－－－－－－－－－－－－－－－－－－－－ 创建菜单结束：'+JSON.stringify(msg));
			})
			reply = '重新创建菜单成功'
		}
		/**
		 * @param  {[type]}
		 * @return {[type]}
		 * @description 语义化接口 订阅号无权限调用该接口
		 */
		else if (content == 20) {
			var semanticData = {
				query:'寻龙诀',
				city : '成都' ,
				category : 'movie',
				uid : message.FromUserName
			}

			var result = yield wechatApi.semantic(semanticData);
			reply =  JSON.stringify(result);
		}


		this.body = reply
	}
	yield next;
}