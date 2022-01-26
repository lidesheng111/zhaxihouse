const app = getApp()
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    useWaterMeter:{
      type: Boolean,
      value: false
    },
    eReadings: Array,
    wReadings: Array
  },

  data: {
    eReading: 0,
    wReading: 0,
    level: app.globalData.level
  },

  methods: {
    inputE(e){ console.log(e); this.setData({ eReading: (e.detail.value)*1 })},
    submitE(){ this.triggerEvent('fetch', {reading: this.data.eReading, type: 'eReadings'}) },

    inputW(e){ this.setData({ wReading: (e.detail.value)*1 })},
    submitW(){ this.triggerEvent('fetch', {reading: this.data.wReading, type: 'wReadings'}) },
  }
})
