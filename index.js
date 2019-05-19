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
  ]
];

const INITIAL_STATE = {
  pieces: [
    [1, 3, 0],
    [3, 4, 0],
    [4, 1, 0],
    [1, 1, 0],
  ],
};

function main() {
  console.log(getIntersection(INITIAL_STATE));
}

function getIntersection(state) {
  const world = new Set();
  const result = [];
  addCube(world);
  for (let i = 0; i < 4; ++i) {
    const piecePos = state.pieces[i];
    const fills = PIECES_FILL[i];
    for (let j = 0; j < fills.length; ++j) {
      const localPos = fills[j];
      const pos = [
        piecePos[0] + localPos[0],
        piecePos[1] + localPos[1],
        piecePos[2] + localPos[2],
      ];
      const key = keyOf(pos);
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
    world.add(keyOf([x, 0, 0]));
    world.add(keyOf([x, 6, 0]));
    world.add(keyOf([x, 0, 6]));
    world.add(keyOf([x, 6, 6]));
  }
  for (let y = 1; y <= 5; ++y) {
    world.add(keyOf([0, y, 0]));
    world.add(keyOf([6, y, 0]));
    world.add(keyOf([0, y, 6]));
    world.add(keyOf([6, y, 6]));
  }
  for (let z = 1; z <= 5; ++z) {
    world.add(keyOf([0, 0, z]));
    world.add(keyOf([6, 0, z]));
    world.add(keyOf([0, 6, z]));
    world.add(keyOf([6, 6, z]));
  }
}

function keyOf(position) {
  return JSON.stringify(position);
}

main();
