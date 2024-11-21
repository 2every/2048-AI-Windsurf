const gridContainer = document.querySelector('.grid-container');
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restart');
let score = 0;
let grid = [];

function init() {
    grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    score = 0;
    addRandomTile();
    updateGrid();
    addRandomTile();
    updateGrid();
}

function addRandomTile() {
    const emptyTiles = [];
    grid.forEach((row, rIndex) => {
        row.forEach((tile, cIndex) => {
            if (tile === 0) emptyTiles.push({ rIndex, cIndex });
        });
    });
    if (emptyTiles.length === 0) {
        console.error('No empty tiles available');
        return;
    }
    const { rIndex, cIndex } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    grid[rIndex][cIndex] = Math.random() < 0.9 ? 2 : 4;
    console.log(`Added tile ${grid[rIndex][cIndex]} at position (${rIndex}, ${cIndex})`);
    console.table(grid);
}

function updateGrid() {
    gridContainer.innerHTML = '';
    grid.forEach(row => {
        row.forEach(tile => {
            const tileDiv = document.createElement('div');
            tileDiv.classList.add('tile');
            if (tile !== 0) {
                tileDiv.textContent = tile;
                tileDiv.setAttribute('data-value', tile);
                if (tile.merged) {
                    tileDiv.classList.add('merged');
                    setTimeout(() => tileDiv.classList.remove('merged'), 150);
                }
            }
            gridContainer.appendChild(tileDiv);
        });
    });
    scoreDisplay.textContent = score;
    
    // Add movement suggestion
    const suggestion = document.getElementById('suggestion') || document.createElement('div');
    suggestion.id = 'suggestion';
    suggestion.textContent = 'Suggested move: ' + getBestMove();
    if (!document.getElementById('suggestion')) {
        document.querySelector('.game-container').appendChild(suggestion);
    }
}

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowUp':
            moveUp();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
    }
    updateGrid();
}

function moveUp() {
    let moved = false;
    for (let col = 0; col < 4; col++) {
        // Extract column
        let column = [];
        for (let row = 0; row < 4; row++) {
            if (grid[row][col] !== 0) {
                column.push(grid[row][col]);
            }
        }
        
        // Merge tiles
        for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
                column[i] *= 2;
                column[i + 1] = 0;
                score += column[i];
                moved = true;
            }
        }
        
        // Remove zeros and fill array
        column = column.filter(tile => tile !== 0);
        while (column.length < 4) {
            column.push(0);
        }
        
        // Update grid
        for (let row = 0; row < 4; row++) {
            if (grid[row][col] !== column[row]) {
                moved = true;
            }
            grid[row][col] = column[row];
        }
    }
    if (moved) {
        addRandomTile();
    }
}

function moveDown() {
    let moved = false;
    // Process each column independently
    for (let col = 0; col < 4; col++) {
        // Step 1: Extract non-zero numbers from bottom to top
        let column = [];
        for (let row = 3; row >= 0; row--) {  // Start from bottom (row 3) to top (row 0)
            if (grid[row][col] !== 0) {
                column.push(grid[row][col]);
            }
        }
        
        // Step 2: Merge adjacent equal numbers from bottom
        for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
                column[i] *= 2;          // Double the first number
                column[i + 1] = 0;       // Set the second number to 0
                score += column[i];      // Add to score
                moved = true;
            }
        }
        
        // Step 3: Remove all zeros and fill with zeros at top
        column = column.filter(tile => tile !== 0);  // Remove all zeros
        while (column.length < 4) {
            column.push(0);              // Add zeros at the end (which will be top)
        }
        
        // Step 4: Update the grid column from bottom to top
        for (let row = 3; row >= 0; row--) {
            // 3 - row converts the position: 3→0, 2→1, 1→2, 0→3
            let newValue = column[3 - row];
            if (grid[row][col] !== newValue) {
                moved = true;
            }
            grid[row][col] = newValue;
        }
    }
    
    // Step 5: Add new random tile only if something moved
    if (moved) {
        addRandomTile();
    }
}

function moveLeft() {
    let moved = false;
    for (let row = 0; row < 4; row++) {
        let newRow = grid[row].filter(val => val);
        while (newRow.length < 4) newRow.push(0);
        for (let col = 0; col < 3; col++) {
            if (newRow[col] === newRow[col + 1] && newRow[col] !== 0) {
                newRow[col] *= 2;
                newRow[col + 1] = 0;
                score += newRow[col];
                moved = true;
            }
        }
        newRow = newRow.filter(val => val);
        while (newRow.length < 4) newRow.push(0);
        grid[row] = newRow;
    }
    if (moved) addRandomTile();
}

function moveRight() {
    let moved = false;
    for (let row = 0; row < 4; row++) {
        // Extract row and reverse it
        let newRow = [];
        for (let col = 3; col >= 0; col--) {
            if (grid[row][col] !== 0) {
                newRow.push(grid[row][col]);
            }
        }
        
        // Merge tiles
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                newRow[i + 1] = 0;
                score += newRow[i];
                moved = true;
            }
        }
        
        // Remove zeros and fill array
        newRow = newRow.filter(tile => tile !== 0);
        while (newRow.length < 4) {
            newRow.push(0);
        }
        
        // Update grid
        for (let col = 3; col >= 0; col--) {
            if (grid[row][col] !== newRow[3 - col]) {
                moved = true;
            }
            grid[row][col] = newRow[3 - col];
        }
    }
    if (moved) {
        addRandomTile();
    }
}

function getBestMove() {
    // Clone grid for simulation
    let bestScore = -1;
    let bestMove = '';
    const moves = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const directions = ['↑', '↓', '←', '→'];

    // Factors to consider
    const mergePossible = (direction) => {
        const gridCopy = grid.map(row => [...row]);
        let merged = false;
        
        if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 3; col++) {
                    if (gridCopy[row][col] !== 0 && gridCopy[row][col] === gridCopy[row][col + 1]) {
                        merged = true;
                    }
                }
            }
        } else {
            for (let col = 0; col < 4; col++) {
                for (let row = 0; row < 3; row++) {
                    if (gridCopy[row][col] !== 0 && gridCopy[row][col] === gridCopy[row + 1][col]) {
                        merged = true;
                    }
                }
            }
        }
        return merged;
    };

    moves.forEach((move, index) => {
        let currentScore = 0;
        
        // Check for possible merges
        if (mergePossible(move)) {
            currentScore += 100;
        }

        // Prefer moves that keep large numbers together
        if (move === 'ArrowDown' || move === 'ArrowRight') {
            currentScore += 50;
        }

        if (currentScore > bestScore) {
            bestScore = currentScore;
            bestMove = directions[index];
        }
    });

    return bestMove || '?';
}

// Add touch support
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const gridElement = document.querySelector('.grid-container');

gridElement.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    event.preventDefault();
}, { passive: false });

gridElement.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });

gridElement.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Minimum swipe distance (in pixels)
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                moveRight();
            } else {
                moveLeft();
            }
            updateGrid();
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                moveDown();
            } else {
                moveUp();
            }
            updateGrid();
        }
    }
    event.preventDefault();
}, { passive: false });

restartButton.addEventListener('click', init);

init();
