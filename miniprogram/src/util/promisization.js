export default function promisization(type, calling) {
  return new Promise( (resolve, reject) => {
    calling.success = resolve
    calling.fail = err => reject(err)

    wx.cloud[type](calling)
  })
}