import express from 'express'
import { router } from './src/routes/Routes.js';
import { spawn } from 'node:child_process'
import fs from 'fs'
import cors from 'cors'

const app = express()
const port = process.env.PORT

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200
}


if (process.argv[2] === "fetch-enabled") {
  const out = fs.openSync('./out.log', 'a')
  const err = fs.openSync('./out.log', 'a')

  const fetch_process = spawn(process.argv[0], ['events-fetch.js'], {
    stdio: [ 'ignore', out, err ]
  })
  console.log("-------------Fetch script enabled-------------")
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(router);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
