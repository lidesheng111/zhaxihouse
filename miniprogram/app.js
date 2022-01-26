// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'rent-6gritc2gc2f51bb9',
        traceUser: true,
      });
    }

    this.globalData = {
      level: null,
      isLandlord: null, // 在user_store中作判断
      roomId: '',  // 在roomdetails_store中获取
      subMchId: "1605572377",

      gracedays: 0,  // 在landlord_store中获取
      lateprice: 0,  // 同上

      prices: [
        {name: '租金', key: 'rental', unit:'元/月', show: false},
        {name: '电费', key: 'ePrice', unit:'元/度', show: false},
        {name: '水费', key: 'wPrice',  unit:'元', show: false},
        {name: '卫生费', key: 'gPrice',  unit:'元/月', show: false},
        {name: '其他费用', key: 'oPrice',  unit:'元', show: false},
        {name: '房租逾期费', key: 'latePrice',  unit:'元/天', show: false},
        {name: '交租宽限期', key: 'graceDays',  unit:'天', show: false},
      ],
    }
  }
});
