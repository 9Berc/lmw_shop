//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    shopId:'',
    autoplay: true,
    interval: 10000,
    duration: 500,
    goodsDetail: [],
    commodityAttr: [],
	  attrValueList: [],
	  includeGroup: [],
	  firstIndex: -1,
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "选择规格：",
    selectSizePrice: 0,
    selectAttrPic: "",
    shopNum: 0,
    shopImgArr:[],
    hideShopPopup: true,
    minusStatus: 'disabled',
    num: 1,
    // buyNumber: 0,
    // buyNumMin: 1,
    // buyNumMax: 0,
    favicon: 0,
    selectptPrice: 0,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    wxlogin: true,
    sharecode: true,
    sharebox: true,
		title:"商品详情",
    barBg: 'red',
		color: '#ffffff',
    loading: false,
    goodIndex:1,
    showGood:[]
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  onLoad: function (e) {
    var that = this;
    that.setData({
      shopId:e.id
    })
    //扫码进入
    // if (!e.id) { 
    //   var scene = decodeURIComponent(e.scene);
    //   if (scene.length > 0 && scene != undefined) {
    //     var scarr = scene.split(',');
    //     var dilist = [];
    //     for (var i = 0; i < scarr.length; i++) {
    //       dilist.push(scarr[i].split('='))
    //     }
    //     if (dilist.length > 0) {
    //       var dict = {};
    //       for (var j = 0; j < dilist.length; j++) {
    //         dict[dilist[j][0]] = dilist[j][1]
    //       }
    //       var id = dict.i;
    //       var vid = dict.u;
    //       var sid = dict.s;
    //       that.setData({
    //         id: id
    //       })
    //       if (vid) {
    //         wx.setStorage({
    //           key: 'inviter_id_' + id,
    //           data: vid
    //         })
    //       }
    //       if (sid) { that.setData({ share: sid }); }
    //     }
    //   }
    // }
    //链接进入
    // if (!e.scene) { 
    //   if (e.inviter_id) {
    //     wx.setStorage({
    //       key: 'inviter_id_' + e.id,
    //       data: e.inviter_id
    //     })
    //   }
    //   if (e.share) { that.setData({ share: e.share }); }
    //   that.setData({
    //     id: e.id
    //   })
    // }

    
    
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/banner/list',
      data: {
        type: 'toplogo'
      },
      success: function (res) {
        if (res.data.code == 200) {
          that.setData({
            toplogo: res.data.data[0].picUrl,
            topname: wx.getStorageSync('mallName')
          });
        }
      }
    })
    this.getfav();
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })

    // 根据ID查询商品详细信息
    wx.request({
      url: app.globalData.baseUrl + '/mallAdmin/product/updateInfo/'+e.id,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var selectSizeTemp = "";
        if (res.data.code == 200) {
          console.log(res);
          // for (var i = 0; i < res.data.data.properties.length; i++) {
          //   selectSizeTemp = selectSizeTemp + " " + res.data.data.properties[i].name;
          // }
          that.setData({
            shopImgArr:res.data.data.albumPics.split(","),
            selectSizePrice: res.data.data.price,
            selectptPrice: res.data.data.originalPrice,
            selectAttrPic: res.data.data.pic,
          });
        }
        
        that.data.goodsDetail = res.data.data;     
        
        res.data.data.pmsCommentList.forEach(function(item, index){
          if(item.star <2){
            item.star = '差评';
          }else if(item.star > 2 && item.star < 4){
            item.star = '中评';
          }else{
            item.star = '好评';
          }
        }),

        //购物车筛选
		that.data.goodsDetail.skuStockList.forEach(function(item, index){
			item.spData = item.spData.replace(/key/g,"attrKey");
			item.spData = item.spData.replace(/value/g,"attrValue");
			item.spData = JSON.parse(item.spData);
    });
    
    that.data.goodsDetail.productAttrAndValueList.forEach(function(item, index){
			item.inputList = item.inputList.split(",");
    }),
    
        that.setData({
          goodsDetail: res.data.data,
		      commodityAttr: that.data.goodsDetail.skuStockList,
          selectSizePrice: res.data.data.price,
		      
          // buyNumMax: res.data.data.stores,
          // buyNumber: (res.data.data.quantity > 0) ? 1 : 0,
          selectptPrice: res.data.data.pingtuanPrice,
          reputation: res.data.data.pmsCommentList
        });
        that.showGoodFn();
        WxParse.wxParse('article', 'html', res.data.data.detailMobileHtml, that, 5); // res.data.data.albumPics 商品介绍
        //that.goPingtuan();
        //that.goPingList();

        that.setData({
          includeGroup: that.data.commodityAttr
        });
        //console.log(that.data.commodityAttr);
        that.distachAttrValue(that.data.commodityAttr);
        // 只有一个属性组合的时候默认选中
        // console.log(that.data.attrValueList);
        if (that.data.commodityAttr.length == 1) {
          for (var i = 0; i < that.data.commodityAttr[0].spData.length; i++) {
            that.data.attrValueList[i].selectedValue = that.data.commodityAttr[0].spData[i].attrValue;
          }
          that.setData({
            attrValueList: that.data.attrValueList
          });
        }

      }
    });
    //this.reputation(that.data.id);
  },

  // goPingtuan: function () {
  //   var that = this;
  //   wx.request({
  //     url: app.globalData.baseUrl + '/mallAdmin/product/updateInfo/' + that.data.shopId,
  //     success: function (res) {
  //       if (res.data.code == 200) {}
  //     }
  //   })
  // },

  // 切换至商品评价
  // goPingList: function () {
  //   var that = this;
  //   wx.request({
  //     url: app.globalData.urls + '/shop/goods/pingtuan/list',
  //     data: {
  //       goodsId: that.data.goodsDetail.id,
  //     },
  //     success: function (res) {
  //       if (res.data.code == 200) {
  //         that.setData({
  //           pingList: res.data.data
  //         });
  //         for (var i = 0; i < res.data.data.length; i++) {
  //           if (res.data.data[i].uid == app.globalData.uid) {
  //             that.setData({
  //               ptuanCt: res.data.data[i].id
  //             });
  //           }
  //         }
  //       }
  //     }
  //   })
  // },

  /* 获取数据 */
  distachAttrValue: function (commodityAttr) {
	  var that = this;
    /**
      将后台返回的数据组合成类似
      {
        attrKey:'型号',
        attrValueList:['1','2','3']
      }
    */
    // 把数据对象的数据（视图使用），写到局部内
    var attrValueList = that.data.attrValueList;
    // 遍历获取的数据
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].spData.length; j++) {
        var attrIndex = that.getAttrIndex(commodityAttr[i].spData[j].attrKey, attrValueList);
        // console.log('属性索引', attrIndex);
        // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理
          if (!that.isValueExist(commodityAttr[i].spData[j].attrValue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(commodityAttr[i].spData[j].attrValue);
          }
        } else {
          attrValueList.push({
            attrKey: commodityAttr[i].spData[j].attrKey,
            attrValues: [commodityAttr[i].spData[j].attrValue]
          });
        }
      }
    }
    // console.log('result', attrValueList)
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }
    that.setData({
      attrValueList: attrValueList
    });
  },
  getAttrIndex: function (attrName, attrValueList) {
    // 判断数组中的attrKey是否有该属性值
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist: function (value, valueArr) {
    // 判断是否已有属性值
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  /* 选择属性值事件 */
  selectAttrValue: function (e) {
	  var that = this;
    /*
    点选属性值，联动判断其他属性值是否可选
    {
      attrKey:'型号',
      attrValueList:['1','2','3'],
      selectedValue:'1',
      attrValueStatus:[true,true,true]
    }
    console.log(e.currentTarget.dataset);
    */
    var attrValueList = that.data.attrValueList;
    var index = e.currentTarget.dataset.index;//属性索引
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    if (e.currentTarget.dataset.status || index == that.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中
        that.disSelectValue(attrValueList, index, key, value);
      } else {
        // 选中
        that.selectValue(attrValueList, index, key, value);
      }

    }
	
	// if (that.data.includeGroup.length == 1) {
	// 	console.log(that.data.includeGroup);
		that.setData({
		  selectSizePrice: that.data.includeGroup[0].price,
		  selectAttrPic: that.data.includeGroup[0].pic
		});
	// }
	
	
  },
  /* 选中 */
  selectValue: function (attrValueList, index, key, value, unselectStatus) {
	  var that = this;
    // console.log('firstIndex', that.data.firstIndex);
    var includeGroup = [];
    if (index == that.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
      var commodityAttr = that.data.commodityAttr;
      // 其他选中的属性值全都置空
      // console.log('其他选中的属性值全都置空', index, that.data.firstIndex, !unselectStatus);
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = that.data.includeGroup;
    }

    // console.log('选中', commodityAttr, index, key, value);
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].spData.length; j++) {
        if (commodityAttr[i].spData[j].attrKey == key && commodityAttr[i].spData[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
        }
      }
    }
    attrValueList[index].selectedValue = value;

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = false;
      }
    }
    for (var k = 0; k < attrValueList.length; k++) {
      for (var i = 0; i < includeGroup.length; i++) {
        for (var j = 0; j < includeGroup[i].spData.length; j++) {
          if (attrValueList[k].attrKey == includeGroup[i].spData[j].attrKey) {
            for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
              if (attrValueList[k].attrValues[m] == includeGroup[i].spData[j].attrValue) {
                attrValueList[k].attrValueStatus[m] = true;
              }
            }
          }
        }
      }
    }
    // console.log('结果', attrValueList);
    that.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup
    });

    var count = 0;
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) {// 第一次选中，同属性的值都可选
      that.setData({
        firstIndex: index
      });
    } else {
      that.setData({
        firstIndex: -1
      });
    }
  },
  /* 取消选中 */
  disSelectValue: function (attrValueList, index, key, value) {
	  var that = this;
    var commodityAttr = that.data.commodityAttr;
    attrValueList[index].selectedValue = '';

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    that.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        that.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
      }
    }
  },




  // 跳转至购物车
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/cart/cart"
    });
  },

  //添加到购物车/原 
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  

  },

  //添加到购物车 
  adhopCar: function () {
    var that = this;
    var user_tokenHead = wx.getStorageSync('user_tokenHead');
    var user_token = wx.getStorageSync('user_token');
  var value = [];
 for (var i = 0; i < that.data.attrValueList.length; i++) {
 if (!that.data.attrValueList[i].selectedValue) {
   break;
 }
 value.push(that.data.attrValueList[i].selectedValue);
 
 }

 if (i < that.data.attrValueList.length) {
   wx.showModal({
     title: '提示',
     content: '请完善属性',
     showCancel: false
   })
 } 

if (that.data.includeGroup.length == 1) {
  var goodsAttrArr = that.data.includeGroup[0].spData;
  var goodsData = that.data.includeGroup[0];
  goodsAttrArr = JSON.stringify(goodsAttrArr).replace(/attrKey/g,"key").replace(/attrValue/g,"value");
  //goodsAttrArr = JSON.parse(goodsAttrArr);

  console.log(goodsAttrArr);
}

//判断商品是否具有sku 规格数据
  // if(that.data.goodsDetail.skuStockList){

  // }else{

  //}
    var shopCarData = {
      "createDate": "",
      "deleteStatus": 0,
      "id": 0,
      "memberId": 0,
      "memberNickname": "",
      "modifyDate": "",
      "price": goodsData.price,
      "productAttr": goodsAttrArr,
      "productBrand": "",
      "productCategoryId": that.data.goodsDetail.productCategoryId,//产品类型ID
      "productId": that.data.goodsDetail.id,//产品ID
      "productName": that.data.goodsDetail.name,//产品名称
      "productPic": that.data.goodsDetail.pic,//产品图
      "productSkuCode": goodsData.skuCode,
      "productSkuId": goodsData.id,
      "productSn": "",
      "productSubTitle": that.data.goodsDetail.subTitle,//产品简介
      "quantity": that.data.num
    };
    wx.request({
      url: app.globalData.baseUrl +'/mallPort/cart/add',
      method: 'POST',
      header: {
        'content-type': 'application/json',
         'Authorization':user_tokenHead+' '+ user_token,
      },
      data:shopCarData,
      success: (res) =>{
        if (res.data.code == 200) {
          wx.showToast({
            title: '添加成功',
            duration:1000,//显示时长
            mask:true,//是否显示透明蒙层，防止触摸穿透，默认：false 
            icon:'success',
          })
          that.closePopupTap();
        } else if (res.data.code !== 200){
          console.log(res)
        }
      }
    })
  },



  // 立即购买
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },

  // 开启拼团
  pingtuan: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/pingtuan/open',
      data: {
        token: app.globalData.token,
        goodsId: that.data.goodsDetail.id
      },
      success: function (res) {
        if (res.data.code == 200) {
          that.setData({
            pingtuanOpenId: res.data.data.id,
            shopType: "pingtuan"
          });
          that.bindGuiGeTap();
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
 
  // 规格选择弹出框
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },
 
  // 规格选择弹出框隐藏
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },

  /* 输入框事件 */  
  bindManual: function(e) {  
    var num = e.detail.value;  
    // 将数值与状态写回  
    this.setData({  
        num: num  
    });  
},

  // - 减数量
  bindMinus: function() {  
    var num = this.data.num;  
    // 如果大于1时，才可以减  
    if (num > 1) {  
        num --;  
    }  
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num <= 1 ? 'disabled' : 'normal';  
    // 将数值与状态写回  
    this.setData({  
        num: num,  
        minusStatus: minusStatus  
    });  
},  

  // + 加数量 
  bindPlus: function() {  
    var num = this.data.num;  
    // 不作过多考虑自增1  
    num ++;  
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num < 1 ? 'disabled' : 'normal';  
    // 将数值与状态写回  
    this.setData({  
        num: num,  
        minusStatus: minusStatus  
    });  
},


  /**
   * 选择商品规格
   * @param {Object} e
   */
  labelItemTap: function (e) {
    var that = this;
    // 取消该分类下的子栏目所有的选中状态
    var childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
    for (var i = 0; i < childs.length; i++) {
      that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    // 获取所有的选中规格尺寸数据
    var needSelectNum = that.data.goodsDetail.properties.length;
    var curSelectNum = 0;
    var propertyChildIds = "";
    var propertyChildNames = "";
    for (var i = 0; i < that.data.goodsDetail.properties.length; i++) {
      childs = that.data.goodsDetail.properties[i].childsCurGoods;
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].active) {
          curSelectNum++;
          propertyChildIds = propertyChildIds + that.data.goodsDetail.properties[i].id + ":" + childs[j].id + ",";
          propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].name + ":" + childs[j].name + "  ";
        }
      }
    }
    var canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    // 计算当前价格
    // if (canSubmit) {
    //   wx.request({
    //     url: app.siteInfo.url + app.siteInfo.subDomain + '/shop/goods/price',
    //     data: {
    //       goodsId: that.data.goodsDetail.id,
    //       propertyChildIds: propertyChildIds
    //     },
    //     success: function (res) {

    //       that.setData({
    //         selectSizePrice: res.data.data.price,
    //         propertyChildIds: propertyChildIds,
    //         propertyChildNames: propertyChildNames,
    //         buyNumMax: res.data.data.stores,
    //         buyNumber: (res.data.data.stores > 0) ? 1 : 0,
    //         selectptPrice: res.data.data.pingtuanPrice
    //       });
    //     }
    //   })
    // }

    this.setData({
      goodsDetail: that.data.goodsDetail,
      canSubmit: canSubmit
    })

  },
  
  //加入购物车
  addShopCar: function () {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      return;
    }
    if (this.data.num < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建购物车
    var shopCarInfo = this.bulidShopCarInfo();

    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });
    // 写入本地存储
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
		//更新tabar购物车数字角标
		app.getShopCartNum()
    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
    //console.log(shopCarInfo);

    //shopCarInfo = {shopNum:12,shopList:[]}
  },

  //立即购买
  buyNow: function () {
    var that = this;
    var value = [];
   for (var i = 0; i < that.data.attrValueList.length; i++) {
	 if (!that.data.attrValueList[i].selectedValue) {
	   break;
	 }
	 value.push(that.data.attrValueList[i].selectedValue);
	 
   }

   if (i < that.data.attrValueList.length) {
	   wx.showModal({
	     title: '提示',
	     content: '请完善属性',
	     showCancel: false
	   })
   } 

	if (that.data.includeGroup.length == 1) {
    var goodsAttrArr = that.data.includeGroup[0].spData;
		goodsAttrArr = JSON.stringify(goodsAttrArr).replace(/attrKey/g,"key").replace(/attrValue/g,"value");
		goodsAttrArr = JSON.parse(goodsAttrArr);

		console.log(goodsAttrArr);
	}
    if (!goodsAttrArr) {
      wx.hideLoading();
      if (!that.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      that.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
      return;
    }
    if (that.data.num < 1) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    setTimeout(function () {
      wx.hideLoading();
      //组建立即购买信息
      var buyNowInfo = that.buliduBuyNowInfo();
      // 写入本地存储
      wx.setStorage({
        key: "buyNowInfo",
        data: buyNowInfo
      })
      that.closePopupTap();

      wx.navigateTo({
        url: "/pages/pay-order/pay-order?orderType=buyNow"
      })
    }, 1000);
    wx.showLoading({
      title: '商品准备中...',
    })

  },
  /**
	  * 一键开团
	  */
  buyPingtuan: function () {
    var that = this;
    if (that.data.goodsDetail.properties && !that.data.canSubmit) {
      wx.hideLoading();
      if (!that.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      that.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
      return;
    }
    if (that.data.num < 1) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    setTimeout(function () {
      wx.hideLoading();
      //组建立即购买信息
      var buyNowInfo = that.bulidupingTuanInfo();
      // 写入本地存储
      wx.setStorage({
        key: "PingTuanInfo",
        data: buyNowInfo
      })
      that.closePopupTap();
      wx.navigateTo({
        url: "/pages/pay-order/pay-order?orderType=buyPT"
      })
    }, 1000);
    wx.showLoading({
      title: '准备拼团中...',
    })
  },
  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function () {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.id;
    shopCarMap.pic = this.data.goodsDetail.pic;
    shopCarMap.name = this.data.goodsDetail.name;
    // shopCarMap.label=this.data.goodsDetail.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.num;
    shopCarMap.logisticsType = this.data.goodsDetail.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.weight;

    var shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.num;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    return shopCarInfo;
  },
	/**
	 * 组建立即购买信息
	 */
  buliduBuyNowInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.id;
    shopCarMap.pic = this.data.goodsDetail.pic;
    shopCarMap.name = this.data.goodsDetail.name;
    // shopCarMap.label=this.data.goodsDetail.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.num;
    shopCarMap.logisticsType = this.data.goodsDetail.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
  // 创建拼团
  bulidupingTuanInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.id;
    shopCarMap.pingtuanId = this.data.pingtuanOpenId;
    shopCarMap.pic = this.data.goodsDetail.pic;
    shopCarMap.name = this.data.goodsDetail.name;
    // shopCarMap.label=this.data.goodsDetail.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectptPrice;
    //this.data.goodsDetail.pingtuanPrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.num;
    shopCarMap.logisticsType = this.data.goodsDetail.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
  // 分享功能
  onShareAppMessage: function () {
    var that = this;
    that.setData({ sharebox: true })
    return {
      title: this.data.goodsDetail.name,
      imageUrl:this.data.goodsDetail.pic,
      path: '/pages/goods-detail/goods-detail?id=' + this.data.goodsDetail.id + '&inviter_id=' + app.globalData.uid + '&share=1',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  // reputation: function (goodsId) {
  //   var that = this;
  //   wx.request({
  //     url: app.siteInfo.url + app.siteInfo.subDomain + '/shop/goods/reputation',
  //     data: {
  //       goodsId: goodsId
  //     },
  //     success: function (res) {
  //       if (res.data.code == 200) {
  //         that.setData({
  //           reputation: res.data.data
  //         });
  //       }
  //     }
  //   })
  // },
  getfav: function () {
    //console.log(e)
    var that = this;
    var id = that.data.id
    wx.request({
      url: app.globalData.urls + '/shop/goods/fav/list',
      data: {
        //nameLike: this.data.goodsDetail.name,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 200 && res.data.data.length) {
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].goodsId == parseInt(id)) {
              that.setData({
                favicon: 1
              });
              break;
            }
          }
        }
      }
    })
  },

  // 添加收藏
  fav: function (e) {
    var that = this;
    console.log(e.currentTarget.dataset);


    var productData = {
      "productId": that.data.shopId,
      "productName": e.currentTarget.dataset.goodname,
      "productPic": e.currentTarget.dataset.goodpic,
      "productPrice": e.currentTarget.dataset.goodprice,
      "productSubTitle": e.currentTarget.dataset.goodtitle
    };
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/member/collection/addProduct',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization':wx.getStorageSync('user_tokenHead')+' '+ wx.getStorageSync('user_token'),
      },
      data: productData,
      success: function (res) {
        if (res.data.code == 200) {
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            image: '../../images/addr-active.png',
            duration: 2000
          })
          that.setData({
            favicon: 1
          });
        }
      }
    })
  },

  // 取消收藏
  del: function () {
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/member/collection/deleteProduct',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization':wx.getStorageSync('user_tokenHead')+' '+ wx.getStorageSync('user_token'),
      },
      data: {
        productId: that.data.shopId,
      },
      success: function (res) {
        if (res.data.code == 200) {
          wx.showToast({
            title: '取消收藏',
            icon: 'success',
            image: '../../images/error.png',
            duration: 2000
          })
          that.setData({
            favicon: 0
          });
        }
      }
    })
  },

  // 回首页
  gohome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },

  tabFun: function (e) {
    var _datasetId = e.target.dataset.id;
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  },
  addPingTuan: function (e) {
    var id = e.currentTarget.dataset.id;
    var pid = e.currentTarget.dataset.uid;
    wx.navigateTo({
      url: "/pages/pingtuan/index?id=" + id + "&uid=" + pid + "&gid=" + this.data.goodsDetail.id
    })
  },
  goPingtuanTap: function () {
    wx.navigateTo({
      url: "/pages/pingtuan/index?id=" + this.data.ptuanCt + "&uid=" + app.globalData.uid + "&gid=" + this.data.goodsDetail.id
    })
  },
  onPullDownRefresh: function (e) {
    var that = this;
    //that.goPingtuan();
    //that.goPingList();
    wx.stopPullDownRefresh();
  },
  onShow: function () {
    var that = this;
    setTimeout(function () {
      if (app.globalData.usinfo == 0) {
        that.setData({
          wxlogin: false
        })
      }
      //that.goPingtuan();
      //that.goPingList();
    }, 1000)
  },
  userlogin: function (e) {
    var that = this;
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    wx.login({
      success: function (wxs) {
        wx.request({
          url: app.globalData.urls + '/user/wxapp/register/complex',
          data: {
            code: wxs.code,
            encryptedData: encryptedData,
            iv: iv
          },
          success: function (res) {
            if (res.data.code != 0) {
              wx.showModal({
                title: '温馨提示',
                content: '需要您的授权，才能正常使用哦～',
                showCancel: false,
                success: function (res) { }
              })
            } else {
              that.setData({ wxlogin: true })
              app.login();
              wx.showToast({
                title: '授权成功',
                duration: 2000
              })
              app.globalData.usinfo = 1;
            }
          }
        })
      }
    })
  },
  getShareBox:function(){
    this.setData({sharebox: false})
  },
  getcode: function () {
    var that = this;
    wx.showLoading({
      title: '生成中...',
    })
    wx.request({
      url: app.globalData.urls + '/qrcode/wxa/unlimit',
      data: {
        scene: "i=" + that.data.goodsDetail.id + ",u=" + app.globalData.uid + ",s=1",
        page: "pages/goods-detail/goods-detail",
        expireHours:1
      },
      success: function (res) {
        if (res.data.code == 200) {
          wx.downloadFile({
            url: res.data.data,
            success: function (res) {
              wx.hideLoading()
              that.setData({
                codeimg: res.tempFilePath,
                sharecode: false,
                sharebox: true
              });
            }
          })
        }
      }
    });
  },
  savecode: function () {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.codeimg,
      success(res) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
    that.setData({
      sharecode: true,
    })
  },
  closeshare: function () {
    this.setData({
      sharebox: true,
      sharecode: true
    })
  },
  onReachBottom: function () {
    let that = this;
    if (that.data.tabArr.curHdIndex === "1"){
      let index = parseInt(that.data.goodIndex);
      index++;
      that.setData({
        goodIndex: index
      });
      that.showGoodFn();
    } 
  },
  showGoodFn: function(){
    let that = this;
    let oBigData = that.data.reputation;
    let length = oBigData.length;
    let num = that.data.goodIndex*2; //每次加载的评论个数
    let len = that.data.showGood.length;
    if(len === length) return false
    if(num>length){
      num = length;
      that.setData({
        loading: false
      });
    }else{
      that.setData({
        loading: true
      });
    } 
    that.setData({
      showGood: []
    });
    for(let i=0;i<num;i++){
      that.data.showGood.push(that.data.reputation[i]);
    }
    that.setData({
      showGood: that.data.showGood,
      goodIndex: parseInt(num / 2)
    });
  }
})
