const Cloud = require('../src/util/cloudFunctions')

const db = wx.cloud.database()
const _ = db.command
const Lessees = db.collection('Lessees')

class Billsdetails {
  static async updateLateBills(data){ // 未付款：更新逾期费 和 待支付金额
    let i = data.index
    const res = await Lessees.doc(data._id).update({
      data: {
        ['monthlyBills.'+i+'.latePaymentFees']: data.latePaymentFees,
        ['monthlyBills.'+i+'.arrears']: data.arrears
      }
    })

    return res
  }

  static async updateHavePaid(data){ // 付款后：更新逾期费 和 待支付金额
    let i = data.index
    const res = await Lessees.doc(data._id).update({
      data: {
        ['monthlyBills.'+i+'.havePaid']: data.havePaid,
        ['monthlyBills.'+i+'.arrears']: data.arrears,
        ['monthlyBills.'+i+'.allPaid']: data.allPaid,
        ['monthlyBills.'+i+'.paymentRecords']: _.push(data.record)
      }
    })

    return res
  }

  /* 
  * 支付：
  */
  static async paying(payment){
    const res = await Cloud.call({
      $url: "paying",
      apartmentId: payment.apartmentId,
      body: payment.body,
      totalFee: payment.totalFee,
    })
    return res
  }

  static async updateDeposit(data){
    const res = await Cloud.call({
      $url: "updateDeposit",
      _id: data._id,
      havePaid: data.havePaid,
      depositLateFees: data.depositLateFees,
      allPaid: data.allPaid
    })

    console.log(res, 'updateDeposit')
    return res
  }
}

module.exports = Billsdetails
