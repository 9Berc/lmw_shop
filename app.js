//app.js
App({
	data:{
		isLogin:false,
		addr:'请选择位置',
		user_avatarUrl:'',
    user_nickName:'',
	},
	
	onLaunch: function() {
		var that = this;
		that.urls();
		wx.getSystemInfo({
			success: function(res) {
				if (res.model.search("iPhone X") != -1) {
					that.globalData.iphone = true;
				}
				if (res.model.search("MI 8") != -1) {
					that.globalData.iphone = true;
				}
			}
		});

		 // 登录
		 wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
	},
	urls: function() {
		var that = this;
		that.globalData.urls = that.siteInfo.url + that.siteInfo.subDomain;
		that.globalData.share = that.siteInfo.shareProfile;
	},
	siteInfo: require("config.js"),

	

	sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString) {
	  var that = this;
	  wx.request({
	    url: that.globalData.urls + "/template-msg/put",
	    method: "POST",
	    header: {
	      "content-type": "application/x-www-form-urlencoded"
	    },
	    data: {
	      token: that.globalData.token,
	      type: 0,
	      module: "order",
	      business_id: orderId,
	      trigger: trigger,
	      template_id: template_id,
	      form_id: form_id,
	      url: page,
	      postJsonString: postJsonString
	    }
	  });
	},
	sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
	  var that = this;
	  wx.request({
	    url: that.globalData.urls + "/template-msg/put",
	    method: "POST",
	    header: {
	      "content-type": "application/x-www-form-urlencoded"
	    },
	    data: {
	      token: that.globalData.token,
	      type: 0,
	      module: "immediately",
	      template_id: template_id,
	      form_id: form_id,
	      url: page,
	      postJsonString: postJsonString
	    }
	  });
	},
	fadeInOut:function(that,param,opacity){
		var animation = wx.createAnimation({
			//持续时间800ms
      duration: 300,
      timingFunction: 'ease',
		})
		animation.opacity(opacity).step()
		var json = '{"' + param + '":""}'
    json = JSON.parse(json);
    json[param] = animation.export()
    that.setData(json)
	},
	isStrInArray:function(item, arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == item) {
				return true;
			}
		}
		return false;
	},

	// 获取购物车数字角标
	getShopCartNum:function(){
		var that = this
		wx.getStorage({
		  key: 'shopCarInfo',
		  success: function (res) {
		    if (res.data) {
		      if (res.data.shopNum > 0) {
		        wx.setTabBarBadge({
		          index: 2,
		          text: '' + res.data.shopNum + ''
		        })
		      } else {
		        wx.removeTabBarBadge({
		          index: 2,
		        })
		      }
		    } else {
		      wx.removeTabBarBadge({
		        index: 2,
		      })
		    }
		  }
		})
	},

	//获取用户地理位置权限
	getPermission:function(obj){
		wx.chooseLocation({
			success: function (res) {   
				console.log(res); 
					obj.setData({
							addr: res.address      //调用成功直接设置地址
					})                
			},
			fail:function(){
					wx.getSetting({
							success: function (res) {
									var statu = res.authSetting;
									if (!statu['scope.userLocation']) {
											wx.showModal({
													title: '是否授权当前位置',
													content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
													success: function (tip) {
															if (tip.confirm) {
																	wx.openSetting({
																			success: function (data) {
																					if (data.authSetting["scope.userLocation"] === true) {
																							wx.showToast({
																									title: '授权成功',
																									icon: 'success',
																									duration: 1000
																							})
																							//授权成功之后，再调用chooseLocation选择地方
																							wx.chooseLocation({
																									success: function(res) {
																											obj.setData({
																													addr: res.address
																											})
																									},
																							})
																					} else {
																							wx.showToast({
																									title: '授权失败',
																									icon: 'success',
																									duration: 1000
																							})
																					}
																			}
																	})
															}
													}
											})
									}
							},
							fail: function (res) {
									wx.showToast({
											title: '调用授权窗口失败',
											icon: 'success',
											duration: 1000
									})
							}
					})
			}
	})        
 },



	globalData: {
		userInfo: null,
		isLogin:false,
		baseUrl:'http://172.16.66.225'
	}
})
