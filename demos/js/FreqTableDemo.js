/*
 * Supporting script for testing frequency table methods. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../statistics/dataanalysis/FrequencyTable',
         '../../statistics/dataanalysis/Bayes'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  TableModule,             // Frequency Table
                  BayesModule              // Bayesian analysis
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var tableRef = new TableModule();
    var __table  = new tableRef.FrequencyTable();

    var bayesRef = new BayesModule();
    var __bayes  = new bayesRef.Bayes();

    // simple spam example 
    var data = [];
    var rows = [ "Spam", "Not Spam" ];
    var cols = [ "Viagra Y", "Viagra N", "Money Y", "Money N", "Groceries Y", "Groceries N", "Unsubscribe Y", "Unsubscribe N" ];
    
    var rowTotals = [20, 80];

    data.push( [4, 16, 10, 10, 0, 20, 12, 8] );
    data.push( [1, 79, 14, 66, 8, 71, 23, 57] );

    __table.fromArray( data, rows, cols, rowTotals );

    // although defined above row-major, the table is stored and retrieved, column-major
    console.log( "Table: ", __table.get_tableData() );
   
    console.log( "Column counts [100, 100, 100, 100, 100, 100, 100, 100] ", __table.get_columnTotals() );

    // table should note validate as there is a zero element
    console.log( "validate: ", __table.validate() );

    // make sure it was changed to 1
    console.log( "groceries-yes column: ", __table.getColumn("Groceries Y") );

    // create an empty table with 2 rows and 8 columns - should be all zeros for counts
    __table.setupTable(rows, cols);
    
    console.log( "Table after init: ", __table.get_tableData() );

    // add data to the table one cell at a time, like an interactive experiment
    __table.addCellFrequency( "Spam", "Viagra Y"      , 4  );
    __table.addCellFrequency( "Spam", "Viagra N"      , 16 );
    __table.addCellFrequency( "Spam", "Money Y"       , 10 );
    __table.addCellFrequency( "Spam", "Money N"       , 10 );
    __table.addCellFrequency( "Spam", "Groceries N"   , 20 );
    __table.addCellFrequency( "Spam", "Unsubscribe Y" , 12 );
    __table.addCellFrequency( "Spam", "Unsubscribe N" , 8  );

    __table.addCellFrequency( "Not Spam", "Viagra Y"      , 1  );
    __table.addCellFrequency( "Not Spam", "Viagra N"      , 79 );
    __table.addCellFrequency( "Not Spam", "Money Y"       , 14 );
    __table.addCellFrequency( "Not Spam", "Money N"       , 66 );
    __table.addCellFrequency( "Not Spam", "Groceries Y"   , 8  );
    __table.addCellFrequency( "Not Spam", "Groceries N"   , 71 );
    __table.addCellFrequency( "Not Spam", "Unsubscribe Y" , 23 );
    __table.addCellFrequency( "Not Spam", "Unsubscribe N" , 57 );

    __table.addRowcount( "Spam", 20 );
    __table.addRowcount( "Not Spam", 80 );

    console.log( "Table data: ", __table.get_tableData() );
    console.log( "Row totals [20, 80]: ", __table.get_rowTotals() );
    console.log( "Col totals [5, 95, 24, 76, 8, 91, 35, 65]: ", __table.get_columnTotals() );

    // Bayesian analysis (singleton case first)
    rows = [ "Golf Y", "Golf N" ];
    cols = [ "Sunny", "Overdast", "Rainy" ];
    rowTotals = [ 9, 5 ];
    data = [];

    data.push( [3, 4, 2] );
    data.push( [2, 0, 3] );

    __table.fromArray( data, rows, cols, rowTotals );
    __table.validate();

    __bayes.set_table(__table);
    var prob = __bayes.naive( "Golf Y", ["Sunny"] );

    console.log( "#1", prob );

    console.log( "---");

    rows = [ "Banana", "Orange", "Other" ];
    cols = [ "Long", "Sweet", "Yellow" ];
    rowTotals = [ 500, 300, 200 ];
    data = [];

    data.push( [400, 350, 450] );
    data.push( [0  , 150, 300] );
    data.push( [100, 150, 50 ] );

    __table.fromArray( data, rows, cols, rowTotals );
    __table.validate();

    __bayes.set_table(__table);

    // prob = __bayes.naive( "Banana", ["Long", "Sweet", "Yellow"] );

    // console.log( "#2", prob );

    prob = __bayes.naive( "Banana", ["Long", "Sweet", "Yellow"], false, true );

    console.log( "n(Banana) ", prob.p );

    prob = __bayes.naive( "Other", ["Long", "Sweet", "Yellow"], false, true );

    console.log( "n(Other) ", prob.p );
  };
  
});