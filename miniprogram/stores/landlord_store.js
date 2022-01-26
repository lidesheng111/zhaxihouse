const {Store} = require('westore')
const MLandlord = require('../models/landlord')
const UserStore = require('../stores/user_store')
const util = require('../src/util/util')
const app = getApp()

class LandlordStore extends Store {
  constructor(){
    super()
    this.data = {
      level: null,
      avatarUrl: '',
      myApartments: [],
      am: {
        apartmentName: '',
        address: '',
        lowestPrice: '',
        highestPrice: '',
        ePrice: 0,
        wPrice: '',
        gPrice: '',
        graceDays: 0,
        latePrice: 0,
        manageInfo: '',
        payDay: '',
        roomTyps: [],
        facilities: [],
        numberOfRooms: '',
        roomNumbers: [],
        isMembership: false,
        registeringDay: '',
        anchorDate: '',
        totalDeposit: 0,
        _id: '',
        _openid: ''
      },
      permitsExpiring: [],

      rentalBills: 0,
      eBills: 0,
      wBills: 0,
      gBills: 0,
      punishmentBills: 0,
      oBills: 0,
      total: 0,
    }
  }

  async getApartmentById(id){
    const res = await MLandlord.getApartmentById(id)
    wx.stopPullDownRefresh({
      success: res => {wx.showToast({title: '最新状态'})}
    })
    this.initiate(res.result.list[0])
    this._getPermitsByAptmid(this.data.am._id) // 获取暂住证信息
    this._getCurrentMonthBills() // 获取当月账目
    this._initiateMonthBills() // 在月份交替之际，初始化新月份账单
  }

  initiate(apartment){
    Object.keys(apartment).map( key => {this.data.am[key] = apartment[key]})
  
    this.data.level = UserStore.data.user.userInfo.level
    this.data.avatarUrl = UserStore.data.user.userInfo.avatarUrl // 头像
    this.data.myApartments = UserStore.data.user.userInfo.myApartments
    this.update()
  }

  async _initiateMonthBills(){
    const currentMonth = new Date().getMonth() + 1 + ''
    if(this.data.am.anchorMonth !== currentMonth){ // 比较月份
      const res = await MLandlord.setMonthBills( this.data.am._id )
      if(res.result._id){
        // 初始化成功后，更新公寓的 anchorMonth记录
        const res = await MLandlord.updateMyApartment(this.data.am._id, {
          anchorMonth: currentMonth
        })
        if(res.result.stats.updated === 1){
          wx.showToast({title: '初始化本月账单成功'})
        }
      }
    }
  }

  /* 
  * 获取本月账目
  */
  async _getCurrentMonthBills(){
    const res = await MLandlord.getCurrentMonthBills(this.data.am._id)
    const bills = res.result.data[0]
    this.data.rentalBills = bills.rentalBills
    this.data.eBills = bills.eBills
    this.data.wBills = bills.wBills
    this.data.gBills = bills.gBills
    this.data.punishmentBills = bills.punishmentBills
    this.data.oBills = bills.oBills
    this.data.total = bills.rentalBills + bills.eBills + bills.wBills + bills.gBills + bills.punishmentBills + bills.oBills
    this.update()
  }

  /* 
  * 获取暂住证：根据公寓id
  * 然后：找出快要过期的暂住证
  */
  async _getPermitsByAptmid(aptmid){
    const res = await MLandlord.getPermitsByAptmid(aptmid)
    let list = res.result.data
    list.forEach(item => {
      item.permits.some(item2 => {
        if(util.diffDays(item2.expiredIn) > -30){
          this.data.permitsExpiring.push({
            roomNo: item.roomNo,
            roomId: item.roomId
          })
        }
      })
    })
    this.update()
  }
}

module.exports = new LandlordStore