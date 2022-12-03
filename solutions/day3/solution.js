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
    const allKeys = {}
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
      acc.allKeys[key] = { key, priority }
      return acc
    }, {
      line,
      left,
      right,
      sharedContents,
      allKeys,
      sumOfPriorities: 0,
      midPoint,
      lineLength: line.length
    })
    return contents
  })
  return rucksacks
}

function parseGroupBadges (rucksacks) {
  return rucksacks.reduce((acc, rucksack, index, arr) => {
    const first = arr[index - 2]?.allKeys ?? {}
    const second = arr[index - 1]?.allKeys ?? {}
    const third = arr[index]?.allKeys ?? {}
    if (index > 1 && index % 3 === 2 && first && second && third) {
      console.log({ index, first, second, third })
      const badge = Object.entries(first).filter(([key, value]) => {
        return second[key] && third[key]
      })[0][1]
      acc.push({ badge, first, second, third })
    }
    return acc
  }, [])
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
  const rucksacks = parseRucksacks(input)
  report('Rucksacks:', rucksacks)

  const groupBadges = parseGroupBadges(rucksacks)

  await write(fromHere('groupBadges.json'), JSON.stringify(groupBadges, null, 2))

  const solution = groupBadges.reduce((acc, group) => {
    return acc + group.badge.priority
  }, 0)

  report('Solution 2:', solution)
}

run()
