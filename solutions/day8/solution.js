const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function rotate (matrix) {
  const n = matrix.length
  const x = Math.floor(n / 2)
  const y = n - 1
  for (let i = 0; i < x; i++) {
    for (let j = i; j < y - i; j++) {
      const k = matrix[i][j]
      matrix[i][j] = matrix[y - j][i]
      matrix[y - j][i] = matrix[y - i][y - j]
      matrix[y - i][y - j] = matrix[j][y - i]
      matrix[j][y - i] = k
    }
  }
  return matrix
}

function parseGrid (input) {
  return input.split('\n').map(line => {
    return line.split('')
  })
}

function gridToString (input) {
  let result = ''
  input.forEach(row => {
    result += row.join('') + '\n'
  })
  return result
}

function clone (data) {
  return JSON.parse(JSON.stringify(data))
}

function createEmptyGrid (size, symbol = ' ') {
  const result = []
  while (result.length < size) {
    const row = []
    while (row.length < size) {
      row.push(symbol)
    }
    result.push(row)
  }
  return result
}

async function solveForFirstStar (input) {
  const treeGrid = parseGrid(input)

  const rotations = [treeGrid]
  while (rotations.length < 4) {
    const lastRotation = clone(rotations[rotations.length - 1])
    const rotation = rotate(lastRotation)
    rotations.push(rotation)
  }

  const directions = ['>', '^', '<', 'v']

  const visibleTrees = {}
  rotations.forEach((rotation, rotIndex) => {
    rotation.forEach(row => {
      let maxTreeHeight = 0
      row.forEach((treeHeight, index) => {
        const symbol = (treeHeight > maxTreeHeight || index === 0) ? treeHeight : directions[rotIndex]
        maxTreeHeight = Math.max(treeHeight, maxTreeHeight)
        row[index] = symbol
      })
    })
    let unrotate = (4 - rotIndex) % 4
    while (unrotate > 0) {
      rotate(rotation)
      unrotate--
    }

    rotation.forEach((row, rowIndex) => {
      row.forEach((treeHeight, colIndex) => {
        if (treeHeight !== directions[rotIndex]) {
          const key = [rowIndex, colIndex].join(',')
          visibleTrees[key] = Number.parseInt(treeHeight)
        }
      })
    })
  })
  await Promise.all(rotations.map((rotation, index) => {
    return write(fromHere(`rot${index}.txt`), gridToString(rotation))
  }))

  const visibleGrid = Object.entries(visibleTrees).reduce((acc, item) => {
    const [key, value] = item
    const [rowIndex, colIndex] = key.split(',')
    const row = acc[rowIndex]
    row[colIndex] = ('#' + value).charAt(0)
    acc[rowIndex] = row
    return acc
  }, createEmptyGrid(treeGrid.length, '.'))

  await write(fromHere('visibleTrees.txt'), gridToString(visibleGrid))

  const numberOfVisibleTrees = Object.entries(visibleTrees).length
  const solution = numberOfVisibleTrees
  report('Input:', input)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
