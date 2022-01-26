
const RoomlistStore = require('../../stores/roomlist_store')

Page({
  data: RoomlistStore.data,

  onLoad: function async (options) {
    RoomlistStore.bind(this)
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('roomlist', data => {
      RoomlistStore.initiateFloor(data.roomNumbers) // 初始化楼层-房间
      RoomlistStore.getRoomlist(data.id)
    })
  },

  changeTabs(e){ this.setData({_floor: e.detail.activeKey}) },

  onTouchMove(e){ RoomlistStore.switchFloor(e.direction) },

  gotoRoomdetails(e){
    let id = e.currentTarget.id
    let list = this.data._roomlist
    for(let i = 0, len=list.length; i < len; i++){
      if(list[i]._id === id){
        wx.navigateTo({
          url: '/pages/roomdetails/roomdetails',
          success: res => {
            res.eventChannel.emit('details', list[i])
          }
        })
        break
      }
    }
  },

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