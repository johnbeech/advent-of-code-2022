const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input, 'first-star')
  await solveForSecondStar(input, 'second-star')

  const largerInput = (await read(fromHere('test-larger.txt'), 'utf8')).trim()
  await solveForSecondStar(largerInput, 'larger-grid')
}

function parseInstructions (input) {
  const directions = {
    U: {
      x: 0,
      y: -1
    },
    R: {
      x: 1,
      y: 0
    },
    D: {
      x: 0,
      y: 1
    },
    L: {
      x: -1,
      y: 0
    }
  }

  return input.split('\n').map(line => {
    const [direction, distance] = line.split(' ')
    return {
      direction: directions[direction],
      distance: Number.parseInt(distance)
    }
  })
}

function calculateBoundary (xyCoords) {
  const boundary = xyCoords.reduce((boundary, item) => {
    if ((item + '').includes(',')) {
      item = item.split(',').map(n => Number.parseInt(n))
    }
    const x = item.x ?? item[0]
    const y = item.y ?? item[1]
    boundary.left = boundary.left !== undefined ? Math.min(boundary.left, x) : x
    boundary.right = boundary.right !== undefined ? Math.max(boundary.right, x) : x
    boundary.top = boundary.top !== undefined ? Math.min(boundary.top, y) : y
    boundary.bottom = boundary.bottom !== undefined ? Math.max(boundary.bottom, y) : y
    return boundary
  }, {})
  boundary.width = Math.abs(boundary.right - boundary.left) + 1
  boundary.height = Math.abs(boundary.top - boundary.bottom) + 1
  return boundary
}

function sparseGridToGrid (sparseGrid, symbolFn) {
  const boundary = calculateBoundary(Object.keys(sparseGrid))
  const grid = createEmptyGrid(boundary.width, boundary.height, '.')
  return Object.entries(sparseGrid).reduce((acc, item) => {
    const [key, value] = item
    const [x, y] = key.split(',').map(n => Number.parseInt(n))
    const xi = x - boundary.left
    const yi = y - boundary.top
    if (acc[yi] === undefined) {
      console.log({ key, x, y, xi, yi }, 'is out of bounds', acc.length, 'max height', { boundary })
    }
    if (!acc[yi][xi] === undefined) {
      console.log({ key, x, y, xi, yi }, 'is out of bounds', acc[yi].length, 'max width', { boundary })
    }
    acc[yi][xi] = symbolFn(value)
    return acc
  }, grid)
}

function gridToString (input, filter) {
  let result = ''
  input.forEach(row => {
    result += row.join('') + '\n'
  })
  return result
}

function createEmptyGrid (width, height, symbol = ' ') {
  const result = []
  while (result.length < height) {
    const row = []
    while (row.length < width) {
      row.push(symbol)
    }
    result.push(row)
  }
  return result
}

async function solveForFirstStar (input, outputSuffix) {
  const instructions = parseInstructions(input)

  const visitGrid = {
    '0,0': ['s', 'H', 'T']
  }
  const tail = {
    x: 0,
    y: 0,
    path: []
  }
  const head = {
    x: 0,
    y: 0,
    path: []
  }

  instructions.forEach(item => {
    let step = 0
    while (step < item.distance) {
      step++
      head.x += item.direction.x
      head.y += item.direction.y
      if (tail.x === head.x && tail.y === head.y) {
        // don't move
      } else {
        const tailVector = {
          dx: Math.sign(head.x - tail.x),
          dy: Math.sign(head.y - tail.y),
          sx: Math.abs(head.x - tail.x),
          sy: Math.abs(head.y - tail.y)
        }

        if (tailVector.sx > 1) {
          tail.x += (tailVector.sx - 1) * tailVector.dx
          tail.y += tailVector.dy
        }
        if (tailVector.sy > 1) {
          tail.x += tailVector.dx
          tail.y += (tailVector.sy - 1) * tailVector.dy
        }
      }

      const headKey = [head.x, head.y].join(',')
      const headVisits = visitGrid[headKey] ?? []
      headVisits.push('H')
      visitGrid[headKey] = headVisits
      head.path.push({ x: head.x, y: head.y })

      const tailKey = [tail.x, tail.y].join(',')
      const tailVisits = visitGrid[tailKey] ?? []
      tailVisits.push('T')
      visitGrid[tailKey] = tailVisits
      tail.path.push({ x: tail.x, y: tail.y })
    }
  })

  await write(fromHere(`visitGrid-${outputSuffix}.md`), [
    '## Visit Grid',
    '```',
    gridToString(sparseGridToGrid(visitGrid, (value) => value.find(n => n === 's') ?? value.find(n => n === 'T') ?? value.find(n => n === 'H'))),
    '```',
    '',
    '## Tail Path',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === 'T') ?? '.')),
    '```',
    '',
    '## Head Path',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === 'H') ?? '.')),
    '```'
  ].join('\n'))

  const solution = Object.values(visitGrid).reduce((acc, visit) => {
    const tailVisit = visit.find(s => s === 'T') ? 1 : 0
    return acc + tailVisit
  }, 0)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input, outputSuffix) {
  const instructions = parseInstructions(input)

  const visitGrid = {
    '0,0': ['s', 'H', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  }
  const head = {
    x: 0,
    y: 0,
    path: []
  }

  const tails = []
  let lastHead = head
  while (tails.length < 9) {
    const newTail = {
      symbol: tails.length + 1 + '',
      x: 0,
      y: 0,
      parent: lastHead,
      path: []
    }
    tails.push(newTail)
    lastHead = newTail
  }

  instructions.forEach(item => {
    let step = 0
    while (step < item.distance) {
      step++
      head.x += item.direction.x
      head.y += item.direction.y

      const headKey = [head.x, head.y].join(',')
      const headVisits = visitGrid[headKey] ?? []
      headVisits.push('H')
      visitGrid[headKey] = headVisits
      head.path.push({ x: head.x, y: head.y })

      tails.forEach(tail => {
        const head = tail.parent
        let tailVector
        do {
          tailVector = {
            dx: Math.sign(head.x - tail.x),
            dy: Math.sign(head.y - tail.y),
            sx: Math.abs(head.x - tail.x),
            sy: Math.abs(head.y - tail.y)
          }

          if (tail.x === head.x && tail.y === head.y) {
            // don't move
          } else {
            if (tailVector.sx > 1 && tailVector.sy > 1) {
              tail.x += 1 * tailVector.dx
              tail.y += 1 * tailVector.dy
            } else if (tailVector.sx > 1) {
              tail.x += 1 * tailVector.dx
              tail.y += tailVector.dy
            } else if (tailVector.sy > 1) {
              tail.x += tailVector.dx
              tail.y += 1 * tailVector.dy
            }

            const tailKey = [tail.x, tail.y].join(',')
            const tailVisits = visitGrid[tailKey] ?? []
            tailVisits.push(tail.symbol)
            visitGrid[tailKey] = tailVisits
            tail.path.push({ x: tail.x, y: tail.y })
          }
        } while (tailVector.sx > 1 || tailVector.sy > 1)
      })
    }
  })

  await write(fromHere(`visitGrid-${outputSuffix}.md`), [
    '## Visit Grid',
    gridToString(sparseGridToGrid(visitGrid,
      (value) => {
        return value.find(n => n === 's') ??
          value.find(n => n === '9') ??
          value.find(n => n === '8') ??
          value.find(n => n === '7') ??
          value.find(n => n === '6') ??
          value.find(n => n === '5') ??
          value.find(n => n === '4') ??
          value.find(n => n === '3') ??
          value.find(n => n === '2') ??
          value.find(n => n === '1') ??
          value.find(n => n === 'H')
      })),
    '',
    '## Tail Path 9',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === '9') ?? '.')),
    '```',
    '',
    '## Tail Path 8',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === '8') ?? '.')),
    '```',
    '',
    '## Tail Path 7',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === '7') ?? '.')),
    '```',
    '',
    '## Tail Path 6',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === '6') ?? '.')),
    '```',
    '',
    '## Tail Path 5',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === '5') ?? '.')),
    '```',
    '',
    '## Tail Path 4',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === '4') ?? '.')),
    '```',
    '',
    '## Tail Path 3',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === '3') ?? '.')),
    '```',
    '',
    '## Tail Path 2',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === '2') ?? '.')),
    '```',
    '',
    '## Tail Path 1',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === '1') ?? '.')),
    '```',
    '',
    '## Head Path',
    '```',
    gridToString(sparseGridToGrid(visitGrid, value => value.find(n => n === 'H') ?? '.')),
    '```'
  ].join('\n'))

  const solution = Object.values(visitGrid).reduce((acc, visit) => {
    const tailVisit = visit.find(s => s === '9') ? 1 : 0
    return acc + tailVisit
  }, 0)
  report('Solution 2:', solution)
}

run()
