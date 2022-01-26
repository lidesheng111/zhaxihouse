const AccountsStore = require('../../stores/accounts_store')

Page({

  /**
   * 页面的初始数据
   */
  data: AccountsStore.data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    AccountsStore.bind(this)
    AccountsStore.initiate(options.id)
  },

  
  year(e){ AccountsStore.year(e.detail.value)},
  yearMonth(e){},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})