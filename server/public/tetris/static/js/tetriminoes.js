const jTetrimino = [
	[0, gw, gw+1, gw+2],
	[1, gw+1, gw*2+1, 2],
	[gw, gw+1, gw+2, gw*2+2],
	[gw*2, 1, gw+1, gw*2+1]
]

const lTetrimino = [
	[gw, gw+1, 2, gw+2],
	[1, gw+1, gw*2+1, gw*2+2],
	[gw, gw*2, gw+1, gw+2],
	[0, 1, gw+1, gw*2+1]
]

const sTetrimino = [
	[1, 2,gw,gw+1],
	[1,gw+1,gw+2,gw*2+2],
	[gw+1,gw+2,gw*2,gw*2+1],
	[0,gw,gw+1,gw*2+1]
]

const zTetrimino = [
	[0, 1, gw+1, gw+2],
	[gw+1, gw*2+1, 2, gw+2],
	[gw, gw+1, gw*2+1, gw*2+2],
	[1, gw,gw+1, gw*2]
]

const tTetrimino = [
	[1,gw,gw+1,gw+2],
	[1,gw+1,gw+2,gw*2+1],
	[gw,gw+1,gw+2,gw*2+1],
	[1,gw,gw+1,gw*2+1]
]

const oTetrimino = [
	[0,1,gw,gw+1],
	[0,1,gw,gw+1],
	[0,1,gw,gw+1],
	[0,1,gw,gw+1]
]

const iTetrimino = [
	[gw,gw+1,gw+2,gw+3],
	[2,gw+2,gw*2+2,gw*3+2],
	[gw*2,gw*2+1,gw*2+2,gw*2+3],
	[1,gw+1,gw*2+1,gw*3+1],
]
const tetriminoes = [jTetrimino, lTetrimino, sTetrimino, zTetrimino, oTetrimino, tTetrimino, iTetrimino]
// First rotation of each Tetrimino, used for displaying the next tetromino.
const upNextTetriminoes = [
	[0, upNextWidth, upNextWidth+1, upNextWidth+2], // J
	[upNextWidth, upNextWidth+1, 2, upNextWidth+2], // L
	[1, 2,upNextWidth,upNextWidth+1], // S
	[0, 1, upNextWidth+1, upNextWidth+2], // Z
	[0,1,upNextWidth,upNextWidth+1], // O
	[1,upNextWidth,upNextWidth+1,upNextWidth+2], // T
	[upNextWidth,upNextWidth+1,upNextWidth+2,upNextWidth+3], // I
]
const tetriminoNames = ['jTetrimino', 'lTetrimino', 'sTetrimino', 'zTetrimino', 'oTetrimino', 'tTetrimino', 'iTetrimino']