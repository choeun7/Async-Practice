module.exports = {

  f200Id: (req, res, log, opt) => (entity => {
    const reqBody = req.body
    const resBody = { id: entity._id }
    const url = req.url
    const method = req.method
    const options = opt || {}
    const logReqBody = options.logReqBody !== false
    const logResBody = options.logResBody !== false
    if (log) {
      if (logReqBody) {
        log(`request ${method} ${url}, body: `, reqBody)
      } else {
        log(`request ${method} ${url}, body: hidden`)
      }
      if (logResBody) {
        log(`response 200, body: `, resBody)
      } else {
        log(`response 200, body: hidden`)
      }
    }
    res.status(200).send(resBody)
  }),

  f200Entity: (req, res, log, opt) => (entity => {
    const reqBody = req.body
    const resBody = entity
    const url = req.url
    const method = req.method
    const options = opt || {}
    const logReqBody = options.logReqBody !== false
    const logResBody = options.logResBody !== false
    if (log) {
      if (logReqBody) {
        log(`request ${method} ${url}, body: `, reqBody)
      } else {
        log(`request ${method} ${url}, body: hidden`)
      }
      if (logResBody) {
        log(`response 200, body: `, resBody)
      } else {
        log(`response 200, body: hidden`)
      }
    }
    res.status(200).send(resBody)
  }),

  f204: (req, res, log, opt) => (() => {
    const reqBody = req.body
    const url = req.url
    const method = req.method
    const options = opt || {}
    const logReqBody = options.logReqBody !== false
    const logResBody = options.logResBody !== false
    if (log) {
      if (logReqBody) {
        log(`request ${method} ${url}, body: `, reqBody)
      } else {
        log(`request ${method} ${url}, body: hidden`)
      }
      log(`response 204, no content`)
    }
    res.status(204).send()
  }),

  f301: (req, res, log, opt) => (to => {
    const reqBody = req.body
    const resBody = to
    const url = req.url
    const method = req.method
    const options = opt || {}
    const logReqBody = options.logReqBody !== false
    const logResBody = options.logResBody !== false
    if (log) {
      if (logReqBody) {
        log(`request ${method} ${url}, body: `, reqBody)
      } else {
        log(`request ${method} ${url}, body: hidden`)
      }
      if (logResBody) {
        log(`response 301, to: `, resBody)
      } else {
        log(`response 301, to: hidden`)
      }
    }
    res.redirect(301, to)
  }),

  f400: (req, res, log, opt) => (err => {
    const reqBody = req.body
    const resBody = err || { error: 'bad request' }
    const url = req.url
    const method = req.method
    const options = opt || {}
    const logReqBody = options.logReqBody !== false
    const logResBody = options.logResBody !== false
    if (log) {
      if (logReqBody) {
        log(`request ${method} ${url}, body: `, reqBody)
      } else {
        log(`request ${method} ${url}, body: hidden`)
      }
      if (logResBody) {
        log(`response 400, error: `, resBody)
      } else {
        log(`response 400, error: hidden`)
      }
    }
    res.status(400).send(resBody)
  }),

  f403: (req, res, log, opt) => (err => {
    const reqBody = req.body
    const resBody = err || { error: 'forbidden' }
    const url = req.url
    const method = req.method
    const options = opt || {}
    const logReqBody = options.logReqBody !== false
    const logResBody = options.logResBody !== false
    if (log) {
      if (logReqBody) {
        log(`request ${method} ${url}, body: `, reqBody)
      } else {
        log(`request ${method} ${url}, body: hidden`)
      }
      if (logResBody) {
        log(`response 403, error: `, resBody)
      } else {
        log(`response 403, error: hidden`)
      }
    }
    res.status(403).send(resBody)
  }),

  f404: (req, res, log, opt) => (err => {
    const reqBody = req.body
    const resBody = err || { error: 'not found' }
    const url = req.url
    const method = req.method
    const options = opt || {}
    const logReqBody = options.logReqBody !== false
    const logResBody = options.logResBody !== false
    if (log) {
      if (logReqBody) {
        log(`request ${method} ${url}, body: `, reqBody)
      } else {
        log(`request ${method} ${url}, body: hidden`)
      }
      if (logResBody) {
        log(`response 404, error: `, resBody)
      } else {
        log(`response 404, error: hidden`)
      }
    }
    res.status(404).send(resBody)
  }),

  f500: (req, res, log, opt) => (err => {
    const reqBody = req.body
    const resBody = err || { error: 'internal server error' }
    const url = req.url
    const method = req.method
    const options = opt || {}
    const logReqBody = options.logReqBody !== false
    const logResBody = options.logResBody !== false
    if (log) {
      if (logReqBody) {
        log(`request ${method} ${url}, body: `, reqBody)
      } else {
        log(`request ${method} ${url}, body: hidden`)
      }
      if (logResBody) {
        log(`response 500, error: `, resBody)
      } else {
        log(`response 500, error: hidden`)
      }
    }
    res.status(500).send(resBody)
  })
}
