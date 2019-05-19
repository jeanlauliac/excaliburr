#!/usr/bin/env node


// Pieces 0..3 are on front face, clockwise.
// Pieces 4..7 are left, clockwise.
// Piece 8 is the sword.
//
// Axis X is going right, axis Y is going up, axis Z is going back. Global
// [0,0,0] is in the bottom-left corner of the cube seen from the front. Pieces
// are expressed in local coordinates.
const PIECES_FILL = [
  [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 2, 0], [1, 2, 0],
    [0, 0, 1], [0, 0, 2], [0, 0, 3], [0, 0, 4], [0, 0, 5],
    [0, 0, 6], [1, 0, 6], [0, 1, 6], [1, 1, 6], [0, 2, 6], [1, 2, 6],
  ],
  [
    [0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0], [2, 1, 0],
    [2, 0, 1], [2, 0, 2], [2, 0, 3], [2, 0, 4], [2, 0, 5],
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
];

const PIECE_COUNT = PIECES_FILL.length;

const INITIAL_STATE = [
  [1, 3, 0],
  [3, 4, 0],
  [4, 1, 0],
  [1, 1, 0],
  [0, 4, 3],
  [0, 3, 1],
  [0, 1, 1],
  [0, 1, 4],
];

const graph = new Map();

function main() {
  const distances = new Map();
  const prev = new Map();

  const initIntr = getIntersection(INITIAL_STATE);
  if (initIntr.length > 0) {
    console.error('invalid initial state: ', initIntr);
    process.exitCode = 1;
    return;
  }

  let key = getStateKey(INITIAL_STATE);

  distances.set(key, 0);
  const queue = [INITIAL_STATE];

  let max = 10;

  while (queue.length > 0 && max > 0) {
    const state = queue.pop();
    key = getStateKey(state);
    const dist = distances.get(key);

    for (let i = 0; i < PIECE_COUNT; ++i) {
      for (let j = 0; j < 3; ++j) {
        for (let k = -1; k < 2; k += 2) {
          if (state[i][j] > 10 || state[i][j] < -10) {
            continue;
          }
          const newState = [...state];
          newState[i] = [...state[i]];
          newState[i][j] += k;
          if (getIntersection(newState).length > 0) {
            continue;
          }
          const newKey = getStateKey(newState);
          const prevDist = distances.get(newKey);
          if (prevDist <= dist + 1) {
            continue;
          }
          distances.set(newKey, dist + 1);
          prev.set(newKey, key);
          queue.push(newState);
        }
      }
    }
    --max;
  }

  console.log(distances);
}

function getIntersection(state) {
  const world = new Set();
  const result = [];
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
        result.push(pos);
      }
      world.add(key);
    }
  }
  return result;
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
