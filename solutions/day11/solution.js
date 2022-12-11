const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

const observables = {
  Monkey: addMonkey,
  'Starting items': setStartingItems,
  Operation: setOperation,
  Test: setTest,
  'If true': setTrueOutcome,
  'If false': setFalseOutcome,
  '': () => {},
  default: () => {}
}

function addMonkey (monkeys, line) {
  const [, monkeyNumber] = line.match(/Monkey (\d+):/)
  const monkey = {
    monkeyNumber: Number.parseInt(monkeyNumber),
    startingItems: [],
    caughtItems: [],
    inspectionOperation: () => { console.log('No operation set') },
    test: () => { console.log('No test set') },
    ifTrueMonkey: 'not set',
    ifFalseMonkey: 'not set',
    inspectedItems: 0
  }
  monkeys.push(monkey)
}

function setStartingItems (monkeys, line) {
  const monkey = monkeys[monkeys.length - 1]
  const [, items] = line.match(/\s+Starting items: ([\d,\s]+)/)
  const startingItems = items.split(', ').map(n => Number.parseInt(n))
  monkey.startingItems.push(...startingItems)
  monkey.caughtItems = monkey.startingItems.map((worryLevel) => {
    return {
      worryLevel,
      ops: []
    }
  })
}

function opValueOf (old, v) {
  const registers = { old }
  return registers[v] ?? Number.parseInt(v)
}

const mathOps = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => Math.floor(a / b)
}
function opMath (va, vb, op) {
  const mathOp = mathOps[op]
  if (!mathOp) {
    console.error({ mathOp, op }, 'is not a function', Object.keys(mathOps))
  }
  return mathOp(va, vb)
}

function setOperation (monkeys, line) {
  const monkey = monkeys[monkeys.length - 1]
  const [, a, op, b] = line.match(/\s+Operation: new = (old|\d+) ([+\-*]) (old|\d+)/)
  console.log({ monkey: monkey.monkeyNumber, a, op, b })
  monkey.inspectionOperation = (worryLevel) => {
    const va = opValueOf(worryLevel, a)
    const vb = opValueOf(worryLevel, b)
    return opMath(va, vb, op)
  }
}

function setTest (monkeys, line) {
  const monkey = monkeys[monkeys.length - 1]
  const [, divBy] = line.match(/\s+Test: divisible by (\d+)/)
  monkey.test = (item) => {
    return item % divBy === 0
  }
}

function setTrueOutcome (monkeys, line) {
  const monkey = monkeys[monkeys.length - 1]
  const [, monkeyNum] = line.match(/\s+If true: throw to monkey (\d+)/)
  monkey.ifTrueMonkey = Number.parseInt(monkeyNum)
}

function setFalseOutcome (monkeys, line) {
  const monkey = monkeys[monkeys.length - 1]
  const [, monkeyNum] = line.match(/\s+If false: throw to monkey (\d+)/)
  monkey.ifFalseMonkey = Number.parseInt(monkeyNum)
}

function parseMonkeys (jungle) {
  const monkeys = []
  return jungle.split('\n').reduce((forest, food) => {
    const obs = Object.entries(observables)
    const [, action] = obs.find((item) => food.includes(item[0]))
    action(forest, food)
    return forest
  }, monkeys)
}

function monkeyReport (monkeys, round = 0) {
  const lines = [
    `## Round ${round}`
  ]
  const monkeyLines = monkeys.map(monkey => {
    return `- Monkey ${monkey.monkeyNumber}: inspections: ${monkey.inspectedItems}, items: ${monkey.caughtItems.join(', ')}`
  })
  lines.push(...monkeyLines)
  return lines.join('\n')
}

async function solveForFirstStar (input) {
  const monkeys = parseMonkeys(input)

  const reports = ['# Monkey Business']

  let round = 0
  reports.push(monkeyReport(monkeys, round))
  while (round < 20) {
    monkeys.forEach(monkey => {
      while (monkey.caughtItems.length > 0) {
        const inspectedItem = monkey.caughtItems.shift()
        monkey.inspectedItems++
        const newWorryLevel = monkey.inspectionOperation(inspectedItem.worryLevel)
        const postBordemLevel = Math.floor(newWorryLevel / 3)
        inspectedItem.worryLevel = postBordemLevel
        const testPass = monkey.test(postBordemLevel)
        const targetMonkeyId = testPass ? monkey.ifTrueMonkey : monkey.ifFalseMonkey
        const targetMonkey = monkeys[targetMonkeyId]
        // console.log({ monkey: monkey.monkeyNumber, itemWorryLevel, newWorryLevel, postBordemLevel, targetMonkeyId })
        targetMonkey.caughtItems.push(inspectedItem)
      }
    })
    reports.push(monkeyReport(monkeys, reports.length))
    round++
  }

  await write(fromHere('monkeys.md'), reports.join('\n\n'))

  const monkeySort = monkeys.sort((a, b) => {
    return a.inspectedItems < b.inspectedItems ? 1 : -1
  })
  const [first, second] = monkeySort
  const monkeyBusiness = first.inspectedItems * second.inspectedItems
  const solution = monkeyBusiness
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const monkeys = parseMonkeys(input)

  const reports = ['# Monkey Business']

  let round = 0
  reports.push(monkeyReport(monkeys, round))
  while (round < 10000) {
    monkeys.forEach(monkey => {
      while (monkey.caughtItems.length > 0) {
        const inspectedItem = monkey.caughtItems.shift()
        monkey.inspectedItems++
        const newWorryLevel = monkey.inspectionOperation(inspectedItem.worryLevel)
        inspectedItem.ops.push(monkey.inspectionOperation)
        inspectedItem.worryLevel = newWorryLevel
        const testPass = monkey.test(newWorryLevel)
        const targetMonkeyId = testPass ? monkey.ifTrueMonkey : monkey.ifFalseMonkey
        const targetMonkey = monkeys[targetMonkeyId]
        // console.log({ monkey: monkey.monkeyNumber, itemWorryLevel, newWorryLevel, postBordemLevel, targetMonkeyId })
        targetMonkey.caughtItems.push(inspectedItem)
      }
    })
    reports.push(monkeyReport(monkeys, reports.length))
    round++
  }

  await write(fromHere('monkeys-10000.md'), reports.join('\n\n'))

  const monkeySort = monkeys.sort((a, b) => {
    return a.inspectedItems < b.inspectedItems ? 1 : -1
  })
  const [first, second] = monkeySort
  const monkeyBusiness = first.inspectedItems * second.inspectedItems
  const solution = monkeyBusiness
  report('Solution 2:', solution)
}

run()
