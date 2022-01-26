const {Store} = require('westore')
const MUser = require("../models/user")

class UserStore extends Store {
  constructor(){
    super()
    this.data = {
      user: { 
        showTel: false, // page-container
        userInfo: {
          tel: '',
          name: '',
          avatarUrl: '../../src/images/avatar.png',
        },
      }
    }
  }

  /**
   * 获取用户头像
   * 触发路线：login --> user_store
   */ 
  updateAvatar(url){
    this.data.user.userInfo.avatarUrl = url
    this.update()
  }

  async getUser() {
    const res = await MUser.getUser()
    let list = res.result.list

    if(list.length!==0){
      this.data.user.userInfo = list[0]
    }

    this.update()
    return list
  }

  async getTel(cloudID){
    const res = await MUser.getTel(cloudID)
    let list = res.result.list
    if(list.length!==0){
      this.data.user.userInfo.tel = list[0].data.phoneNumber
      this.update()
      return true
    } 

    wx.showToast({
      title: '获取号码失败',
      icon: "none"
    })
  }

  async login(){
    const {tel, name, avatarUrl} = this.data.user.userInfo
    const res = await MUser.login(tel, name, avatarUrl)
    
    if(res.result._id){
      wx.showToast({
        title: '好啦！'
      })
      setTimeout( () => {
        wx.switchTab({
          url: '/pages/index/index',
        })
      }, 1500)
      return
    }

    wx.showModal({
      title: '好像出错了，把问题反馈给客服吧',
      content: '18108916914',
      success: res => {
        if(res.confirm){
          wx.makePhoneCall({
            phoneNumber: '18108916914',
          })
        }else{
          wx.switchTab({
            url: '/pages/index/index',
          })
        }
      }
    })
  }

  async updateUser(data){
    const res = await MUser.updateUser(this.data.user.userInfo._openid, data)
    console.log(res, 'res')
    if(res.stats.updated === 1){
      wx.showToast({title: '成功惹'})
    }
  }
}

module.exports = new UserStore