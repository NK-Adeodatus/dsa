# Sparse Matrix Operations in Node.js

This project implements efficient operations on **sparse matrices** using Node.js. A sparse matrix is a matrix that contains many zero elements, and this implementation optimizes storage and computation by only storing non-zero values.

## Features

- Read sparse matrices from `.txt` files
- Perform matrix operations:
  - Addition (`+`)
  - Subtraction (`-`)
  - Multiplication (`*`)
- Save the result to a `.txt` file
- Error handling for malformed input and incompatible dimensions

## File Format

Matrix input files are formatted as follows:

rows=3
cols=3
(0, 1, 2.5)
(1, 2, 4.0)
(2, 0, -1.2)

pgsql
Copy
Edit

- The first two lines specify the number of rows and columns.
- Each remaining line specifies a non-zero entry in the format: `(row, col, value)`.

## Directory Structure

project-root/
│
├── sample_inputs/
│ ├── easy_sample_01_2.txt
│ ├── easy_sample_01_3.txt
│ ├── easy_sample_02_1.txt
│ └── easy_sample_02_2.txt
│
├── results/
│ └── result.txt # Output file generated after operations
│
├── code/src
│       ├── main.js # Main application script
│       └── result.txt # Output file generated after operations
└── README.md

bash
Copy
Edit

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sparse-matrix-operations.git
cd sparse-matrix-operations
```
2. Install Node.js
Ensure Node.js is installed. You can check using:

```bash
node -v
```
If not installed, download it from https://nodejs.org.

3. Run the App
```bash
node src/main.js
```
You'll be prompted to enter an operation (+, -, or *). The app will read predefined input files, perform the operation, and save the result to results/result.txt.

Example Usage
```bash
Enter an operation (+, -, *): *
Multiplying Matrices...

Multiplication Complete

Now the result is being printed on the file "result.txt"
Finished printing result
```
