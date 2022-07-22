class CustomError3 extends Error {
  constructor(message = '', itype = '', ...args) {
    super(message, ...args)
    this.iStatus = 'error'
    this.iType = itype || 'error'
    if (message) 
      this.message = message
  }  
}

export default CustomError3