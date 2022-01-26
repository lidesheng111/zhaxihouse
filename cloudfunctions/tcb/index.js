// 云函数入口文件
const cloud = require('wx-server-sdk')
const Tcb = require('tcb-router')

cloud.init({env: 'rent-6gritc2gc2f51bb9'})

const db = cloud.database()
const _ = db.command
const $ = _.aggregate
const Users = db.collection('Users')
const Lessees = db.collection('Lessees')
const Apartments = db.collection('Apartments')
const ResiPermits = db.collection('ResiPermits')
const Accounts = db.collection('Accounts')
const Outlay = db.collection('Outlay')
const Deadrooms = db.collection('Deadrooms')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const _openid = wxContext.OPENID
  // const _openid = 'oiRaA4v2fiHkV8mMNoBF-d_OVK1j'
  const app = new Tcb({event})

  /* 
  * 用户user管理
  */
  app.router('getUser', async(ctx, next) => {
    // try{}catch(e){ ctx.body = e }
    try{
      ctx.body = await Users
      .aggregate()
      .match({_openid})
      .end()
    }catch(e){
      ctx.body = e
    }
  })
  app.router('updateUser', async(ctx, next) => {
    try{
      ctx.body = await Users
      .where({_openid: _openid})
      .update(data)
    }catch(e){ ctx.body = e }
  })
  // 给房东用户添加注册的公寓
  app.router('updateUserWithApartment', async(ctx, next) => {
    try{
      ctx.body = await Users.doc(_openid)
      .update({
        data: {
          myApartments: _.push({
            id: event.id,
            name: event.name
          }),
          level: 1 // 房东
        }
      })
    }catch(e){ ctx.body = e }
  })
  app.router('getTel', async(ctx, next) => {
    try{
      ctx.body = await cloud.getOpenData({
      list: [event.cloudID]
    })
    }catch(e){ ctx.body = e }
  })
  app.router('login', async(ctx, next) => {
    try{
      ctx.body = await Users.add({
      data: {
        _id: _openid,
        _openid,
        level: 5, // 游客
        name: event.name,
        tel: event.tel,
        avatarUrl: event.avatarUrl,
        myApartments: []
      }
    })
    }catch(e){ ctx.body = e }
  })

  /* 
  * 我的公寓管理
  */
  // 根据用于名称查找公寓：用户租户checkin时选公寓
  app.router('getApartmentByName', async(ctx, next) => {
    try{
      ctx.body = await Apartments.aggregate()
      .match({
        apartmentName: db.RegExp({
          regexp: event.name
        })
      })
      .lookup({ // 获取公寓房东姓名，便于租客识别公寓
        from: 'Users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'landlord'
      })
      .end()
    }catch(e){ ctx.body = e }
  })
  // 房东注册公寓
  app.router('addapartment', async(ctx, next) => {
    try{
      let data = event.data
      data._openid = _openid
      ctx.body = await Apartments.add({
        data
      })
    }catch(e){ ctx.body = e }
  })
  // 根据id查找公寓
  app.router('getApartmentById', async(ctx, next) => {
    try{
      ctx.body = await Apartments.aggregate().match({
        _id: event.id
      })
      .end()
    }catch(e){ ctx.body = e }
  })
  // 更新公寓信息
  app.router('updateMyApartment', async(ctx, next) => {
    try{
      ctx.body = await Apartments.doc(event.aptmid).update({
        data: event.data
      })
    }catch(e){ ctx.body = e }
  })


  /* 
  * 管理公寓账目  
  */
  app.router('setMonthBills', async(ctx, next) => {
    try{
      ctx.body = await Accounts.add({
        data: {
          apartmentId: event.data.aptmid,
          year: event.data.year,
          month: event.data.month,
          rentalBills: 0,
          eBills: 0,
          wBills: 0,
          gBills: 0,
          punishmentBills: 0,
          oBills: 0
        }
      })
    }catch(e){ ctx.body = e }
  })
  /* 更新公寓账目：正常账单 */
  app.router('updateAccounts', async(ctx, next) => {
    try{
      ctx.body = await Accounts.where({
        apartmentId: event.data.apartmentId,
        year: event.data.year,
        month: event.data.month
      })
      .update({
        data: {
          rentalBills: _.inc(event.data.rental),
          eBills: _.inc(event.data.eBill),
          wBills: _.inc(event.data.wBill),
          gBills: _.inc(event.data.gBill),
          oBills: _.inc(event.data.oBill)
        }
      })
    }catch(e){ ctx.body = e }
  })
  /* 更新公寓账目：违约费 */
  app.router('updatePunishmentBills', async(ctx, next) => {
    try{
      ctx.body = await Accounts.where({
        apartmentId: event.data.apartmentId,
        year: event.data.year,
        month: event.data.month
      })
      .update({
        data: {
          punishmentBills: _.inc(event.data.punishmentBill)
        }
      })
    }catch(e){ctx.body = e}
  })
  /* 获取公寓当月账目 */
  app.router('getCurrentMonthBills', async(ctx, next) => {
    try{
      ctx.body = await Accounts.where({
        apartmentId: event.aptmid,
        year: event.year,
        month: event.month 
      })
      .get()
    }catch(e){ ctx.body = e }
  })
  /* 获取公寓年度账目 */
  app.router('getYearlyAccountsByAptmid', async(ctx, next) => {
    try{
      ctx.body = await Accounts.where({
        apartmentId: event.apartmentId,
        year: event.year
      })
      .orderBy('month', 'asc')
      .get()
    }catch(e){ctx.body = e}
  })


  /**
   * 公寓支出管理
   */

  /* 添加公寓支出 */
  app.router('addExpenses', async(ctx, next) => {
    const {apartmentId, year, month, day, spendedon, howmuch} = event
    try{
      ctx.body = await Outlay.add({
        data: {
          apartmentId,
          year,
          month,
          day,
          spendedon, 
          howmuch
        }
      })
    }catch(e){ctx.body = e}
  })

  /* 获取公寓月度支出明细 */
  app.router('getMonthlyOutlay', async(ctx, next) => {
    const {apartmentId, month, year} = event
    try{
      ctx.body = await Outlay.where({
        apartmentId,
        year,
        month,
      })
      .get()
    }catch(e){ctx.body = e}
  })

  /* 获取公寓年度支出 */
  app.router('getYearlyOutlay', async(ctx, next) => {
    const {apartmentId, year} = event
    try{
      ctx.body = await Outlay.aggregate().match({
        apartmentId,
        year
      })
      .group({
        _id: '$month',
        total: $.sum('$howmuch')
      })
      .end()
    }catch(e){ctx.body = e}
  })

  /* 
  * 租户登录
  */
  app.router('checkin', async(ctx, next) => {
    try{
      let data = event.data
      data._openid = _openid
      ctx.body = await Lessees.add({
        data
      })
    }catch(e){ ctx.body = e }
  })
  // 租户获取房间信息
  app.router('getMyroom', async(ctx, next) => {
    try{
      ctx.body = await Lessees.aggregate().match({_openid})
      .lookup({
        from: 'Users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'lessee'
      })
      .lookup({
        from: 'ResiPermits',
        localField: '_id',
        foreignField: 'roomId',
        as: 'permits'
      })
      .end()
    }catch(e){ ctx.body = e }
  })

  // app.router('getMyApartments', async(ctx, next) => {
  //   try{
  //     ctx.body = await Apartments.where({
  //       _openid
  //     })
  //     .get()
  //   }catch(e){ ctx.body = e }
  // })

  /**
   * 房东新住审核
  */

  /* 房东：获取待审核入住的房间 */
  app.router('getUnvalidRooms', async(ctx, next) => {
    try{
      ctx.body = await Lessees.aggregate()
      .match({
        apartmentId: event.apartmentId,
        valid: false
      })
      .lookup({
        from: 'Users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'lessee'
      })
      .end()
    }catch(e){ctx.body = e}
  })

  /* 操作：确认入住 */
  app.router('approve', async(ctx, next) => {
    try{
      ctx.body = await Lessees.doc(event.roomId)
      .update({
        data: {
          valid: true
        }
      })
    }catch(e){ctx.body = e}
  })

  /**
   * 房东退房管理
  */
  app.router('getLeftRooms', async(ctx, next) => {
    try{
      ctx.body = await Lessees.aggregate()
      .match({
        apartmentId: event.apartmentId,
        isStaying: false
      })
      .lookup({
        from: 'Users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'lessee'
      })
      .end()
    }catch(e){ctx.body = e}
  })
  /* 更新押金减扣金额 */
  app.router('updateDepositDocked', async(ctx, next) => {
    try {
      ctx.body = await Lessees.doc(event.id).update({
        data: {
          depositDocked: event.value
        }
      })
    }catch(e){ ctx.body = e}
  })
  /* 更新checkoutTodos */
  app.router('updateTodos', async(ctx, next) => {
    try{
      ctx.body = await Lessees.doc(event.id).update({
        data: {
          checkoutTodos: event.todos
        }
      })
    }catch(e){ ctx.body = e}
  })

  /**
   * 房间完全退房
  */
  app.router('completelyCheckout', async(ctx, next) => {
    const list = event.list
    try{
      const res = await Deadrooms.add({
        data: {
          ...list
        }
      })
      console.log(res, 'res')
      if(res._id){ 
        const res = await Lessees.doc(data._id).remove()
        // console.log(res, 'res2')
        if(res.stats.removed === 1){
          ctx.body = {
            code: 200,
            msg: 'checkout success'
          }
        }
      }
    } catch(e){ ctx.body = e}
  })

  /* 
  * 房东房间管理
  */
  app.router('myLessees', async(ctx, next) => {
    try{
      ctx.body = await Lessees.aggregate()
      .match({
        apartmentId: event.id,
        isStaying: true,
        valid: true
      })
      .sort({roomNo: 1})
      .end()
    }catch(e){ ctx.body = e }
  })
  // 房东获取房间信息
  app.router('getRoomById', async(ctx, next) => {
    try{
      ctx.body = await Lessees.aggregate().match({
        _id: event.id
      })
      .lookup({
        from: 'Users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'lessee'
      })
      .lookup({
        from: 'ResiPermits',
        localField: '_id',
        foreignField: 'roomId',
        as: 'permits'
      })
      .sort({roomNo: 1})
      .end()
    }catch(e){ ctx.body = e }
  })

  /* 房东更新房间信息，比如：更新isoOverDued */
  app.router('updateRooms', async(ctx, next) => {
    try{
      ctx.body = await Lessees.doc(event.id).update({
        data: event.data
      })
    }catch(e){ ctx.body = e }
  })


  /* 
  * 支付相关
  * 设置支付记录
  */
  app.router('paying', async(ctx, next) => {
    let {body, totalFee, apartmentId} = event;
    let ip = wxContext.CLIENTIP;
    let nonceStr = Math.random().toString(36).substr(2, 13);
    let timeStamp = parseInt(Date.now() / 1000);
    let outTradeNo = 'MD'+ timeStamp + nonceStr;

    // 先获取subMchId
    const res = await Apartments.aggregate().match({
      _id: apartmentId
    }).project({
      subMchId: 1
    }).end()

    // console.log(res, 'res')
    if(!res.list[0].subMchId){
      ctx.body = {
        errMsg: '支付出错，请联系商家'
      }
      return
    }

    let subMchId = res.list[0].subMchId
    
    ctx.body = await cloud.cloudPay.unifiedOrder({
      body,
      totalFee,
      nonceStr,
      subMchId,
      outTradeNo,
      "spbillCreateIp" : ip,
      "envId": "rent-6gritc2gc2f51bb9",
      "functionName": "paying",
      "tradeType":"JSAPI"
    })
  })

  // 更新押金
  app.router('updateDeposit', async(ctx, next) => {
    try{
      ctx.body = await Lessees.doc(event._id).update({
        data: {
          ['depositInfo.havePaid']: event.havePaid,
          ['depositInfo.depositLateFees']:  event.depositLateFees,
          ['depositInfo.allPaid']:  event.allPaid
        }
      })
    }catch(e){ ctx.body = e }
  })

  /* 
  * 获取暂住证：根据公寓id
  */
  app.router('getPermitsByAptmid', async(ctx, next) => {
    try{
      ctx.body = await ResiPermits.where({
        apartmentId: event.aptmid
      })
      .get()
    }catch(e){ ctx.body = e }
  })

  return app.serve()
}