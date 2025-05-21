const fs = require('fs')
const path = require('path')
const readline = require('readline')

class SparseMatrix {
    constructor(numRows, numCols) {
        this.numRows = numRows
        this.numCols = numCols
        // Use Map for O(1) lookups instead of array with linear search
        this.data = new Map()
    }

    // Generate unique key for storing elements
    static key(row, col) {
        return `${row},${col}`
    }

    // Static method to read data from a file
    static readDataFromFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')
        let lineIndex = 0
        
        // Skip empty lines at the beginning
        while (lineIndex < lines.length && lines[lineIndex].trim() === '') {
            lineIndex++
        }
        
        if (lineIndex >= lines.length || !lines[lineIndex].startsWith('rows=')) {
            throw new Error("Input file has wrong format")
        }

        const numRows = parseInt(lines[lineIndex].split('=')[1])
        lineIndex++
        
        if (lineIndex >= lines.length || !lines[lineIndex].startsWith('cols=')) {
            throw new Error("Input file has wrong format")
        }
        
        const numCols = parseInt(lines[lineIndex].split('=')[1])
        lineIndex++
        
        const matrix = new SparseMatrix(numRows, numCols)
        
        // Process all data entries at once
        for (; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex].trim()
            if (line === '') continue
            
            if (!line.startsWith('(') || !line.endsWith(')')) {
                throw new Error("Input file has wrong format")
            }
            
            const content = line.substring(1, line.length - 1)
            const parts = content.split(',')
            
            if (parts.length !== 3) {
                throw new Error("Input file has wrong format")
            }
            
            const row = parseInt(parts[0].trim())
            const col = parseInt(parts[1].trim())
            const value = parseFloat(parts[2].trim())
            
            if (!isNaN(row) && !isNaN(col) && !isNaN(value) && value !== 0) {
                matrix.setElement(row, col, value)
            }
        }
        
        return matrix
    }
    // Method to get the value at a specific position in the matrix
    getElement(row, col) {
        return this.data.get(SparseMatrix.key(row, col)) || 0
    }

    setElement(row, col, value) {
        const k = SparseMatrix.key(row, col)
        
        if (value === 0) {
            this.data.delete(k)
        } else {
            this.data.set(k, value)
        }
    }

    print() {
        console.log('\nNow the result is being printed to the file "result.txt" located in the same directory as app.js\n')

        const resultPath = path.join(__dirname, 'result.txt');
        fs.writeFileSync(resultPath, `rows=${this.numRows}\ncols=${this.numCols}\n`);
        
        // Convert Map to array for printing
        for (const [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number)
            fs.appendFileSync(resultPath, `(${row}, ${col}, ${value})\n`);
        }
        console.log('finished printing result to the file "result.txt"')
    }
}

// Function to add two sparse matrices
function add(A, B) {
    if (A.numRows !== B.numRows || A.numCols !== B.numCols) {
        throw new Error("Matrices have different dimensions")
    }

    const result = new SparseMatrix(A.numRows, A.numCols)
    
    // First, add all elements from A
    for (const [key, value] of A.data) {
        result.data.set(key, value)
    }
    
    // Then add or update with elements from B
    for (const [key, value] of B.data) {
        const sum = (result.data.get(key) || 0) + value
        if (sum !== 0) {
            result.data.set(key, sum)
        } else {
            // If sum is zero, remove the element
            result.data.delete(key)
        }
    }
    console.log('addition completed.')
    return result
}

// Function to subtract two sparse matrices
function subtractMatrices(A, B) {
    if (A.numRows !== B.numRows || A.numCols !== B.numCols) {
        throw new Error("Matrices have different dimensions")
    }

    const result = new SparseMatrix(A.numRows, A.numCols)
    
    // add all elements from A
    for (const [key, value] of A.data) {
        result.data.set(key, value)
    }
    
    // subtract elements from B
    for (const [key, value] of B.data) {
        const diff = (result.data.get(key) || 0) - value
        if (diff !== 0) {
            result.data.set(key, diff)
        } else {
            result.data.delete(key)
        }
    }
    console.log('Subtraction complete')
    return result
}

// Multiply the two matrices
function multiplyMatrices(A, B) {
    if (A.numCols !== B.numRows) {
        throw new Error('Matrix multiplication not possible: incompatible dimensions');
    }
    console.log('Multiplying Matrices...')
    const EPSILON = 1e-10;
    const tempResult = Array(A.numRows).fill(null).map(() => Array(B.numCols).fill(0));

    for (const [aKey, aValue] of A.data) {
        const [aRow, aCol] = aKey.split(',').map(Number);

        for (const [bKey, bValue] of B.data) {
            const [bRow, bCol] = bKey.split(',').map(Number);

            if (aCol === bRow) {
                tempResult[aRow][bCol] += aValue * bValue;
            }
        }
    }

    const result = new SparseMatrix(A.numRows, B.numCols);
    for (let i = 0; i < tempResult.length; i++) {
        for (let j = 0; j < tempResult[i].length; j++) {
            if (Math.abs(tempResult[i][j]) > EPSILON) {
                result.setElement(i, j, tempResult[i][j]);
            }
        }
    }
    console.log('Multiplication Complete.')
    return result;
}




// main function
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const promptUser = (question) => new Promise(resolve => rl.question(question, resolve))
    
    let op
    while (true) {
        op = await promptUser('Enter an operation (+, -, *): ')
        if (['+', '-', '*'].includes(op)) break
        console.log('Invalid operation. Please enter +, - or *')
    }

    // Choose files that are compatible with the selected operation
    let file1, file2
    if (op === '+' || op === '-') {
        file1 = path.join(__dirname, '../../sample_inputs/easy_sample_02_1.txt')
        file2 = path.join(__dirname, '../../sample_inputs/easy_sample_02_2.txt')
    } else {
        file1 = path.join(__dirname, '../../sample_inputs/easy_sample_01_2.txt')
        file2 = path.join(__dirname, '../../sample_inputs/easy_sample_01_3.txt')
    }

    // Load matrices
    const A = SparseMatrix.readDataFromFile(file1)
    const B = SparseMatrix.readDataFromFile(file2)

    // Perform operation
    let result
    switch (op) {
        case '+': result = add(A, B); break
        case '-': result = subtractMatrices(A, B); break
        case '*': result = multiplyMatrices(A, B); break
    }

    result.print()
    rl.close()
}

// Run the program
main()