const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function parseRucksacks (input) {
  const rucksacks = input.split('\n').map(line => {
    const sharedContents = {}
    const left = {}
    const right = {}
    const midPoint = line.length / 2
    const contents = line.split('').reduce((acc, key, index) => {
      const priority = key.toUpperCase() === key ? key.charCodeAt(0) - 64 + 26 : key.charCodeAt(0) - 96
      const side = index < midPoint ? left : right
      const record = side[key] ?? { key, priority, count: 0 }
      record.count++
      side[key] = record
      if (side === right && right[key].count === 1 && left[key]) {
        sharedContents[key] = { key, priority }
        acc.sumOfPriorities += priority
      }
      return acc
    }, {
      line,
      left,
      right,
      sharedContents,
      sumOfPriorities: 0,
      midPoint,
      lineLength: line.length
    })
    return contents
  })
  return rucksacks
}

async function solveForFirstStar (input) {
  const rucksacks = parseRucksacks(input)
  report('Rucksacks:', rucksacks)

  await write(fromHere('rucksacks.json'), JSON.stringify(rucksacks, null, 2))

  const solution = rucksacks.reduce((acc, rucksack) => {
    return acc + rucksack.sumOfPriorities
  }, 0)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
