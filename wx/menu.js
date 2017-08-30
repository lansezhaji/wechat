'use strict'

module.exports = {
	'button' : [{
		'name' : '跳转到网页',
		'type' : 'view' ,
		'url'  : 'http://w2im3n.natappfree.cc/movie'
	},{
		'name' : '点出菜单',
		'sub_button' : [{
			'type' : 'view',
			'name' : '语音搜索电影',
			'url'  : 'http://minjiehulian.s1.natapp.cc/movie'
		},{
			'type' : 'scancode_push',
			'name' : '扫码推送事件',
			'key'  : 'qr_scan'
		},{
			'name' : '扫码推送',
			'type' : 'scancode_waitmsg' ,
			'key'  : 'qr_scan_wait'
		},{
			'name' : '弹出系统拍照',
			'type' : 'pic_sysphoto' ,
			'key'  : 'pic_photo'
		},{
			'name' : '弹出拍照或者相册',
			'type' : 'pic_photo_or_album' ,
			'key'  : 'pic_photo_album'
		}]
	},{
		'name' : '点出菜单2',
		'sub_button':[{
			'name' : '微信相册发图',
			'type' : 'pic_weixin',
			'key'  : 'pic_weixin'
		},{
			'name' : '地理位置选择',
			'type' : 'location_select',
			'key'  : 'location_select'
		},
		// {
		// 	'name' : '下发图片消息',
		// 	'type' : 'media_id' ,
		// 	'media_id'  : 'xxxxx'
		// },{
		// 	'name' : '跳转图文消息的URL',
		// 	'type' : 'view_limited' ,
		// 	'media_id'  : 'xxxxxx'
		// }
		]
	},]
}