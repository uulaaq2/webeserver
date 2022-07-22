class CustomError extends Error {
  constructor(params = {}) {

    super(params.message)

    this.iStatus = 'error'
    this.iType = params.iType || 'error'

    if (params.message) {
      this.message = params.message
    }
    
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
          this[key] = params[key]
      }
    }

  }  
}

export default CustomError