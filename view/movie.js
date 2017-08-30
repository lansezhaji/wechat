'use strict'

var ejs = require('ejs');
var heredoc = require('heredoc');


var tpl = heredoc(function(){/*
	<!DOCTYPE html>
	<html>
		<head>
			<title>猜电影</title>
			<link rel="stylesheet" href="http://om7xnpavr.bkt.clouddn.com/weui.css">
			<meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1">
		</head>
		<body>
			<h1 id="recorder">点击标题，开始录音</h1>
			<a href="javascript:;" class="weui-btn weui-btn_primary">weui按钮样式</a>
			<a href="javascript:;" class="weui-btn weui-btn_disabled weui-btn_primary">weui按钮disabled样式</a>

			<p id="title"></p>
			<div id="director"></div>
			<div id="poster"></div>
			<script src="./public/javascript/zepto-docs.min.js" ></script>
			<script src="./public/javascript/jweixin-1.0.0.js"></script>

		</body>
		<script>
			wx.config({
				debug   	:false,
				appId		:'wx7615edc40c9af2db',
				timestamp 	:'<%= timestamp %>',
				nonceStr 	:'<%= noncestr %>',
				signature 	:'<%= signature %>',
				jsApiList 	:[
					'startRecord',
					'stopRecord',
					'onVoiceRecord',
					'translateVoice',
					'onMenuShareTimeline',
					'onMenuShareAppMessage',
					'onMenuShareQQ',
					'onMenuShareWeibo',
					'onMenuShareQZone',
				]
			})

			wx.ready(function(){
				wx.checkJsApi({
					jsApiList:['onVoiceRecord'],
					success:function(res){
						console.log(res);
					}
				})
				var isRecording = false;
				var shareContent = {
					title : '敏捷互联，根据语音找电影',
					desc  : '微信公众号后台开发之分享功能 ',
					link  : 'http://minjiehulian.tunnel.2bdata.com/movie',
					imgUrl : 'http://img.1985t.com/uploads/attaches/2012/04/5251-Du1x67.jpg',
					type : 'link' ,
					dataUrl : '',
					success : function(){
						window.alert('分享成功');
					},cancel : function(){
						window.alert('取消分享');
					}
				};
				wx.onMenuShareAppMessage(shareContent);
				var slides 
				$('#poster').on('tap',function(){
					wx.previewImage(slides);
				})	
				$('h1').on('tap',function(){
					if(!isRecording){
						isRecording = true;
						$('#recorder').text('正在录音');
						wx.startRecord({
							cancel:function(){
								window.alert('请允许应用访问您的麦克风');
							}
						})	
						return 
					}
					isRecording = false;
					$('#recorder').text('查找电影');

					
					wx.stopRecord({
						success: function(res){
							var localId = res.localId
							wx.translateVoice({
								localId 			:localId,
								isShowProgressTips  : true,
								success : function(res){
									var result =  res.translateResult;
									window.alert(res.translateResult)
									$.ajax({
										type : 'get',
										url  : 'https://api.douban.com/v2/movie/search?q='+result,
										dataType : 'jsonp',
										jsonp : 'callback' ,
										success : function(data){
											var subject = data.subjects[0];
											$('#director').html(subject.directors[0].name)
											$('#poster').html('<img src=" '+subject.images.large+' ">')

											//分享内容
											shareContent = {
												title : subject.title,
												desc  : '我找到了'+ subject.title,
												link  : 'http://www.baidu.com',
												imgUrl : subject.images.large,
												type : 'link' ,
												dataUrl : '',
												success : function(){
													window.alert('分享成功');
												},cancel : function(){
													window.alert('取消分享');
												}
											}
											wx.onMenuShareAppMessage(shareContent);
											slides = {
												current : subject.images.large,
												urls : [subject.images.large]
											}
											data.subjects.forEach(function(item){
												slides.urls.push(item.images.large);
											})
										}
									})
								}
							})
						}
					})
				})
			})
			

		</script>
	</html>

*/})


var compiled = ejs.compile(tpl)

exports = module.exports = {
	compiled : compiled
}