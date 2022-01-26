const Cloud = require("../src/util/cloudFunctions")

const db = wx.cloud.database()
const Users = db.collection('Users')

class User {

  static async getUser(){
    return await Cloud.call({
      $url: "getUser"
    })
  }

  static async getTel(cloudID){
    return await Cloud.call({
      $url: "getTel",
      cloudID
    })
  }

  static async login(tel, name, avatarUrl){
    return await Cloud.call({
      $url: "login",
      level: 5,
      tel, name, avatarUrl
    })
  }

  /**
   * 1.租户checkin 后需要更新users的level
  */
  static async updateUser(_openid, data){
    const res = await Users
    .where({
      _openid
    })
    .update(data)
    return res

    // return await Cloud.call({
    //   $url: 'updateUser',
    //   data
    // })
  }

  static async updateUserWithApartment(data){
    const res = await Cloud.call({
      $url: 'updateUserWithApartment',
      ...data
    })
    console.log(res, 'res')
    return res
  }
}

module.exports = User