const MyspaceStore = require('../../stores/myspace_store')
const UserStore = require('../../stores/user_store')

Page({

  /**
   * 页面的初始数据
   */
  data: MyspaceStore.data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    MyspaceStore.bind(this)
  },

  toMyroom(){
    wx.navigateTo({
      url: '/pages/myroom/myroom',
      success: async (res) => {
        await MyroomStore.getMyroom()
      },

    })
  },

  gotoLandlord(){
    let myApartments = UserStore.data.user.userInfo.myApartments || []
    if(myApartments.length===0){
      // 跳转至注册公寓页面
      wx.navigateTo({
        url: '/pages/addapartment/addapartment'
      })
      return
    }

   
    let list = []
    myApartments.forEach(one=>{
      list.push(one.name)
    })

    wx.showActionSheet({
      itemList: list,
      success: res => {
        let id = myApartments[res.tapIndex].id
        wx.navigateTo({
          url: '/pages/landlord/landlord?id='+id,
        })
      }
    })
  },
  gotoZuhu(e){
    let level = UserStore.data.user.userInfo.level
    if(level===3 || level===4){
      wx.navigateTo({
      url: '/pages/myroom/myroom'
    })
      return
    }

    // 跳转至注册公寓页面
    wx.navigateTo({
      url: '/pages/checkin/checkin'
    })
  },

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