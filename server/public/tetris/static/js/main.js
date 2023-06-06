document.addEventListener('DOMContentLoaded', () => {
    let squares = Array.from(document.querySelectorAll('.grid div'))
    let score = nextRandom = currentRotation = totalLines = randomTetriminoIndex = 0
    let currentPosition = 3
    let level = 1
    let speed = 1000
    let seconds = 0

    let random = Math.floor(Math.random() * tetriminoes.length)
    let current = tetriminoes[random][currentRotation]
    let randomTetriminoOrder = [0, 1, 2, 3, 4, 5, 6]

    let start, pause, end, previousTimeStamp, lastRun, shadowPosition, minimumDistance, lockDelay, timer

    // draw draws the current tetrimino and it's shadow on to the grid.
    const draw = () => {
        calculateShadow()
        for (index of current) {
            squares[currentPosition + index].classList.add('tetrimino', tetriminoNames[random])
            squares[shadowPosition + index].classList.add('shadow', tetriminoNames[random])
        }
        for (index of current) {
            squares[currentPosition + index].classList.remove('shadow')
        }
    }
    // undraw removes the current tetrimino from the grid.
    const undraw = () => {
        for (index of current) {
            squares[currentPosition + index].classList.remove('tetrimino', tetriminoNames[random])
            squares[shadowPosition + index].classList.remove('shadow', tetriminoNames[random])
        }
    }
    // control maps keyboard keys to functions.
    const control = (e) => {
        switch (e.keyCode) {
            case 32:			// Space
                scoreHardDrops()
                drop()
                break
            case 37:			// Left
                moveLeft()
                break
            case 38:			// Up
                rotate()
                break
            case 39:			// Right
                moveRight()
                break
            case 40:			// Down
                scoreSoftDrops(moveDown)
                break
            case 80: 			// P
            case 27:
                pauseGame()
        }
    }
    // moveDown moves current tetrimino one space down on the grid.
    const moveDown = () => {
        let movedDown = false
        clearTimeout(lockDelay)
        undraw()
        if (!current.some(index => squares[currentPosition + index + gw].classList.contains('taken'))) {
            currentPosition += gw
            movedDown = true
        }
        draw()
        startLockDelay()
        return movedDown
    }
    // drop drops the current tetrimino on the current columns.
    const drop = () => {
        undraw()
        currentPosition = shadowPosition
        soundDrop.play()
        draw()
        lock()
    }
    // startLockDelay checks if current tetrimino should be locked, sets timeout which calls lock  
    const startLockDelay = () => {
        if (!current.some(index => squares[currentPosition + index + gw].classList.contains('taken'))) {
            lockDelay = undefined
            return
        }
        lockDelay = setTimeout(lock, speed)
    }
    // lock locks the current tetrimino and starts a new tetrimino falling.
    const lock = async () => {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'))
        current.forEach(index => squares[currentPosition + index].classList.remove('shadow'))
        scoreLines()

        clearTimeout(lockDelay)
        lockDelay = undefined
        soundsHit[Math.floor(Math.random())].play()
        newTetrimino()

		isGameOver()
        if (end) {
        	gameOver()
			return
		}

        draw()
        upNext()
    }
    // newTetrimino sets the new current tetrimino
    const newTetrimino = () => {
        randomTetriminoIndex++
        if (randomTetriminoIndex > 6) {
            randomGenerator()
            randomTetriminoIndex = 0
        }

        random = nextRandom
        nextRandom = randomTetriminoOrder[randomTetriminoIndex]

        currentRotation = 0
        currentPosition = 3
        current = tetriminoes[random][currentRotation]
    }
    // moveLeft moves current tetrimino one space left.
    const moveLeft = () => {
        if (isAtLeftEdge() || isOtherInWay(-1)) return
        if (lockDelay) clearTimeout(lockDelay)
        undraw()
        currentPosition--
        draw()
        startLockDelay()
        soundMove.play()
    }
    // moveRight moves current tetrimino one space right.
    const moveRight = () => {
        if (isAtRightEdge() || isOtherInWay(1)) return
        if (lockDelay) clearTimeout(lockDelay)
        undraw()
        currentPosition++
        draw()
        startLockDelay()
        soundMove.play()
    }
    // isAtRightEdge returns true if current tetrmino is at the right edge.
    const isAtRightEdge = () => {
        return current.some(index => (currentPosition + index) % gw === gw - 1)
    }
    // isAtLeftEdge returns true if current tetrmino is at the left edge.
    const isAtLeftEdge = () => {
        return current.some(index => (currentPosition + index) % gw === 0)
    }
    // isOtherInWay returns true if another tetrimino is where trying to move current.  
    // Takes 1 Argument: 1 to check right side, -1 for left.
    const isOtherInWay = (leftRight) => {
        return current.some(index => squares[(currentPosition + index) + 1 * leftRight].classList.contains('taken'))
    }
    // kicks is used for specifing where a tetrimino should move when rotating.
    // kicks[I tetrimino or not][currentRotation][current kick test]
    const kicks = [
        // J, L, T, S, Z tetrimino Wall Kicks
        [[[-1, 0], [-1, gw], [0, -gw * 2], [-1, -gw * 2]],
        [[1, 0], [1, -gw], [0, gw * 2], [1, gw * 2]],
        [[1, 0], [1, gw], [0, -gw * 2], [1, -gw * 2]],
        [[-1, 0], [-1, -gw], [0, gw * 2], [-1, gw * 2]]],
        // I tetrimino Wall Kicks
        [[[-2, 0], [1, gw], [-2, -gw], [1, gw * 2]],
        [[-1, 0], [2, gw], [-1, gw * 2], [2, -gw]],
        [[2, 0], [-1, gw], [2, gw], [-1, -gw * 2]],
        [[1, 0], [-2, 0], [1, -gw * 2], [-2, gw]]]
    ]
    // fixRotationPosition uses kicks when rotating a tetrimino that doesn't have space to rotate regularly.
    function fixRotationPosition(kickIndex = 0, lastCurrentPosition = currentPosition) {
        if (isPositionOkay()) return
        currentPosition = lastCurrentPosition
        if (kickIndex > 3) { // if all kicks failed then rotation fails completely
            currentRotation--
            if (currentRotation === -1) currentRotation = 0
            current = tetriminoes[random][currentRotation]
            return
        }

        // if random === 6 then it's is an I tetrimino	
        for (index of kicks[random === 6 ? 1 : 0][currentRotation][kickIndex]) {
            currentPosition += index
        }
        kickIndex++
        fixRotationPosition(kickIndex, lastCurrentPosition)
    }
    // isPositionOkay checks if a tetrimino's position is valid after rotating.
    const isPositionOkay = () => {
        return (currentPosition + 1) % gw < 4 && isAtRightEdge() ? false :	// went through left wall
            (currentPosition % gw > 5 && isAtLeftEdge()) ? false :				// went through right wall
                isSquareTaken() ? false : true			// in floor or other block
    }
    // isSquareTaken checks if current tetrimino squares would interfere with any other after moving.
    const isSquareTaken = () => {
        return current.some(index => squares[currentPosition + index].classList.contains('taken'))
    }
    // rotate rotates a tetrimino clockwise.
    const rotate = () => {
        if (lockDelay) clearTimeout(lockDelay)
        undraw()
        currentRotation++
        soundRotate.play()

        if (currentRotation === tetriminoes[random].length) currentRotation = 0
        current = tetriminoes[random][currentRotation]
        fixRotationPosition()
        draw()
        startLockDelay()
    }
    // calculateShadow calculates where a tetrimino would be dropped (using drop()).
    const calculateShadow = () => {
        minimumDistance = 20
        for (value of current) {
            value += currentPosition
            let currLine = Math.floor(value / gw)

            for (let i = value; i < 200; i += gw) {
                let takenLine = Math.floor(i / gw)
                if (takenLine - currLine >= minimumDistance) break;

                if (squares[i + gw].classList.contains('taken')) {
                    minimumDistance = takenLine - currLine
                }
            }
        }
        shadowPosition = currentPosition + (minimumDistance * gw)
    }
    // linesOfFallingBlock returns all the lines which the current tetrimino is on (max 4).
    const linesOfFallingBlock = () => {
        const lines = []
        for (value of current) {
            lines.push(Math.floor((value + currentPosition) / gw))
        }
        return [...new Set(lines)]
    }
    // upNext displays the next tetrimino block on the mini-grid.	
    const upNext = () => {
        for (square of upNextSquares) {
            square.removeAttribute('class')
        }
        for (index of upNextTetriminoes[nextRandom]) {
            upNextSquares[upNextIndex + index].classList.add('tetrimino', tetriminoNames[nextRandom])
        }
    }
    // gameLoop animates the game, by calling moveDown at set intervals.
    const gameLoop = (timestamp) => {
        if (start === undefined) {
            start = timestamp
        }
        updateFps(timestamp - previousTimeStamp)

        if (end) {
			gameOver()
			return
		}

        if (!pause && timestamp !== previousTimeStamp && (timestamp - lastRun >= speed || start === timestamp) && !lockDelay) {
            moveDown()
            lastRun = timestamp
        }

        previousTimeStamp = timestamp
        window.requestAnimationFrame(gameLoop)
    }
    // startGame starts a new game.
    const startGame = async () => {
        homeMenu.style.display = 'none'
        grid.style.display = 'flex'
        heart.style.display = 'block'
        soundsPause.play()
        await wait()

        setTimeout(() => {
            start = end = pause = undefined
            heart.style.display = 'none'

            timerDisplay.style.display = 'block'
            timerDisplay.innerHTML = 0

            document.addEventListener('keydown', control)
            pauseBtn.style.display = 'block'

            randomGenerator()
            random = randomTetriminoOrder[randomTetriminoIndex]
            current = tetriminoes[random][currentRotation]
            randomTetriminoIndex++
            nextRandom = randomTetriminoOrder[randomTetriminoIndex]
            calculateShadow()
            upNext()
            window.requestAnimationFrame(gameLoop)
        }, 20)
        secondCounter()
        soundsMusic.play()
        soundsMusic.loop = true
    }
    // resetGame resets all variables and clears the grid.
    const resetGame = () => {
        end = true
        for (square of squares.slice(0, 200)) {
            square.removeAttribute('class')
        }
        for (square of upNextSquares) {
            square.removeAttribute('class')
        }
        score = totalLines = 0
        level = 1
        seconds = 0
        speed = 1000
        scoreDisplay.innerText = score
        linesDisplay.innerText = totalLines
        levelDisplay.innerText = level
        fpsCounter.innerText = '00.00'

        currentPosition = 4
        randomGenerator()
        randomTetriminoIndex = 0
        clearInterval(timer)
        soundsMusic.currentTime = 0;
    }
    // backHome calls resetGame() and goes back to the main menu.
    const backHome = () => {
        resetGame()
        soundsPause.play()
        timerDisplay.style.display = 'none'
        grid.style.display = 'none'
        homeMenu.style.display = 'block'
        pauseMenu.style.display = 'none'
        endMenu.style.display = 'none'
    }
    // pauseGame pauses the moveDown func of gameloop and displays a pause menu.
    const pauseGame = () => {
        if (start === undefined) return
        document.removeEventListener('keydown', control)
        soundsPause.play()
        soundsMusic.pause()
        pauseBtn.style.display = 'none'
        pauseMenu.style.display = 'flex'
        pause = !pause
    }
    // scoreLines adds points to the score counter for completed lines.
    const scoreLines = () => {
        let linesCompleted = 0
        for (line of linesOfFallingBlock()) {
            line *= 10
            const row = [line, line + 1, line + 2, line + 3, line + 4, line + 5, line + 6, line + 7, line + 8, line + 9]
            if (row.every(index => squares[index].classList.contains('taken'))) {
                linesCompleted++
                for (index of row) {
                    squares[index].removeAttribute('class')
                }
                soundClear.play()
                const squaresRemoved = squares.splice(line, gw)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
        totalLines += linesCompleted
        linesDisplay.innerText = totalLines
        levelUp()
        score += level * lineScore[linesCompleted]
        scoreDisplay.innerHTML = score
    }
    // scoreSoftDrops adds points to the score each time a soft drop is performed.
    const scoreSoftDrops = () => {
        if (!moveDown()) return
        score++
        scoreDisplay.innerText = score
    }
    // scoreHardDrops adds points to the score each time a hard drop is performed.
    const scoreHardDrops = () => {
        score += 2 * minimumDistance
        scoreDisplay.innerText = score
    }

	const isGameOver = () => {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			end = true
		}
	}

    // gameOver checks if a new tetrimino has space to spawn, if not ends the game with a game over menu.
    const gameOver = async () => {
            pauseBtn.style.display = 'none'
            endMenu.style.display = 'flex'
            soundsMusic.pause()
          //  soundsMusic.currentTime = 0;
            soundsGameOverMusic.play()
            clearInterval(timer)
            document.removeEventListener('keydown', control)

            heartBroken.style.display = 'block'
            await wait()
            heartBroken.style.display = 'none'
    }
    // updateFps is run everytime gameloop is called and updates the FPS counter.
    const updateFps = (since) => {
        fpsCounter.innerText = (1000 / since).toFixed(2)
    }
    // levelUp adds a level and changes the speed after every 10 lines completed.
    const levelUp = () => {
        if (level > 19) return
        if (Math.floor(totalLines) >= level * 10) {
            level++
            levelDisplay.innerText = level
            speed = Math.pow((0.8 - ((level - 1) * 0.007)), (level - 1)) * 1000
            soundsNewLevel.play()
        }
    }
    // randomGenerator shuffles indexes of tetrimioes	
    const randomGenerator = () => {
        let array = randomTetriminoOrder
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    // resumeGame resumes the game after being paused
    const resumeGame = () => {
        document.addEventListener('keydown', control)
        pauseBtn.style.display = 'block'
        pauseMenu.style.display = 'none'
        soundsPause.play()
        soundsMusic.play()
        pause = false
    }
    // restartGame restarts the game calling resetGame and startGame	
    const restartGame = () => {
        pauseMenu.style.display = 'none'
        endMenu.style.display = 'none'
        soundsPause.play()
        resetGame()
        startGame()
    }

    pauseBtn.addEventListener('click', pauseGame)
    document.addEventListener('click', (event) => {
        switch (event.target.id) {
            case 'start-button':
                startGame()
                break;
            case 'resume-button':
                resumeGame()
                secondCounter()
                break;
            case 'restart-button':
                restartGame()
                break;
            case 'home-button':
                backHome()
        }
    })
    // secondCounter counts the time since the game start	
    const secondCounter = () => {
        function incrementSeconds() {
            if (!pause) {
                seconds += 1;
                timerDisplay.innerHTML = seconds
            } else {
                clearInterval(timer)
            }
        }
        timer = setInterval(incrementSeconds, 1000);
    }
    // wait waits 1.5 seconds
    function wait() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 1500)
        })
    }

})