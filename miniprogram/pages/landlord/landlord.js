const LandlordStore = require('../../stores/landlord_store')

Page({

  /**
   * 页面的初始数据
   */
  data: LandlordStore.data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    LandlordStore.bind(this)
    const res = wx.getStorageSync('apartments')
    if(res){
      LandlordStore.initiate(res)
      return
    }

    LandlordStore.getApartmentById(options.id)
  },

  gotoRoomlist(e){
    let id = e.currentTarget.id
    wx.navigateTo({
      url: '/pages/roomlist/roomlist',
      success: res => {
        res.eventChannel.emit('roomlist', {id, roomNumbers: this.data.am.roomNumbers})
      }
    })
  },


  /* *
   * 添加公寓
   */
  addApartment(){ 
    console.log('eee')
    wx.showModal({ 
      title: "您有更多公寓需使用本【公寓助手】吗？",
      success: res => {
        if( res.confirm ){
          wx.navigateTo({
            url: '/pages/addapartment/addapartment',
          })
        } else {
          return
        }
      }
    })
  },


  /* *
   * 切换公寓
   */ 
  onSwitchMyApart(){ this.setData({ show: true, showApartList: true }) },
  onSelectMyApart( e ){ console.log( e, 'select'); this.setData({ show: false, showApartList: false })},
  
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
    LandlordStore.getApartmentById(this.data.am._id)
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