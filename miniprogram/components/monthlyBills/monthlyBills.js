Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    bills: Array
  },

  data: {

  },

  methods: {
    gotoDetails(e){
      let index = e.currentTarget.id

      wx.navigateTo({ url: '/pages/billsdetails/billsdetails?index='+index })
    }
  }
})
