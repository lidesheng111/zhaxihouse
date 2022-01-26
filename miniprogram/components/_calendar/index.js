import util from '../../src/util/util'

Component({
  // use: [],
  properties: {
    label: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: ''
    },
    value: {
      type: String,
      value: ''
    }
  },

  data: {
    show: false,
    minDate: '2021/12/02',
    today: ''
  },

 lifetimes: {
    attached: function(){
      let lastMonth = new Date().getMonth() - 1 // 月份减一
      let _30_days_ago = new Date().setMonth(lastMonth)
      let date = util.formatTime(new Date(_30_days_ago), 'day')

      let today = util.formatTime(new Date(), 'day')
      this.setData({
        minDate: date,
        today
      })
    }
  },

  methods: {
    click(){ this.setData({ show: true }) },
    confirmInDate(e){
      let date = util.formatTime(new Date(e.detail), 'day')
      this.triggerEvent('date', {date})
    },
  }
})
