#!/usr/bin/env node

const util = require('util');

// Front is where the little white spot is, on the pommel
// (on my copy of it, anyway).
//
// Pieces 0..3 are on front face, clockwise. 0 is top-left piece.
// Pieces 4..7 are seen from left face, clockwise.
// Piece 8 is the sword.
//
// Axis X is going right, axis Y is going up, axis Z is going back. Global
// [0,0,0] is in the bottom-left corner of the cube seen from the front. Piece
// fills are described in local coordinates, [0,0,0] is the bottom-left corner of each piece
// as seen from either the front of the left.
const PIECES_FILL = [
  [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 2, 0], [1, 2, 0],
    [0, 0, 1],
    [0, 0, 2],
    [0, 0, 3],
    [0, 0, 4],
    [0, 0, 5],
    [0, 0, 6], [1, 0, 6], [0, 1, 6], [1, 1, 6], [0, 2, 6], [1, 2, 6],
  ],
  [
    [0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0], [2, 1, 0],
    [2, 0, 1],
    [2, 0, 2],
    [2, 0, 3],
    [2, 0, 4],
    [2, 0, 5],
    [0, 0, 6], [0, 1, 6], [1, 0, 6], [1, 1, 6], [2, 0, 6], [2, 1, 6],
  ],
  [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 2, 0], [1, 2, 0],
    [0, 1, 1], [0, 2, 1],
    [0, 1, 2],
    [0, 1, 3], [0, 2, 3],
    [0, 2, 4],
    [0, 2, 5],
    [0, 0, 6], [1, 0, 6], [0, 1, 6], [1, 1, 6], [0, 2, 6], [1, 2, 6],
  ],
  [
    [0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0], [2, 1, 0],
    [0, 1, 1],
    [0, 1, 2], [1, 1, 2], [2, 1, 2],
    [2, 1, 3],
    [2, 1, 4],
    [1, 1, 5], [2, 1, 5],
    [0, 0, 6], [0, 1, 6], [1, 0, 6], [1, 1, 6], [2, 0, 6], [2, 1, 6],
  ],
  [
    [0, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 1], [0, 0, 2], [0, 1, 2],
    [1, 0, 0], [1, 0, 2], [1, 1, 2],
    [2, 0, 2], [2, 1, 2],
    [3, 1, 2],
    [4, 1, 2],
    [5, 1, 2],
    [6, 0, 0], [6, 1, 0], [6, 0, 1], [6, 1, 1], [6, 0, 2], [6, 1, 2],
  ],
  [
    [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [0, 2, 0], [0, 2, 1],
    [1, 2, 1],
    [2, 2, 1], [2, 1, 1],
    [3, 2, 1], [3, 2, 0],
    [4, 2, 0],
    [5, 2, 0],
    [6, 0, 0], [6, 0, 1], [6, 1, 0], [6, 1, 1], [6, 2, 0], [6, 2, 1],
  ],
  [
    [0, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 1], [0, 0, 2], [0, 1, 2],
    [1, 0, 0],
    [2, 0, 0],
    [3, 0, 0], [3, 0, 1], // PAS SÛR DU TOUT!!
    [4, 0, 0], [4, 0, 1], // PAS 100% SÛR!!
    [5, 0, 0], [5, 0, 1], // PAS 100% SÛR!!
    [6, 0, 0], [6, 1, 0], [6, 0, 1], [6, 1, 1], [6, 0, 2], [6, 1, 2],
  ],
  [
    [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [0, 2, 0], [0, 2, 1],
    [1, 0, 1],
    [2, 0, 1],
    [3, 0, 1],
    [4, 0, 1], [4, 0, 0],
    [5, 0, 1], [5, 0, 0],
    [6, 0, 0], [6, 0, 1], [6, 1, 0], [6, 1, 1], [6, 2, 0], [6, 2, 1],
  ],
  [
    [0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1], [1, 0, 1], [2, 0, 1], [0, 0, 2], [1, 0, 2], [2, 0, 2],
    [0, 1, 1],
    [0, 2, 1],
    [0, 3, 1], [1, 3, 1],
    [1, 4, 1],
    [1, 5, 1],
    [0, 6, 0], [1, 6, 0], [2, 6, 0], [0, 6, 1], [1, 6, 1], [2, 6, 1], [0, 6, 2], [1, 6, 2], [2, 6, 2],
  ],
];

const PIECE_COUNT = PIECES_FILL.length;

const SORTED_STATE = [
  [1, 3, 0],
  [3, 4, 0],
  [4, 1, 0],
  [1, 1, 0],

  [0, 4, 3],
  [0, 3, 1],
  [0, 1, 1],
  [0, 1, 4],

  [2, 0, 2],
];

function main() {
  const nodes = findPath(SORTED_STATE);
  // console.log(found ? 'FOUND\n' : 'NOT found\n');
  // let i = 1;
  // for (const p of path) {
  //   console.log(`${i}. ${getMoveDesc(p)}`);
  //   ++i;
  // }
  const terminalNodeKeys = new Set([...nodes].filter(([key, node]) => node.terminal).map(([key]) => key)); 

  const interestingNodeKeys = new Set();
  for (let nodeKey of terminalNodeKeys) {
    interestingNodeKeys.add(nodeKey);
    let node;
    while ((node = nodes.get(nodeKey)).predecessor != null) {
      interestingNodeKeys.add(node.predecessor.key);
      nodeKey = node.predecessor.key;
    }
  }
  const ids = new Map([...interestingNodeKeys].map((key, idx) => [key, idx]));

  console.log('digraph excaliburr {');
  console.log('rankdir="LR";');
  console.log('');

  for (const nodeKey of interestingNodeKeys) {
    const node = nodes.get(nodeKey);
    if (node.predecessor != null) {
      const predID = ids.get(node.predecessor.key);
      const tID = ids.get(nodeKey);
      const label = getMoveDesc(node.predecessor);

      console.log(`${predID} -> ${tID} [ label = ${JSON.stringify(label)} ];`);
    }
  }
  console.log('}');
}

function getMoveDesc(p) {
  return `${getActionName(p)}: ${p.pieces.map(piece => getPieceName(piece)).join(', ')}`;
}

function getPieceName(piece) {
  if (piece === 8) return 'sword';
  return `${getFaceName(piece)}${getBlockName(piece)}`;
}

function getActionName(p) {
  if (p.axis === 0) {
    return p.move > 0 ? 'right' : 'left';
  }
  if (p.axis === 1) {
    return p.move > 0 ? 'up' : 'down';
  }
  if (p.axis === 2) {
    return p.move > 0 ? 'back' : 'front';
  }
  throw new Error('unknown');
}

function getBlockName(piece) {
  switch (piece % 4) {
    case 0: return 'tl';
    case 1: return 'tr';
    case 2: return 'br';
    case 3: return 'bl';
  }
  throw new Error('unknown');
}

function getFaceName(piece) {
  if (piece < 4) return 'F';
  if (piece < 8) return 'L';
  throw new Error('unknown');
}

function findPath(initState) {
  let ntr = hasIntersection(initState);
  if (ntr) {
    throw new Error('invalid initial state');
  }

  // ntr = hasIntersection(targetState);
  // if (ntr) {
  //   throw new Error('invalid target state');
  // }

  const nodes = new Map();
  const invalidKeys = new Set();

  let initKey = getStateKey(initState);
  // const targetKey = getStateKey(targetState);

  nodes.set(initKey, {
    state: initState,
    distance: 0,
    predecessor: undefined,
    terminal: true,
  });
  const queue = [initKey];

  let max = 1000;
  let newState = [...initState];

  function processMoves(key, node, pieces) {
    const {state, distance} = node;

    for (let axis = 0; axis < 3; ++axis) {
      for (let move = -1; move < 2; move += 2) {
        for (let pieceIdx = 0; pieceIdx < state.length; ++pieceIdx) {
          newState[pieceIdx] = state[pieceIdx];
        }

        for (const i of pieces) {
          if (state[i][axis] > 7 || state[i][axis] < -7) {
            continue;
          }
          newState[i] = [...state[i]];
          newState[i][axis] += move;
        }

        const newKey = getStateKey(newState);
        if (invalidKeys.has(newKey) ) {
          // Never mind.
          continue;
        }

        if (hasIntersection(newState)) {
          // Remember so we don't spend time on it later again.
          invalidKeys.add(newKey);
          continue;
        }

        node.terminal = false;

        // We have found a new valid position
        const existingNode = nodes.get(newKey);

        // If the existing known path to that position
        // is shorter or same than the one just found, don't bother.
        if (existingNode != null && existingNode.distance <= distance + 1) {
          continue;
        }
        nodes.set(newKey, {
          state: [...newState],
          distance: distance + 1,
          predecessor: {key, pieces, axis, move},
          terminal: existingNode != null ? existingNode.terminal : true,
        });
        queue.push(newKey);
      }
    }
  }

  while (queue.length > 0 && max > 0) {
    const key = queue.shift();
    const node = nodes.get(key);
    const {state, distance} = node;

    if (state[8][1] >= 1) {
      return {path: getPath(nodes, key), found: true};
    }

    for (let i = 0; i < PIECE_COUNT; ++i) {
      processMoves(key, node, [i]);
      for (let j = i + 1; j < PIECE_COUNT; ++j) {
        processMoves(key, node, [i, j]);
        for (let k = j + 1; k < PIECE_COUNT; ++k) {
          processMoves(key, node, [i, j, k]);
          for (let l = k + 1; l < PIECE_COUNT; ++l) {
            processMoves(key, node, [i, j, k, l]);
          }
        }
      }
    }
    --max;
  }

  if (max > 0) {
    console.error(`${max} tries left`);
  }

  return nodes;
  // const sd = [...nodes].map(([key, node]) => [key, node.distance]);
  // sd.sort((a, b) => b[1] - a[1]);

  // const paths = [];
  // for (let solutionIdx = 0; solutionIdx < sd.length && solutionIdx < 10; ++solutionIdx)
  // {
  //    {path: getPath(nodes, sd[solutionIdx][0]), found: false};
  // }
}

function getPath(nodes, targetKey) {
  const path = [];
  let p = nodes.get(targetKey);
  while (p.predecessor != null) {
    path.push(p.predecessor);
    p = nodes.get(p.predecessor.key);
  }
  return path.reverse();
}

function hasIntersection(state) {
  const world = new Set();
  addCube(world);
  for (let i = 0; i < PIECE_COUNT; ++i) {
    const piecePos = state[i];
    const fills = PIECES_FILL[i];
    for (let j = 0; j < fills.length; ++j) {
      const localPos = fills[j];
      const pos = [
        piecePos[0] + localPos[0],
        piecePos[1] + localPos[1],
        piecePos[2] + localPos[2],
      ];
      const key = getPosKey(pos);
      if (world.has(key)) {
        return true;
      }
      world.add(key);
    }
  }
  return false;
}

function addCube(world) {
  for (let x = 0; x <= 6; ++x) {
    world.add(getPosKey([x, 0, 0]));
    world.add(getPosKey([x, 6, 0]));
    world.add(getPosKey([x, 0, 6]));
    world.add(getPosKey([x, 6, 6]));
  }
  for (let y = 1; y <= 5; ++y) {
    world.add(getPosKey([0, y, 0]));
    world.add(getPosKey([6, y, 0]));
    world.add(getPosKey([0, y, 6]));
    world.add(getPosKey([6, y, 6]));
  }
  for (let z = 1; z <= 5; ++z) {
    world.add(getPosKey([0, 0, z]));
    world.add(getPosKey([6, 0, z]));
    world.add(getPosKey([0, 6, z]));
    world.add(getPosKey([6, 6, z]));
  }

  for (let x = 1; x <= 5; ++x) {
    world.add(getPosKey([x, 0, 1]));
    world.add(getPosKey([x, 6, 1]));
    world.add(getPosKey([x, 0, 5]));
    world.add(getPosKey([x, 6, 5]));
  }

  for (let z = 2; z <= 4; ++z) {
    world.add(getPosKey([1, 0, z]));
    world.add(getPosKey([1, 6, z]));
    world.add(getPosKey([5, 0, z]));
    world.add(getPosKey([5, 6, z]));
  }
}

function getStateKey(state) {
  return JSON.stringify(state);
}

function getPosKey(position) {
  return JSON.stringify(position);
}

main();
