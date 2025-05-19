const fs = require('fs')
const readline = require('readline')
const path = require('path')

class SparseMatrix {
    constructor(numberOfRows, numberOfColumns) {
        this.numRows = numberOfRows
        this.numCols = numberOfColumns
        this.data = []
    }

    static readDataFromFile(filePath) {
        const lines = fs.readFileSync(filePath, 'utf-8')
        .split('\n').map(line => line.trim()).filter(line => line.length > 0)

        if(!lines[0].startsWith('rows=')) {
            throw new Error("Input file has wrong format")
        }

        const numRows = parseInt(lines[0].split('=')[1])
        const numCols = parseInt(lines[1].split('=')[1])

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

    getElement(row, col) {
        const entry = this.data.find(entry => entry.row === row && entry.col === col)
        return entry ? entry.value : 0
    }

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

const path1 = path.join(__dirname, '../../sample_inputs/sample1.txt')
const path2 = path.join(__dirname, '../../sample_inputs/sample2.txt')

function sub(A, B) {
    console.log('subtractMatrices called');
    if (A.numRows !== B.numRows || A.numCols !== B.numCols) {
        throw new Error("Matrices have different dimensions");
    }

    const result = new SparseMatrix(A.numRows, A.numCols);

    const map = new Map();
    const key = (r, c) => `${r},${c}`;

    for (const e of A.data) {
        map.set(key(e.row, e.col), e.value);
    }

    for (const e of B.data) {
        const k = key(e.row, e.col);
        map.set(k, (map.get(k) || 0) - e.value);
    }

    for (const [k, val] of map.entries()) {
        if (val !== 0) {
            const [r, c] = k.split(',').map(Number);
            result.setElement(r, c, val);
        }
    }

    console.log('subtractMatrices completed running');
    return result;
}

function add(A, B) {
    console.log('add called')
    if(A.numRows !== B.numRows || A.numCols !== B.numCols) {
        throw new Error("Matrices have different dimensions")
    }

    const result = new SparseMatrix(A.numRows, A.numCols)

    const map = new Map();
    const key = (row, column) => `${row},${column}`;

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



function mult(A, B) {
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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function app() {
    const op = await ask('Enter operation (+, -, *): ');
    const matrix1 = SparseMatrix.readDataFromFile(path1)
    const matrix2 = SparseMatrix.readDataFromFile(path2)

    let result

    if(op === '+') {
        result = add(matrix1, matrix2)
    } else if(op === '-') {
        result = sub(matrix1, matrix2)
    } else if(op === '*') {
        result = mult(matrix1, matrix2)
    }

    console.log('Result:')
    result.print()
    rl.close()
    
}
app()
