const Cloud = require("../src/util/cloudFunctions")

class Checkin {
  static async checkin(data){
    const res = await Cloud.call({
      $url: 'checkin',
      data
    })
    console.log(res)
    
    return res
  }

  // 搜索公寓名
  static async search(name){
    return await Cloud.call({
      $url: 'getApartmentByName',
      name
    })
  }
}

module.exports = Checkin