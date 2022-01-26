const {Store} = require('westore')
const MMainpage = require('../models/mainpage')

class MainpageStore extends Store {
  constructor(){
    super()

    this.data = {
      main: {
        functions: [
          {
            text: '水电维修',
            icon: 'repaire'
          },
          {
            text: '加煤气',
            icon: 'gas'
          },
          {
            text: '下水道疏通',
            icon: 'sewer'
          },
          {
            text: '换锁',
            icon: 'lock'
          },
          {
            text: '安充电桩',
            icon: 'ebick'
          },
          {
            text: '门禁系统',
            icon: 'acs'
          },
          {
            text: '监控安装',
            icon: 'cctv'
          },
          {
            text: '宽带咨询',
            icon: 'broadband'
          },
          {
            text: '公寓托管',
            icon: 'tuoguan'
          }
        ]
      },
    }
  }

  // async getMyApartments(){
  //   const res = await MMainpage.getMyApartments()
  //   this.data.main.myApartments = res.result.data
  //   this.update()
  // }
}

module.exports = new MainpageStore