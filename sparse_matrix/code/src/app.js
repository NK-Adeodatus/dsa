const fs = require('fs')
const readline = require('readline')
const path = require('path')

// SparseMatrix class to represent a sparse matrix
class SparseMatrix {
    constructor(numRows, numCols) {
        this.numRows = numRows
        this.numCols = numCols
        this.data = []
    }

    // Static method to read data from a file and create a SparseMatrix instance
    static readDataFromFile(filePath) {
        const lines = fs.readFileSync(filePath, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

        if(!lines[0].startsWith('rows=')) {
            throw new Error("Input file has wrong format")
        }

        const numRows = parseInt(lines[0].split('=')[1])
        const numCols = parseInt(lines[1].split('=')[1])

        console.log(`Number of rows: ${numRows}`)
        console.log(`Number of columns: ${numCols}`)

        const matrix = new SparseMatrix(numRows, numCols)

        for(let i = 2; i <= lines.length - 1; i++) {
            const line = lines[i]
            if(!line.startsWith('(') || !line.endsWith(')')) {
                throw new Error("Input file has wrong format")
            }

            const data = line.slice(1, -1).split(',')
            if(data.length !== 3) {
                throw new Error("Input file has wrong format")
            }

            const row = parseInt(data[0].trim())
            const col = parseInt(data[1].trim())
            const value = parseFloat(data[2].trim())

            if(isNaN(row) || isNaN(col) || isNaN(value)) {
                throw new Error("Input file has wrong format")
            }

            matrix.setElement(row, col, value)
        }
        console.log('readDataFromFile completed running')
        return matrix
    }

    // Method to get the value at a specific position in the matrix
    getElement(row, col) {
        const entry = this.data.find(entry => entry.row === row && entry.col === col)
        return entry ? entry.value : 0
    }

    // Method to set the value at a specific position in the matrix
    setElement(row, col, value) {
        console.log('setElement called')
        const index = this.data.findIndex(entry => entry.row === row && entry.col === col)
        if(index !== -1) {
            if(value === 0) {
                this.data.splice(index, 1)
            } else{
                this.data[index].value = value
            }
        } else {
            this.data.push({ row, col, value })
        }
        console.log('setElement completed running')
    }

    // Method to print the resulting matrix
    print() {
    console.log('print called')
    console.log(`rows=${this.numRows}`);
    console.log(`cols=${this.numCols}`);

    for (let i = 0; i < this.data.length; i++) {
        const e = this.data[i];
        console.log(`(${e.row}, ${e.col}, ${e.value})`);
    }
    console.log('print completed running')
}

}

// Sample input files
const file1 = path.join(__dirname, '../../sample_inputs/sample1.txt')
const file2 = path.join(__dirname, '../../sample_inputs/sample2.txt')


// Function to add two sparse matrices
// This function takes two SparseMatrix instances and returns a new SparseMatrix instance
function add(A, B) {
    console.log('add called')
    if(A.numRows !== B.numRows || A.numCols !== B.numCols) {
        throw new Error("Matrices have different dimensions")
    }

    const result = new SparseMatrix(A.numRows, A.numCols)

    const map = new Map();
    const key = (r, c) => `${r},${c}`;

    for (const e of A.data) map.set(key(e.row, e.col), e.value);
    for (const e of B.data) {
        const k = key(e.row, e.col);
        map.set(k, (map.get(k) || 0) + e.value);
    }

    for (const [k, val] of map.entries()) {
        if (val !== 0) {
            const [r, c] = k.split(',').map(Number);
            result.setElement(r, c, val);
        }
    }
    console.log('add completed running')
    return result;
}

// Function to subtract two sparse matrices
// This function takes two SparseMatrix instances and returns a new SparseMatrix instance
function subtractMatrices(A, B) {
    const negated = new SparseMatrix(B.numRows, B.numCols);
    for (const e of B.data) {
        negated.setElement(e.row, e.col, -e.value);
    }
    return add(A, negated);
}

// Function to multiply two sparse matrices
// This function takes two SparseMatrix instances and returns a new SparseMatrix instance
function multiplyMatrices(A, B) {
    if (A.numCols !== B.numRows) {
        throw new Error('Matrix multiplication not possible: incompatible dimensions');
    }

    const result = new SparseMatrix(A.numRows, B.numCols);
    for (const a of A.data) {
        for (const b of B.data) {
            if (a.col === b.row) {
                const prev = result.getElement(a.row, b.col);
                result.setElement(a.row, b.col, prev + a.value * b.value);
            }
        }
    }
    return result;
}

// Read input from the user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt the user for input
function promptUser(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

// Main function to execute the operations
// This function prompts the user for an operation and performs it on the two matrices
// It then prints the result
(async function main() {
    const op = await promptUser('Enter operation (+, -, *): ');
    const A = SparseMatrix.readDataFromFile(file1)
    const B = SparseMatrix.readDataFromFile(file2)

    let result

    if(op === '+') {
        result = add(A, B)
    } else if(op === '-') {
        result = subtractMatrices(A, B)
    } else if(op === '*') {
        result = multiplyMatrices(A, B)
    } else {
        throw new Error('Invalid operation')
    }

    console.log('Result:')
    result.print()
    rl.close()
    
}) ()
