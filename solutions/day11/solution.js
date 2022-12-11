const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const testInput = (await read(fromHere('test.txt'), 'utf8')).trim()
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(testInput, '-test')
  await solveForFirstStar(input, '')

  await solveForSecondStar(testInput, '-10000-test')
  await solveForSecondStar(input, '-10000')
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
  const startingItems = items.split(', ').map(n => BigInt(n))
  monkey.startingItems.push(...startingItems)
  monkey.caughtItems = monkey.startingItems.map((worryLevel) => {
    return {
      startingWorryLevel: worryLevel,
      worryLevel,
      ops: []
    }
  })
}

function opValueOf (old, v) {
  const registers = { old }
  return registers[v] ?? BigInt(v)
}

const mathOps = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b
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
  const divByNum = BigInt(divBy)
  monkey.test = (item) => {
    const mod = item % divByNum
    return mod === 0n || mod === 0
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
    return `- Monkey ${monkey.monkeyNumber}: inspections: ${monkey.inspectedItems}, items (${monkey.caughtItems.length}): ${monkey.caughtItems.map(n => n.worryLevel).join(', ')}`
  })
  lines.push(...monkeyLines)
  return lines.join('\n')
}

async function solveForFirstStar (input, reportSuffix = '') {
  const monkeys = parseMonkeys(input)

  const reports = ['# Monkey Business']

  let round = 0
  reports.push(monkeyReport(monkeys, 'Start'))
  while (round < 20) {
    monkeys.forEach(monkey => {
      console.log('Starting Round:', round, 'Turn:', monkey.monkeyNumber)
      while (monkey.caughtItems.length > 0) {
        const inspectedItem = monkey.caughtItems.shift()
        monkey.inspectedItems++
        const itemWorryLevel = inspectedItem.worryLevel
        const inspectedWorryLevel = monkey.inspectionOperation(itemWorryLevel)
        const postBordemLevel = Math.floor(Number(inspectedWorryLevel) / 3)
        inspectedItem.worryLevel = BigInt(postBordemLevel)
        const testPass = monkey.test(inspectedItem.worryLevel)
        const targetMonkeyId = testPass ? monkey.ifTrueMonkey : monkey.ifFalseMonkey
        const targetMonkey = monkeys[targetMonkeyId]
        // console.log({ monkey: monkey.monkeyNumber, itemWorryLevel, inspectedWorryLevel, postBordemLevel, targetMonkeyId })
        targetMonkey.caughtItems.push(inspectedItem)
      }
    })
    round++
    reports.push(monkeyReport(monkeys, round))
  }

  const monkeySort = monkeys.sort((a, b) => {
    return a.inspectedItems < b.inspectedItems ? 1 : -1
  })
  const [first, second] = monkeySort
  const monkeyBusiness = first.inspectedItems * second.inspectedItems

  reports.push(`Total monkey business: ${monkeyBusiness}`)

  const solution = monkeyBusiness
  report('Solution 1:', solution)

  await write(fromHere(`monkeys${reportSuffix}.md`), reports.join('\n\n'))
}

async function solveForSecondStar (input, reportSuffix = '') {
  const monkeys = parseMonkeys(input)

  const reports = ['# Monkey Business']

  let round = 0
  reports.push(monkeyReport(monkeys, 'Start'))
  while (round < 10000) {
    monkeys.forEach(monkey => {
      console.log('Starting Round:', round, 'Turn:', monkey.monkeyNumber)
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
    round++
    if (round < 10) {
      reports.push(monkeyReport(monkeys, round))
    } else if (round === 10000) {
      reports.push(monkeyReport(monkeys, round))
    } else {
      reports.push(`... Round ${round} ...`)
    }
  }

  const monkeySort = monkeys.sort((a, b) => {
    return a.inspectedItems < b.inspectedItems ? 1 : -1
  })
  const [first, second] = monkeySort
  const monkeyBusiness = first.inspectedItems * second.inspectedItems

  reports.push(`Total monkey business: ${monkeyBusiness}`)

  const solution = monkeyBusiness
  report('Solution 2:', solution)

  await write(fromHere(`monkeys${reportSuffix}.md`), reports.join('\n\n'))
}

run()
