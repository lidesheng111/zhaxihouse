const {Store} = require('westore')

const RoomdetailsStore = require('../stores/roomdetails_store')
const MyroomStore = require('../stores/myroom_store')
const UserStore = require('../stores/user_store')
const MBillsdetails = require('../models/billsdetails')

const util = require('../src/util/util')

class Billsdetails extends Store {
  constructor(){
    super()

    this.data = {
      // 用户信息
      level: null,
      name: '',

      // 房间信息
      subMchId: '1605572377',
      _id: '', // 房间id
      apartmentId: '', // 公寓id
      index: '', // 月度账单序号

      // 账单信息
      latePaymentFees: 0,
      allPaid: null,
      arrears: 0,
      eBill: 0,
      id: '',
      oBill: 0,
      isOverduedFor: null,
      havePaid: null,
      paymentRecords: [],
      rental: 0,
      till: '',
      from: '',
      total: 0,
      wBill:0,

      _showMaskOffline: false, // 蒙版管理

      // 自定义金额
      customizedAmountErr: '',
      customizedAmount: 0,

      _time: '', // 支付时间
    }
  }


  /* 
  * 根据【父页面roomdetails】传来的data数据，初始化本页面字段
  */
  initiate(index){ 
    /* 获取上个页面信息：roomdetails or myroom */
    const pages = getCurrentPages()
    const lastPage = pages[pages.length - 2]

    /* 获取上个页面账单数据 */
    let room
    if(lastPage.route === "pages/roomdetails/roomdetails"){
      room = RoomdetailsStore.data.details
    } else {
      room = MyroomStore.data.room
    }
    
    /* 根据index，获取选定的月度账单 */
    let bills = room.monthlyBills[index]

    /* 赋值给本页面 */
    Object.keys(bills).map( key => {
      this.data[key] = bills[key]
    })

    this.data._id = room._id
    this.data.apartmentId = room.apartmentId
    this.data.index = index // 账单序号
    this.data.name = UserStore.data.user.userInfo.name // 姓名
    this.data.level = UserStore.data.user.userInfo.level

    const LATE_PRICE = room.latePrice
    const GRACE_DAYS = room.graceDays
    this.data.latePaymentFees = util.calculateLateFees(this.data.from, LATE_PRICE, GRACE_DAYS)

    // （待支付的）总欠费 = 房租总金额 + 逾期费 - 已付 
    this.data.arrears = (this.data.total)*1 + this.data.latePaymentFees - this.data.havePaid  
    this.update()

    // 更新数据库中【逾期费】 和 【待支付】
    this.updateLateBills()
  }

  async updateLateBills(){
    const res = await MBillsdetails.updateLateBills({
      _id: this.data._id,
      index: this.data.index,
      latePaymentFees: this.data.latePaymentFees,
      arrears: this.data.arrears
    })
    if(res.stats.updated === 1){
      wx.showToast({ title: '更新账单' })
    }
  }

  /* 
  * 房东管理线下支付金额
  */
  customizeAmount(amount){
    if(amount > this.data.arrears){ // 支付金额必须小于等于arrears
      this.data.customizedAmountErr = '金额错误：多交了哦，土豪！'
      util.toastWrong(this.data.customizedAmountErr)
      this.update()
      return
    }

    this.data.customizedAmountErr = '' // 无错误
    this.data.customizedAmount = amount
    this.update()
  }
  // 提交线下支付记录
  async submitOfflinePayment(){
    // 有错误
    if(this.data.customizedAmountErr){ 
      util.toastWrong(this.data.customizedAmountErr)
      return 
    }

    this._updateHavePaidLocally(this.data.customizedAmount) // 现下付款金额：更新本地

    // input输入后，马上点击【提交】，有可能updateOfflinePayment()函数未执行完毕，延时以确保havePaid已更新好
    setTimeout( async () =>{ 
      const res = await MBillsdetails.updateHavePaid({ // 现下付款金额：更新数据库
        _id: this.data._id,
        index: this.data.index,
        havePaid: this.data.havePaid,
        arrears: this.data.arrears,
        allPaid: this.data.allPaid,
        record: {
          paidBy: this.data.name,
          amount: this.data.customizedAmount,
          time: util.formatTime(new Date()),
          orderId: '线下支付'
        },
        
      })

      // console.log(res)
      if(res.stats.updated === 1){
        wx.showToast({
          title: '更新支付成功',
        })
        // 更新本地 支付记录
        this.data.paymentRecords.push({
          paidBy: this.data.name,
          time: util.formatTime(new Date()),
          amount: this.data.customizedAmount
        })
        this.data._showMaskOffline = false
        this.update()
      }
    }, 500)
  }

  /* 
  * 交房租
  */
  async payRental(){
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

    this._makePayment(this.data.arrears)
  }

  async _makePayment(amount){
    const res = await MBillsdetails.paying({
      apartmentId: this.data.apartmentId,
      body: '梦岛公寓房租',
      totalFee: 10
    })
    if(res.result.payment){
      const payment = res.result.payment;
      wx.requestPayment({
        ...payment,
        success: res=>{
          console.log(res, 'go pay')

          this._updateHavePaidLocally(amount) // 交房租付款金额：更新本地

          MBillsdetails.updateHavePaid({ // 交房租付款金额：更新数据库
            _id: this.data._id, // room id
            index: this.data.index, // 账单序号
            havePaid: this.data.havePaid,
            arrears: this.data.arrears,
            allPaid: this.data.allPaid,
            record: {
              name: this.data.name,
              time: util.formatTime(new Date()),
              amount: amount
            }
          })
          if(res.errMsg === 'requestPayment:ok'){
            wx.showToast({title: '支付成功'})
          }
          // 更新本地 支付记录
          this.data.paymentRecords.push({
            paidBy: this.data.name,
            time: util.formatTime(new Date()),
            amount: amount
          })
          this.update()
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

  /* 
  * 有支付行为后，更新本地
  */
  _updateHavePaidLocally(amount){
    this.data.havePaid = this.data.havePaid + amount // （现）已付金额 = （原）已付金额 + （这次）支付金额
    this.data.arrears = this.data.arrears - amount // （现）待付金额 = （原）待付金额 - （这次）支付金额
    this.data.allPaid = this.data.arrears === 0
    this.update()
  }

  /* 
  * 有支付行为后，更新上级页面
  */
  _updateFatherPage(){
    let data = {
      i: this.data.index,
      havePaid: this.data.havePaid,
      arrears: this.data.arrears,
      allPaid: this.data.arrears === 0 // arrears===0：allPaid: true
    }

    /* 
    * 更新上级页面，可能是myroom[租户]，和roomdetails[房东]
    */
    let page = getCurrentPages()[getCurrentPages().length-2] // 获取上级页面
    if(page.route === 'pages/myroom/myroom'){
      page.updatePaymentChange(data)
      return
    }

    page.updatePaymentChange(data)
  }
}

module.exports = new Billsdetails