const Cloud = require('../src/util/cloudFunctions')

class Roomlist {
  async getRoomlist(id){
    const res = await Cloud.call({
      $url: 'myLessees',
      id
    })

    return this._checkOverDue(res.result.list)
  }

  _checkOverDue(list){
    list.map(async item => {
      /* 检查房间是否存在欠费 */
      let res = item.monthlyBills.some( item2 => {
        // 检查房间月度账单是否存在：allPaid === false
        return item2.allPaid === false
      })

      // 根据上面的结果，更新本地isOverdued
      item.isOverdued = res

      // 更新云端isOverdued
      await Cloud.call({
        $url: 'updateRooms',
        id: item._id,
        data: {
          isOverdued: res
        }
      })
    })

    return list
  }
}

module.exports = new Roomlist()