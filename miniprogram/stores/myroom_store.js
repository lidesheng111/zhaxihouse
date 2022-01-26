const {Store} = require('westore')
const MMyroom = require('../models/myroom')
const UserStore = require('../stores/user_store')

const MBillsdetails = require('../models/billsdetails')

const util = require('../src/util/util')

class MyroomStore extends Store {
  constructor(){
    super()

    this.data = {
      room: {
        // allPaid: null,
        anchorDate: '',
        apartmentId: '',
        apartmentName: '',
        checkinDate: '',
        contractSigned: '',
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
        numberOfPeople: '',
        rental: 0,
        roomMates: '',
        roomNo: '',
        termEndDate: '',
        TRPExpiredIn: '',
        TRPObtained: null,
        wPrice: 0,
        workat: '',
        wReadings: [],
        useWaterMeter: null,
        _id: '',
        _openid: '',
      },
      level: null,
      avavatarUrl: '',
      diffDaysContract: null,
      leaseWarning: '',

      isOverdued: false,

      depositToPay: 0,
      customizedAmountErr: '',
      customizedAmount: 0
    }
  }

  async getMyroom(){
    const res = await MMyroom.getMyroom() // 获取myroom
    this.data.room = res.result.list[0]
    this.data.level = UserStore.data.user.userInfo.level // 获取level
    this.data.avatarUrl = UserStore.data.user.userInfo.avatarUrl // 头像

    
    let {checkinDate, latePrice, graceDays, termEndDate} = this.data.room

    // 计算押金逾期费
    this.data.room.depositInfo.depositLateFees = util.calculateLateFees(checkinDate, latePrice, graceDays)

    this._depositToPay()

    // 计算合同到期情况
    let diff = util.diffDays(termEndDate)
    this.data.diffDaysContract = diff
    if(diff >= 0){ this.data.leaseWarning = `${diff}天到期` }
    else if(diff < 0 ){ this.data.leaseWarning = `过期${Math.abs(diff)}天` }

    this.update()

    // 延时计算房租逾期情况
    setTimeout(() => {
      this.checkOverdued()
    }, 3000)
  }

  // 检查是否有逾期
  checkOverdued(){
    this.data.room.monthlyBills.some(item => {
      if(!item.allPaid){ this.data.isOverdued = true }
    })
    this.update()
  }

  // 更新待付【押金金额】
  _depositToPay(){
    const depositInfo = this.data.room.depositInfo
    this.data.depositToPay = depositInfo.deposit + depositInfo.depositLateFees - depositInfo.havePaid
  }

  // 由下级页面【billsdetails】触发
  updatePaymentChange(data){
    this.data.room.monthlyBills[data.i].havePaid = data.havePaid
    this.data.room.monthlyBills[data.i].arrears = data.arrears
    this.data.room.monthlyBills[data.i].allPaid = data.allPaid
    this.update()
  }

  /* 
  * 自定义支付的押金金额
  */
  customizeAmount(amount){
    if(amount > this.data.room.depositToPay){ // 支付金额必须小于等于【待付金额】
      this.data.customizedAmountErr = '金额错误：多交了哦，土豪！'
      util.toastWrong(this.data.customizedAmountErr)
      this.update()
      return
    }

    this.data.customizedAmountErr = '' // 无错误
    this.data.customizedAmount = amount
    this.update()
  }

  payDeposit(){
    let amount = this.data.customizedAmount
    if(amount !== 0){
      wx.showModal({
        title: '确定先支付'+amount+'元？',
        content: `您未全额支付。每天会产生逾期费哦！`,
        success: res => {
          if(res.confirm){
            this._makePayment(amount)
          }else{
            this.data.amount = 0
            this.update()
          }
        }
      })
      return
    }

    this._makePayment(this.data.depositToPay)
  }

  async _makePayment(amount){
    const apartmentName = this.data.room.apartmentName
    const res = await MBillsdetails.paying({
      apartmentId: this.data.apartmentId,
      body: apartmentName+'押金',
      totalFee: 10
    })
    if(res.result.payment){
      const payment = res.result.payment;
      wx.requestPayment({
        ...payment,
        success: res=>{
          console.log(res, 'go pay')

          // 更新本地: 押金
          const depositInfo = this.data.room.depositInfo
          depositInfo.havePaid += amount
          this._depositToPay()
          depositInfo.allPaid = this.data.depositToPay === 0
          this.update()

          /* 
          * 支付押金后：更新数据库
          */
          MBillsdetails.updateDeposit({
            _id: this.data.room._id, // room id
            havePaid: depositInfo.havePaid,
            depositLateFees: depositInfo.depositLateFees,
            allPaid: depositInfo.allPaid,
          })

          if(res.errMsg === 'requestPayment:ok'){
            wx.showToast({title: '支付成功'})
          }
        },
        fail: err=>{
          if(err.errMsg == 'requestPayment:fail cancel'){
            wx.showToast({
              title: '取消支付',
              icon: 'none'
            })
          }
        }
      })
      return
    }

    let errMsg = res.result.errMsg
    util.toastWrong(errMsg)
  }
}

module.exports = new MyroomStore