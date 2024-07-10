# express-status-codes

Implementation of most common response status codes (200, 204, 400, 403, 404, 500)

## Usage

```
const express = require('express')
const log = require('tlogger')('Index')
const codes = require('express-status-codes')

const app = express()

app.get('/200', (req, res) => {
    const r200 = codes.f200Entity(req, res, log)
    
    return r200({ some: 'entity' })
})
```
