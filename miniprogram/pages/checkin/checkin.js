// const CheckinStore = require('../../stores/checkin_store')
import CheckinStore from '../../stores/checkin_store'

Page({
  data: CheckinStore.data,

  onLoad: function (options) { CheckinStore.bind(this) },

  search(e){ CheckinStore.search(e.detail.value) },
  cancel(e){ this.setData({_apartments: [], _show: false}) },
  choose(e){ CheckinStore.choose(e.currentTarget.id) },

  apartmentName(e){ this.setData({_show: true}) },

  getFloor(e){ this.setData({floor: e.detail}) }, // 楼层from _picker
  getRoomNo(e){ this.setData({ roomNo: e.detail}) }, // 房间号from _picker

  // 从calendar获取日期
  checkinDate(e){ this.setData({ checkinDate: e.detail.date }) },
  termEndDate(e){ this.setData({ termEndDate: e.detail.date }) },
  paidTill(e){ this.setData({ paidTill: e.detail.date }) },

  // leaseTerm(e){ this.setData({ leaseTerm: e.detail.value }) },
  rental(e){ this.setData({ rental: (e.detail.value)*1 }) },
  deposit(e){ this.setData({ deposit: (e.detail.value)*1 }) },
  emeterReading(e){ this.setData({ eReadingStarts: (e.detail.value)*1 }) },

  workat(e){ this.setData({workat: e.detail.value}) },

  numberOfPeople(e){ this.setData({ numberOfPeople: (e.detail.value)*1 }) },
  addRoomMates(){
    let mates = this.data.roomMates
    if(mates.length===0){ 
      this.data.roomMates.push({staying: true, TRPExpiredIn: ''}) //在住，暂住证有效期
      this.setData({ roomMates: this.data.roomMates })
      return
    }

    // 室友人数限制
    if(mates.length===this.data.numberOfPeople-1){
      wx.showToast({
        title: '总人数超过入住人数了哦！',
        icon: 'none',
        duration: 3000
      })
      return
    }

    // 室友信息录入完整，才能添加新输入栏
    if(mates[mates.length-1].name && mates[mates.length-1].tel){ 
      this.data.roomMates.push({staying: true, TRPExpiredIn: ''})
      this.setData({ roomMates: this.data.roomMates })
      return 
    }
    
    wx.showToast({
      title: '当前室友信息未填完整哦',
      icon: 'none',
      duration: 3000
    })
  },
  delete(){
    this.data.roomMates.pop()
    this.setData({ roomMates: this.data.roomMates })
  },
  mates(e){ //室友姓名
    let index = e.currentTarget.id
    this.data.roomMates[index].name = e.detail.value
    this.setData({ roomMates: this.data.roomMates })
  },
  tel(e){ //室友电话
    let index = e.currentTarget.id
    this.data.roomMates[index].tel= e.detail.value
    this.setData({ roomMates: this.data.roomMates })
  },
  theyworkat(e){ //室友工作
    let index = e.currentTarget.id
    this.data.roomMates[index].theyworkat= e.detail.value
    this.setData({ roomMates: this.data.roomMates })
  },

  contractSigned(e){ this.data.contractSigned = e.detail.value },

  async submit(){
    await CheckinStore.checkin()
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