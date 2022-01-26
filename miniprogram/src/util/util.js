

const formatTime = (date, form='')=> {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  if(form==='day'){
    return `${[year, month, day].map(formatNumber).join('/')}`
  }

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const diffDays = (mydate) => {
  let today = new Date()
  let date = new Date(mydate)
  let _diffDays = (date - today)/(24*60*60*1000)

  if(_diffDays<0){
    _diffDays = Math.ceil(_diffDays)
  } else {
    _diffDays = Math.floor(_diffDays)
  }

  return _diffDays
}

const toastWrong = (title) => {
  wx.showToast({
    title,
    icon: 'none',
    duration: 3000
  })
}

const calculateLateFees = (from, LATE_PRICE, GRACE_DAYS) => {
  let _diffDays = Math.abs(diffDays(from)) // diffDays有可能是负数

  // 逾期费 =（逾期天数 - 宽限期）* 每日逾期费
  let fees = (_diffDays-GRACE_DAYS)*LATE_PRICE
  return fees
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime,
  diffDays,
  toastWrong,
  calculateLateFees
}