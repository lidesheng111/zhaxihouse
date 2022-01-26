const Cloud = require('../src/util/cloudFunctions')

class Checkingout {
  /* 房东：获取退房房间 */
  static async getLeftRooms(apartmentId){
    const res = await Cloud.call({
      $url: 'getLeftRooms',
      apartmentId
    })

    return res
  }

  /* 更新押金扣减金额 */
  static async updateDepositDocked(id, value){
    const res = await Cloud.call({
      $url: 'updateDepositDocked',
      id,
      value
    })

    return res
  }

  static async updateTodos(id, todos){
    const res = await Cloud.call({
      $url: 'updateTodos',
      id,
      todos
    })
    console.log(res)
    return res
  }

  static async completelyCheckout(list){
    const res = await Cloud.call({
      $url: 'completelyCheckout',
      list
    })
    console.log(res)
    return res
  }
}

module.exports = Checkingout