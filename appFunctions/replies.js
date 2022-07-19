import config from '../config'

export function setSuccessReply(params = {}) {
  const { status = 'ok', message = '', debugLine = '', ...rest } = params
  let reply ={
    status,
    message,
    debug: {
      debugLine
    },
    ...rest
  }

  return reply
}

export function setCustomReply(params = {}) {
  const { status, message = '', debugLine = '', errorObj = {}, ...rest } = params
  let reply = {
    status,
    message: message || errorObj.message,
    debug: {
      debugLine
    },
    ...rest
  }

  Object.getOwnPropertyNames(errorObj).forEach(function(name) {
    reply.debug[name] = errorObj[name]
  })

  return reply
}

export function setErrorReply(params = {}) {
  const { status = 'error', message = '', debugLine = '', errorObj = {}, ...rest } = params
  let reply = {
    status,    
    message: message || errorObj.message,
    debug: {
      debugLine
    },
    ...rest
  }
 
  Object.getOwnPropertyNames(errorObj).forEach(function(name) {
    reply.debug[name] = errorObj[name]
  })
  
  return reply
}