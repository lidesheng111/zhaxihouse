const Cloud = require('../src/util/cloudFunctions')

const db = wx.cloud.database()
const _ = db.command
const Lessees = db.collection('Lessees')

class Roomdetails {
  static async updateRoommates(id, data){
    try{
      const res = await Lessees.doc(id).update({data})

      return res
    } catch(e){
      console.log(e)
    }
  }

  static async checkout(id, name){
    try{
      const res = await Lessees.doc(id).update({
        data: {
          roomMates: _.pull({
            name: _.eq(name)
          }),
        }
      })

      return res
    } catch(e){
      console.log(e)
    }
  }

  static async getRoomById(id){
    const res = await Cloud.call({
      $url: 'getRoomById',
      id
    })

    // wx.setStorageSync('details', res.result.list[0])
    return res
  }

  /* 房东操作：线下全额支付押金 */
  static async depositPaidOffline(id, lateFee, havePaid){
    const res = await Lessees.doc(id).update({
      data: {
        ['depositInfo.allPaid']: true,
        ['depositInfo.depositLateFees']: lateFee,
        ['depositInfo.havePaid']: havePaid
      }
    })
    console.log(res, 'update deposite')
    return res
  }

  static async changeRoom(id, newRoom, newFloor){
    const res = await Lessees.doc(id).update({
      data: {
        roomNo: newRoom,
        floor: newFloor
      }
    })
    console.log(res, 'change room')
    return res
  }

  static async checkoutAll(id){
    const res = await Lessees.doc(id).update({
      data: {
        isStaying: false,
        checkoutTodos:[
          {name: '算清账务', checked: false},
          {name: '查看房间', checked: false, },
          {name: '收回钥匙', checked: false, },
          // {needDocking: false, },
          // {dockingAmount: 0, },
          {name: '退还押金', checked: false, },
          {name: '登记本退房', checked: false, },
          {name: '公安网退房', checked: false, },
          {name: '暂住证注销', checked: false, }
        ],
        depositDocked: 0
      }
    })
    console.log(res, 'check')
    return res
  }
}

module.exports = Roomdetails