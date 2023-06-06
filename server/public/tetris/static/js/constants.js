const grid			= document.querySelector('.grid')
const homeMenu		= document.querySelector('.home-menu')
const scoreDisplay	= document.querySelector('#score')
const linesDisplay	= document.querySelector('#lines')
const levelDisplay	= document.querySelector('#level')
const pauseBtn		= document.querySelector('#pause-button')
const fpsCounter	= document.querySelector('div#fpsCounter h1')
const upNextSquares = document.querySelectorAll('.mini-grid div')
const pauseMenu		= document.querySelector('.pause-menu')
const endMenu		= document.querySelector('.end-menu')
const timerDisplay	= document.querySelector('#timer')
const heart         = document.querySelector('#startHeart')
const heartBroken   = document.querySelector('#endHeart')


const gw = 10; //grid width in squares
const upNextWidth = 4;
const upNextIndex = 0;

const lineScore = [0, 100, 300, 500, 800]