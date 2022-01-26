import promisization from "./promisization"

class Cloud {
  static async call(data){
    return await promisization("callFunction", { 
      name: "tcb",
      data: data
    })
  }
}

module.exports = Cloud