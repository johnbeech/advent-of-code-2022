const path = require('path')
const express = require('express')
const { position, find, write } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../package.json')).logName} / ${__filename.split(path.sep).pop().split('.js').shift()}]`, ...messages)

const app = express()
const packageData = require('../package.json')

async function generateIndexHTML () {
  const title = packageData.logName
  const solutions = await find(fromHere('/*'))
  const links = solutions
    .filter(n => n.indexOf('.js') === -1 && n.indexOf('.html') === -1)
    .map(solution => {
      const folder = solution.substr(fromHere('../').length)
      return `      <li><a href="/${folder}/viewer.html">${folder}</a></li>`
    })

  const html = `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <style> html, body { font-family: sans-serif; }</style>
  </head>
  <body>
    <h1>${title}</h1>
    <ul>
${links.join('\n')}
    </ul>
  </body>
</html>
  `

  report('Updated hard coded index:', fromHere('index.html'))
  await write(fromHere('index.html'), html, 'utf8')

  return html
}

app.use('/solutions', express.static(fromHere('')))

app.get('/', async (req, res) => {
  const html = await generateIndexHTML()
  res.send(html)
})

const port = 8080
app.listen(port, () => report(`Listening on http://localhost:${port}/`))
