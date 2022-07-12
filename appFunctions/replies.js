import { _getCallerFile } from "./helpers"

export function setSuccessReply(params = {}) {
  const { status = 'ok', message = '', ...rest } = params
  let reply ={
    status,
    message,
    ...rest
  }

  return reply
}

export function setCustomReply(params = {}) {
  const { status, message = '', ...rest } = params
  let reply = {
    status,
    message,
    ...rest
  }

  return reply
}

export function setErrorReply(params = {}) {
  const { status = 'error', message = '', ...rest } = params
  let reply = {
    status,    
    message,
     ...rest
  }
 
  return reply
}