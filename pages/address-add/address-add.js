var commonCityData = require('../../utils/city.js');
//获取应用实例
var app = getApp()
Page({
  data: {
    id:'',
    user_tokenHead:'',
    user_token:'',
    linkMan:'',
    address:'',
    mobile:'',
    code:'',
    provinces: [],
    citys: [],
    districts: [],
    selProvince: '请选择',
    selCity: '请选择',
    selDistrict: '请选择',
    selProvinceIndex: 0,
    selCityIndex: 0,
    selDistrictIndex: 0
  },

  // 选择地区
  bindPickerProvinceChange: function (event) {
    var selIterm = commonCityData.cityData[event.detail.value];
    this.setData({
      selProvince: selIterm.name,  //第一级地区
      selProvinceIndex: event.detail.value,
      selCity: '请选择',
      selCityIndex: 0,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(2, selIterm)
  },

  // 选择城市
  bindPickerCityChange: function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity: selIterm.name, //第二级地区
      selCityIndex: event.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(3, selIterm)
  },

  // 选择地区下一级
  bindPickerChange: function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      this.setData({
        selDistrict: selIterm.name, //第三级地区
        selDistrictIndex: event.detail.value
      })
    }
  },

  // 取消
  bindCancel: function () {
    wx.navigateBack({})
  },

  // 保存
  bindSave: function (e) {
    var that = this;
    var linkMan = e.detail.value.linkMan;
    var address = e.detail.value.address;
    var mobile = e.detail.value.mobile;
    var code = e.detail.value.code;
    //console.log(e);
    if (linkMan == "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel: false
      })
      return
    }
    if (mobile == "") {
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel: false
      })
      return
    }
    if (this.data.selProvince == "请选择") {
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel: false
      })
      return
    }
    if (this.data.selCity == "请选择") {
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel: false
      })
      return
    }
    var cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id;
    var districtId;
    if (this.data.selDistrict == "请选择" || !this.data.selDistrict) {
      districtId = '';
    } 
    if (address == "") {
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel: false
      })
      return
    }
    if (code == "") {
      wx.showModal({
        title: '提示',
        content: '请填写邮编',
        showCancel: false
      })
      return
    }
    that.setData({
      linkMan : e.detail.value.linkMan,
      address : e.detail.value.address,
      mobile : e.detail.value.mobile,
      code : e.detail.value.code,
      user_tokenHead:wx.getStorageSync('user_tokenHead'),
      user_token:wx.getStorageSync('user_token')
    });
    var apiAddoRuPDATE = "add";
    var apiAddid = that.data.id;
    if (apiAddid) {
      apiAddoRuPDATE = "update";
    } else {
      apiAddid = 0;
    }

    // 整合数据
    var useraddressData = {
      "city": that.data.selProvince,//城市
      "defaultStatus": 0,//是否为默认
      "detailAddress": e.detail.value.address,//详细地址(街道)
      "id": 0,
      "memberId": 0,//会员ID
      "name": e.detail.value.linkMan,//收货人名称
      "phoneNumber": e.detail.value.mobile,//收货人手机号
      "postCode": e.detail.value.code,//邮政编码
      "province": that.data.selCity,//省份/直辖市
      "region": that.data.selDistrict//区
    };
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/member/address/add',
      method: 'POST',
      header: {
        'content-type': 'application/json',
         'Authorization':that.data.user_tokenHead+' '+ that.data.user_token,
      },
      data: useraddressData,
      success: function (res) {
        if (res.data.code = 200) {
          console.log(res);
          wx.reLaunch({
            url: '/pages/address/address',
        })
        }else{
          console.log(res);
        }
      }
    })
  },

//获取新用户名
userNameInput:function(e)
{
  this.setData({
    linkMan: e.detail.value
  })
},

//获取新用户手机号
userPhoneInput:function(e)
{
  this.setData({
    mobile: e.detail.value
  })
},

//获取新用户详细地址
userPhoneInput:function(e)
{
  this.setData({
    mobile: e.detail.value
  })
},

  // 城市数据
  initCityData: function (level, obj) {
    if (level == 1) {
      var pinkArray = [];
      for (var i = 0; i < commonCityData.cityData.length; i++) {
        pinkArray.push(commonCityData.cityData[i].name);
      }
      this.setData({
        provinces: pinkArray
      });
    } else if (level == 2) {
      var pinkArray = [];
      var dataArray = obj.cityList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        citys: pinkArray
      });
    } else if (level == 3) {
      var pinkArray = [];
      var dataArray = obj.districtList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        districts: pinkArray
      });
    }

  },

  onLoad: function (e) {
    var that = this;
    //if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    this.initCityData(1);

    // 地址列表页查询指定ID地址数据
    var id = e.id;
    that.setData({
      id:e.id
    })
    if (id) {
      wx.showLoading();
      var user_tokenHead = wx.getStorageSync('user_tokenHead')
      var user_token = wx.getStorageSync('user_token')
      wx.request({
        url: app.globalData.baseUrl + '/mallPort/member/address/' + id,
        method: 'GET',
        header: {
          'content-type': 'application/json',
           'Authorization':user_tokenHead+' '+ user_token,
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 200) {
            that.setData({
              id: id,
              linkMan:res.data.data.name,
              mobile:res.data.data.phoneNumber,
              code:res.data.data.postCode,
              addressData: res.data.data,
              selProvince: res.data.data.city,
              selCity: res.data.data.province,
              selDistrict: res.data.data.region
            });
            that.setDBSaveAddressId(res.data.data);
            return;
          } else {
            wx.showModal({
              title: '提示',
              content: '无法获取快递地址数据',
              showCancel: false
            })
          }
        }
      })
    }
  },

  setDBSaveAddressId: function (data) {
    var retSelIdx = 0;
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (data.provinceId == commonCityData.cityData[i].id) {
        this.data.selProvinceIndex = i;
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (data.cityId == commonCityData.cityData[i].cityList[j].id) {
            this.data.selCityIndex = j;
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (data.districtId == commonCityData.cityData[i].cityList[j].districtList[k].id) {
                this.data.selDistrictIndex = k;
              }
            }
          }
        }
      }
    }
  },
  selectCity: function () {
  },

  // 删除收获地址
  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          var user_tokenHead = wx.getStorageSync('user_tokenHead')
          var user_token = wx.getStorageSync('user_token')
          wx.request({
            url: app.globalData.baseUrl + '/mallPort/member/address/delete/' + id,
            method: 'POST',
            header: {
              'content-type': 'application/json',
              'Authorization':user_tokenHead+' '+ user_token,
            },
            success: (res) => {
              //console.log(res);
              wx.navigateBack({})
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 获取用户微信通讯地址
  readFromWx: function () {
    let that = this;
    //app.getPermission(that);
    wx.chooseAddress({
      success: function (res) {
        let provinceName = res.provinceName;
        let cityName = res.cityName;
        let diatrictName = res.countyName;
        let retSelIdx = 0;

        for (var i = 0; i < commonCityData.cityData.length; i++) {
          if (provinceName == commonCityData.cityData[i].name) {
            let eventJ = { detail: { value: i } };
            that.bindPickerProvinceChange(eventJ);
            that.data.selProvinceIndex = i;
            for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
              if (cityName == commonCityData.cityData[i].cityList[j].name) {
                //that.data.selCityIndex = j;
                eventJ = { detail: { value: j } };
                that.bindPickerCityChange(eventJ);
                for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                  if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                    //that.data.selDistrictIndex = k;
                    eventJ = { detail: { value: k } };
                    that.bindPickerChange(eventJ);
                  }
                }
              }
            }

          }
        }
        that.setData({
          wxaddress: res,
        });
      }
    })
  }
})