const OutlayStore = require('../../stores/outlay_store')

Page({

  /**
   * 页面的初始数据
   */
  data: OutlayStore.data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    OutlayStore.bind(this)
    OutlayStore.initiate(options.id)
  },

  yearMonth(e){ 
    console.log(e)
    let year_month = e.detail.value.split('-')
    console.log(year_month)
    this.setData({ curYear:year_month[0], curMonth: year_month[1] }) 
    OutlayStore.getMonthlyOutlay()
  },

  year(e){
    this.setData({ curYear: e.detail.value }) 
    OutlayStore.getYearlyOutlay()
  },

  tabchange(e){
    if(e.detail.activeKey === '1'){ OutlayStore.getYearlyOutlay() }
  },

  spendedon(e){ this.setData({ spendedon: e.detail.value }) },
  howmuch(e){ this.setData({ howmuch: (e.detail.value)*1 }) },
  submit(){ OutlayStore.submit() },

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