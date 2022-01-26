const {Store} = require('westore')
const MRoomdetails = require('../models/roomdetails')
const MLandlord = require('../models/landlord')
const UserStore = require('../stores/user_store')
const LandlordStore = require('../stores/landlord_store')

const db = wx.cloud.database()
const _ = db.command
const Lessees = db.collection('Lessees')
const util = require('../src/util/util')
const app = getApp()

class Roomdetails extends Store {
  constructor(){
    super()

    this.data = {
      level: app.globalData.level,

      details: {
        // allPaid: null,
        anchorDate: '',
        apartmentId: '',
        // apartmentName: '',
        checkinDate: '',
        contractSigned: false,
        depositInfo: {
          havePaid: 0,
          depositLateFees: 0
        },
        ePrice: 0,
        eReadings: [],
        floor: '',
        gPrice: 0,
        oPrice: 0,
        permits: [],
        isOverdued: '',
        isStaying: '',
        latePrice: 0,
        graceDays: 0,
        // leaseTerm: '',
        lessee: [],
        monthlyBills: [],
        numberOfPeople: 0,
        rental: 0,
        roomMates: [],
        roomNo: '',
        termEndDate: '',
        // TRPExpiredIn: '',
        // TRPObtained: null,
        wPrice: 0,
        workat: '',
        wReadings: [],
        useWaterMeter: false,
        _id: '',
        _openid: '',
      },

      showRoomPicker: false,
      newRoom: '',
      newFloor: '',

      // 室友管理
      showMask: false,
      _roommatesIndex: null,

      // 暂住证管理
      _showMaskTPR: false,
      resiPermitIndex: '',
      permitWarning: '',

      // 价格管理
      price: '',
      _showPriceMask: false,
      prices: app.globalData.prices,

      // 合同管理
      _showLeaseMask: false,
      newLeaseDate: '',
      leaseWarning: '',
      diffDaysContract: null,

      // 月度账单
      from: '',
      till: '',
      rental: 0,
      eBill: 0,
      wBill: 0,
      gBill: 0,
      oBill: 0,
    }
  }

  /* 
  *根据id获取数据
  */
  async getRoomById(id){
    const res = await MRoomdetails.getRoomById(id)
    this.initiateDetails(res.result.list[0])
  }

  // 初始化
  initiateDetails(room){
    Object.keys(room).map( key => {
      this.data.details[key] = room[key]
    })

    if(this.data.details.permits.length === 0){
      this.data.details.permits.push({permits: []})
    }

    this.data.level = UserStore.data.user.userInfo.level

    // 计算合同到期时间
    this._leaseManage(this.data.details.termEndDate)

    // 初始化月度账单数据：【房租】和【卫生费】
    this.data.rental = (this.data.details.rental)*1 // string to number
    this.data.gBill = parseInt(this.data.details.gPrice) // string to number
    this.update()
  }

  _leaseManage(termEndDate){
    let diffDays = util.diffDays(termEndDate)

    if( diffDays >= 0 ){
      this.data.leaseWarning = '合同还剩 '+diffDays+' 天'
    } else if( diffDays < 0 ){
      this.data.leaseWarning = '合同过期 '+Math.abs(diffDays)+' 天'
    }

    this.data.diffDaysContract = diffDays
  }

  _permitWarning(){}


  /* 换房 */
  async changeRoom(){
    const id = this.data.details._id
    const {newRoom, newFloor} = this.data
    const res = await MRoomdetails.changeRoom(id, newRoom, newFloor)
    if(res.stats.updated === 1){
      wx.showToast({ title: '换房成功' })
      this.data.details.roomNo = newRoom
      this.data.details.floor = newFloor
      
      this.update()
      return true
    }
  }

  /* 整间退房 */
  async checkoutAll(){
    const res = await MRoomdetails.checkoutAll(this.data.details._id)
    if(res.stats.updated === 1){
      wx.showToast({ title: '操作成功' })

      /* 延迟操作，方面上面提示执行完毕 */
      setTimeout( () => {
        wx.navigateBack({delta: 2 })
      }, 1500)
    }
  }
  /* *
  * 管理roomMates
  */
  inputRoommatesTel(value){
    this.data.details.roomMates[this.data._roommatesIndex].tel = value
    this.update()
  }
  inputRoommatesWork(value){
    this.data.details.roomMates[this.data._roommatesIndex].theyworkat = value
    this.update()
  }
  // 已办暂住证
  async TRPObtained(index){
    this.data._roommatesIndex = index
    
    const res = await MRoomdetails.updateRoommates(this.data.details._id, {
      ['roomMates.'+[index]+'.TRPObtained']: true
    })
    
    if(res.stats.updated === 1){
      wx.showToast({ title: '已办暂住证' })
      this.data.details.roomMates[this.data._roommatesIndex].TRPObtained = true
      this.update()
    }
  }
  // 离开
  async checkout(index){
    this.data._roommatesIndex = index
    let name = this.data.details.roomMates[index].name
    const res = await MRoomdetails.checkout(this.data.details._id, name)
    
    if(res.stats.updated === 1){
      wx.showToast({title: '离店成功'})
      this.data.details.roomMates.splice(index, 1) // 更新本地
      this.update()
    }
  }
  // 修改
  async submitMates(){
    let index = this.data._roommatesIndex

    const res = await MRoomdetails.updateRoommates(this.data.details._id, {
      ['roomMates.'+[index]+'.tel']: this.data.details.roomMates[index].tel,
      ['roomMates.'+[index]+'.theyworkat']: this.data.details.roomMates[index].theyworkat,
    })
    
    if(res.stats.updated===1){
      wx.showToast({ title: '修改信息成功' })
      return true
    }
  }
  /* 
  * 更新/管理 prices价格
  */ 
  async updatePrices(key, index){
    const res = await MRoomdetails.updateRoommates(this.data.details._id, {
      [key]: this.data.price
    })

    if(res.stats.updated === 1){
      wx.showToast({ title: '更新成功' })
      this.data.details[key] = this.data.price // 更新本地
      
      this.update()
    }
  }

  /* 
  * 押金管理
  */
  async depositPaidOffline(lateFeePaid){
    const lateFee = lateFeePaid ? lateFeePaid : 0
    const deposit = this.data.details.depositInfo.deposit
    const havePaid = deposit + lateFee

    /* 更新房间押金状态 */ 
    const res = await MRoomdetails.depositPaidOffline(this.data.details._id, lateFee, havePaid)

    if(res.stats.updated === 1){
      const apartmentId = LandlordStore.data.am._id
      const currentTotalDeposit = LandlordStore.data.am.totalDeposit //获取公寓当前押金总额

      /* 更新公寓押金总额 */ 
      const res1 = await MLandlord.updateMyApartment(apartmentId, {
        totalDeposit: currentTotalDeposit + deposit
      })

      /* 更新公寓账目：押金逾期费 */ 
      if(lateFee !== 0){
        const res2 = await MLandlord.updatePunishmentBills({
          apartmentId: LandlordStore.data.am._id,
          punishmentBill: lateFee
        })

        if(res1.result.stats.updated === 1 && res2.result.stats.updated === 1){
          wx.showToast({title: '设置成功'})
        }

        /* 更新本地 */
        this._updateLocalDepositInfo(deposit + lateFee)
        return
      }

      if(res1.result.stats.updated === 1){
        wx.showToast({title: '设置成功'})

        /* 更新本地 */
        this._updateLocalDepositInfo(deposit + lateFee)
      }
    }
  }

  _updateLocalDepositInfo(totalPaid){
    let info = this.data.details.depositInfo
    info.havePaid = totalPaid
    info.allPaid = totalPaid >= info.deposit
    this.update()
  }

  /* 
  * 暂住证管理
  */
  // 编辑：由页面resiPermitDelete驱动
  resiPermitEdited(data){
    const permit = this.data.details.permits[0].permits[this.data.resiPermitIndex]
    permit.name = data.name
    permit.idNumber = data.idNumber
    permit.expiredIn = data.expiredIn
    this.update()
  }
  // 删除：由页面resiPermitDelete驱动
  resiPermitDelete(){
    this.data.details.permits[0].permits.splice(this.data.resiPermitIndex, 1)
    this.update()
  }
  // 新增：由页面resiPermitDelete驱动
  resiPermitAdd(data){
    // 空白：permits: []
    this.data.details.permits[0].permits.push(data)
    this.update()
  }

  
  /* 
  *合同管理
  */
  async updateLease(){
    try{
      const res = await Lessees.doc(this.data.details._id).update({
        data: {
          termEndDate: this.data.newLeaseDate,
          contractSigned: false
        }
      })
      console.log(res, 'lease')
      if(res.stats.updated===1){
        wx.showToast({
          title: '更新成功'
        })
        this.data.details.termEndDate = this.data.newLeaseDate
        this.data.details.contractSigned = false // 更新本地
        this.update()
        return true
      }
    } catch(err){
      console.log(err)
    }
  }
  async updateContract(bool){
    try{
      const res = await Lessees.doc(this.data.details._id).update({
        data: { contractSigned: bool }
      })
      if(res.stats.updated===1){
        wx.showToast({ title: '更新成功' })
        this.data.details.contractSigned = bool // 更新本地
        this.update()
        return true
      }
    } catch(err){
      console.log(err)
    }
  }

  /* 
  * 创建账单
  */
  async setMonthlyBill(){
    const {from,till,rental,eBill,wBill,gBill,oBill} = this.data

    let total = rental+eBill+wBill+gBill+oBill

    const bills = {
      // id: Math.random().toString(15).substr(2, 12),
      from,
      till,
      rental,
      eBill,
      wBill,
      gBill,
      oBill,
      isOverduedFor:0,
      latePaymentFees:0,
      // graceDays: 0,
      allPaid: false,
      total: total,
      arrears: total, 
      havePaid: 0,
      paymentRecords: []
    }

    // 确认是否填写完整
    if(!from || !till){
      wx.showToast({
        title: '账单日期未填完整',
        icon: 'none',
        duration: 3000
      })
      return
    }

    // 确认订单是否有误
    wx.showModal({
      title: '月度账单',
      content: '房租'+rental+', 电费'+eBill+', 水费'+wBill+', 卫生费'+gBill+(oBill?', 其他费用'+oBill:''),
      success: res => {
        if(res.confirm){
          this._updateBills(bills)
          this._updateAccounts(bills)
        } else {
          console.log('取消')
        }
      }
    })
  }

  async _updateBills(bills){
    try{
      const res = await Lessees.doc(this.data.details._id).update({ // 更新云端
        data: { 
          monthlyBills: _.push(bills)
        }
      })
      if(res.stats.updated===1){
        wx.showToast({ title: '创建账单成功' })
        this.data.details.monthlyBills.push(bills) // 更新本地
        this.update()
      }
    } catch(err){
      console.log(err)
    }
  }

  // 云端更新数据库公寓accounts
  async _updateAccounts(bills){
    // const date = new Date(bills.from)
    // const year = date.getFullYear()+''
    // const month = date.getMonth()+1+''

    MLandlord.updateAccounts({
      apartmentId: LandlordStore.data.am._id,
      // year,
      // month,
      rental: bills.rental,
      eBill: bills.eBill,
      wBill: bills.wBill,
      gBill: bills.gBill,
      oBill: bills.oBill,
    })
  }


  /* 
  *水电表管理
  */
  async useWaterMeterRadio(){ // 切换使用水表与否 radio
    this.data.details.useWaterMeter = !this.data.details.useWaterMeter
    this.update()
    try{
      const res = await Lessees.doc(this.data.details._id).update({
        data: { 
          useWaterMeter: this.data.details.useWaterMeter
        }
      })
      if(res.stats.updated===1){
        wx.showToast({ title: this.data.details.useWaterMeter?'启用水表':'不使用水表计费' })
      }
    } catch(err){
      console.log(err)
    }
  }

  async manageE_W(data){ // 更新水电表记录
    let key = data.type
    let record = {
      value: data.reading,
      date: util.formatTime(new Date(), 'day')
    }
    try{
      const res = await Lessees.doc(this.data.details._id).update({
        data: { 
          [key]: _.push(record)
        }
      })
      if(res.stats.updated===1){
        wx.showToast({ title: '添加'+key==='eReadings'?'电表记录成功':'水表记录成功' })
        this.data.details[key].push(record) // 更新本地
        this.update()
      }
    } catch(err){
      console.log(err)
    }
  }


  /* 
  * billsdetails对本页面的更新：allPaid字段
  */
  updatePaymentChange(data){
    this.data.details.monthlyBills[data.i].havePaid = data.havePaid
    this.data.details.monthlyBills[data.i].arrears = data.arrears
    this.data.details.monthlyBills[data.i].allPaid = data.allPaid
    this.update()
  }
}

module.exports = new Roomdetails