/*
 * Supporting script for testing matrix class. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../math/Matrix'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  MatrixModule             // Matrix
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var matrixRef = new MatrixModule();
    var __matrix  = new matrixRef.Matrix();

    var row = [1, 2, 3];
    
    // add-row adds to the top of the matrix, so we can use add or append for the first row and it's the same result
    __matrix.addRow(row)
    
    // append-row appends the row onto the bottom, so this results in the matrix
    //
    // [ 1 2 3 ]
    // [ 4 5 6 ]
    __matrix.appendRow( [4, 5, 6] );
    
    console.log( "2 x 3 matrix, dimensions: ", __matrix.get_m(), __matrix.get_n() );
    
    // add and then delete a row (indices are zero-based)
    __matrix.appendRow( [0, 0, 0] );
    __matrix.deleteRow(2);
    
    console.log( "add/delete, 2 x 3 matrix, dimensions: ", __matrix.get_m(), __matrix.get_n() );
    
    // add a row to the top and then delete that row
    __matrix.addRow( [0,0,0] );
    __matrix.removeFirst();
    
    // get and log the two rows
    console.log( "row 0 [1, 2, 3] ", __matrix.get_row(0) );
    console.log( "row 1 [4, 5, 6] ", __matrix.get_row(1) );
    
    // add a row to the bottom
    __matrix.appendRow( [7, 8, 9] );
    console.log( "new matrix is 3x3: ", __matrix.get_m(), __matrix.get_n() )
    
    // delete that row
    __matrix.removeLast();
    console.log( "remove last row");
    console.log( "row 0 [1, 2, 3] ", __matrix.get_row(0) );
    console.log( "row 1 [4, 5, 6] ", __matrix.get_row(1) );
    
    var matrix = new matrixRef.Matrix();
    matrix.addRow( [7, 8] );
    matrix.appendRow( [9, 10] );
    matrix.appendRow( [11, 12] );
    
    console.log( "second matrix is 3 x 2" )
    
    console.log( "first column [7, 9, 11] : ", matrix.get_column(0) );
    
    // matrix multiplication in-place
    __matrix.multiply(matrix);
    
    console.log( "result matrix dimensions 2 x 2: ", __matrix.get_m(), __matrix.get_n() );
    console.log( "mult. row 0 [58, 64] ", __matrix.get_row(0) );
    console.log( "mult. row 1 [139, 154] ", __matrix.get_row(1) );
    
    // clear the original matrix
    __matrix.clear();
    console.log( "clear matrix should be 0 x 0 : ", __matrix.get_m(), __matrix.get_n() );
    __matrix.appendRow( [1, 2, 3] );
    __matrix.appendRow( [4, 5, 6] );
    __matrix.appendRow( [7, 8, 9] );
    __matrix.appendRow( [10, 11, 12] );
    
    var result = __matrix.byVector( [-2, 1, 0] );
    console.log( "matrix-vector product, [0, -3, -6, -9] : ", result );
    
    // clear again
    __matrix.clear();
    
    __matrix.appendRow( [1, -2, -2, -3] );
    __matrix.appendRow( [3, -9, 0, -9] );
    __matrix.appendRow( [-1, 2, 4, 7] );
    __matrix.appendRow( [-3, -6, 26, 2] );
    
    var solve = __matrix.solve( [1, 1, 1, 1] );
    
    console.log( "4x4 system of equations, solution: ", solve );
    
    matrix.clear();
    matrix.appendRow( [1, -2, -2, -3] );
    matrix.appendRow( [3, -9, 0, -9] );
    matrix.appendRow( [-1, 2, 4, 7] );
    matrix.appendRow( [-3, -6, 26, 2] );
    
    var b = matrix.byVector(solve);
    
    console.log( "original matrix times solution vector (all ones): ", b );
    
    console.log( "" )
    console.log( "transpose of coefficient matrix" );
    console.log( "" );
    
    var trans = matrix.transpose();
    
    console.log( "matrix: ", trans );
  };
  
});