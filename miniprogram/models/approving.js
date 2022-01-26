const Cloud = require('../src/util/cloudFunctions')

class Approving {
  static async getUnvalidRooms(id){
    const res = await Cloud.call({
      $url: 'getUnvalidRooms',
      apartmentId: id
    })
    console.log(res)
    return res
  }

  static async approve(roomId){
    const res = await Cloud.call({
      $url: 'approve',
      roomId
    })
    console.log(res)
    return res
  }
}

module.exports = Approving