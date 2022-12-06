const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForFirstStar (input) {
  const buffer = input.split('')
  let uniqueChars = 0
  let processedChars = 0
  const lastFour = []
  while (uniqueChars < 4 && buffer.length > 0) {
    uniqueChars = 0
    if (lastFour.length >= 4) {
      lastFour.shift()
    }
    const char = buffer.shift()
    processedChars++
    lastFour.push(char)
    const set = new Set(lastFour)
    uniqueChars = set.size
  }

  const solution = processedChars
  report('Info:', { lastFour, uniqueChars, processedChars, buffer })
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const buffer = input.split('')
  let uniqueChars = 0
  let processedChars = 0
  const lastBlock = []
  while (uniqueChars < 14 && buffer.length > 0) {
    uniqueChars = 0
    if (lastBlock.length >= 14) {
      lastBlock.shift()
    }
    const char = buffer.shift()
    processedChars++
    lastBlock.push(char)
    const set = new Set(lastBlock)
    uniqueChars = set.size
  }

  const solution = processedChars
  report('Info:', { lastBlock, uniqueChars, processedChars, buffer })
  report('Solution 2:', solution)
}

run()
