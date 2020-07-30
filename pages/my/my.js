const app = getApp()
Page({
	data: {
    balance:0,
    freeze:0,
    score:0,
    score_sign_continuous:0,
    tabClass: ["", "", "", "", ""],
    userInfo: {},
    user_avatarUrl:'',
    user_nickName:'',
    hasUserInfo: false,
    showModal: false,
    user_token:'',
    user_tokenHead:'',
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    var that = this;
  },
  onShow() {
    var that = this;
     // 检查用户是否授权过
     wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userInfo"]) {
          console.log("已授权");
          that.setData({
            showModal:false,
            hasUserInfo:true,
          })
        }else{
          console.log("未授权");
          that.getUserInfo();
        }
      }
    })

  },

  //获取用户积分余额
  getUserAmount: function () {
    var that = this;
    // wx.request({
    //   url: app.globalData.urls + '/user/amount',
    //   data: {
    //     token: app.globalData.token
    //   },
    //   success: function (res) {
    //     if (res.data.code == 200) {
    //       that.setData({
    //         balance: res.data.data.balance,
    //         freeze: res.data.data.freeze,
    //         score: res.data.data.score
    //       });
    //     }
    //   }
    // })
  },

  //获取用户签到次数
  checkScoreSign: function () {
    var that = this;
    // wx.request({
    //   url: app.globalData.urls + '/score/today-signed',
    //   data: {
    //     token: app.globalData.token
    //   },
    //   success: function (res) {
    //     if (res.data.code == 200) {
    //       that.setData({
    //         score_sign_continuous: res.data.data.continuous
    //       });
    //     }
    //   }
    // })
  },

  // 获取用户基本信息
	getUserInfo: function (cb) {
      var that = this
      wx.login({
        success: function (res) {
          var code = res.code
          //console.log('获取用户登录凭证：' + code); 
          wx.getUserInfo({
            success: function (res) {
              console.log(res);
              //将用户基本信息存入本地缓存
              wx.setStorageSync('user_avatarUrl', res.userInfo.avatarUrl);
              wx.setStorageSync('user_nickName', res.userInfo.nickName);
              app.data.isLogin = true;
              app.data.user_avatarUrl = res.userInfo.avatarUrl;
              app.data.user_nickName = res.userInfo.nickName;
              that.setData({
                userInfo:res.userInfo,
                user_avatarUrl:app.data.user_avatarUrl,
                user_nickName:app.data.user_nickName,
              })
              let uencryptedData = res.encryptedData;
              let uiv = res.iv;
              wx.request({
                url: app.globalData.baseUrl + '/mallPort/sso/microLogin',
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded',
                },
                data: {
                  code: code,
                  userEntryData:uencryptedData,
                  userIv:uiv
                },
                success: function (res2) {
                  if (res2.data.code == 200) {
                    console.log(res2);
                    wx.setStorageSync('user_tokenHead', res2.data.data.tokenHead);
                    wx.setStorageSync('user_token', res2.data.data.token);
                    app.globalData.isLogin = true;
                    that.setData({
                      user_token:res2.data.data.token,
                      user_tokenHead:res2.data.data.tokenHead,
                      userInfo: res.userInfo,
                      hasUserInfo: true,
                      canIUse: false,
                      showModal: true,
                    })
                    that.getUserAllInfor();
                  } else {
                    console.log(res2);
                  }
                }
              })
            }
          })
        }
      })
},

// 获取用户手机号码
getPhoneNumber(e) {
  var that = this;
  wx.login({
    success: function(res) {
      var user_code = res.code
      //console.log('获取用户手机号码凭证：' + user_code); 
  
  
  if (e.detail.errMsg == "getPhoneNumber:ok") {
    // console.log(e);
    // console.log(that.data.user_tokenHead);
    // console.log(that.data.user_token);
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/sso/microUpdatePhone',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization':that.data.user_tokenHead+' '+that.data.user_token,
      },
      data: {
        code: user_code,
        phoneEntryData:e.detail.encryptedData,
        phoneIv:e.detail.iv
      },
      success: function (res2) {
        if (res2.data.code == 200) {
          //console.log(res2);
          //wx.setStorageSync('isLogin', true); 
        } else {
          console.log(res2);
        }
      }
    }),

    that.setData({
      canIUse: false,
      hasUserInfo: true,
      showModal: false,
    });
  }
},
})
},

//获取用户所有信息
getUserAllInfor:function(){
  var that = this;
  wx.request({
    url: app.globalData.baseUrl + '/mallPort/sso/info',
    method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization':that.data.user_tokenHead+' '+that.data.user_token,
      },
    success: function (res) {
      if (res.data.code == 200) {
        console.log(res)
          that.setData({
            score:res.data.data.integration
          })
      } else {
        wx.showModal({
          title: '错误',
          content: res.data.msg,
          showCancel: false
        })
      }
    }
  })
},

scoresign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/score/sign',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 200) {
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },

  relogin:function(){
    var that = this;
    wx.authorize({
      scope: 'scope.userInfo',
      success() {
        app.globalData.token = null;
        app.login();
        wx.showModal({
          title: '提示',
          content: '重新登陆成功',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              that.onShow();
            }
          }
        })
      },
      fail(res){
        //console.log(res);
        wx.openSetting({});
      }
    })
  },
	score: function () {
	  wx.navigateTo({
	    url: "/pages/score/score"
	  })
  },

})