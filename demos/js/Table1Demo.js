/*
 * Supporting script for testing basic data table methods. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../statistics/dataanalysis/Table'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  TableModule              // Table
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var tableRef = new TableModule();
    var __table  = new tableRef.Table();

    // 'usercars.txt' 
    var data  = [];
    var types = [ __table.NUMERIC, __table.CHARACTER, __table.NUMERIC, __table.NUMERIC, __table.CHARACTER, __table.CHARACTER ];
    
    data.push( [ "year", "model", "price", "mileage", "color", "transmission" ] );
    data.push( [2011,"SEL",21992,7413,"Yellow","AUTO"] );
    data.push( [2011,"SEL",20995,10926,"Gray","AUTO"] );
    data.push( [2011,"SEL",19995,7351,"Silver","AUTO"] );
    data.push( [2011,"SEL",17809,11613,"Gray","AUTO"] );
    data.push( [2012,"SE",17500,8367,"White","AUTO"] );
    data.push( [2010,"SEL",17495,25125,"Silver","AUTO"] );
    data.push( [2011,"SEL",17000,27393,"Blue","AUTO"] );
    data.push( [2010,"SEL",16995,21026,"Silver","AUTO"] );
    data.push( [2011,"SES",16995,32655,"Silver","AUTO"] );
    data.push( [2010,"SES",16995,36116,"Silver","AUTO"] );
    data.push( [2010,"SES",16995,40539,"Black","AUTO"] );
    data.push( [2011,"SES",16992,9199,"Silver","AUTO"] );
    data.push( [2011,"SEL",16950,9388,"Green","AUTO"] );
    data.push( [2010,"SES",16950,32058,"Red","AUTO"] );
    data.push( [2011,"SE",16000,15367,"White","AUTO"] );
    data.push( [2011,"SES",15999,16368,"Blue","AUTO"] );
    data.push( [2010,"SEL",15999,19926,"Silver","AUTO"] );
    data.push( [2010,"SES",15995,36049,"Silver","AUTO"] );
    data.push( [2011,"SEL",15992,11662,"Blue","AUTO"] );
    data.push( [2011,"SEL",15992,32069,"Silver","AUTO"] );
    data.push( [2010,"SES",15988,16035,"Silver","MANUAL"] );
    data.push( [2010,"SEL",15980,39943,"White","AUTO"] );
    data.push( [2011,"SE",15899,36685,"Silver","AUTO"] );
    data.push( [2010,"SEL",15889,24920,"Black","AUTO"] );
    data.push( [2009,"SEL",15688,20019,"Blue","AUTO"] );
    data.push( [2010,"SE",15500,29338,"Blue","AUTO"] );
    data.push( [2010,"SE",15499,7784,"Black","AUTO"] );
    data.push( [2010,"SE",15499,35636,"Black","AUTO"] );
    data.push( [2010,"SES",15298,22029,"Gray","AUTO"] );
    data.push( [2009,"SEL",14999,33107,"Silver","AUTO"] );
    data.push( [2010,"SES",14999,36306,"Red","AUTO"] );
    data.push( [2009,"SE",14995,34419,"Black","MANUAL"] );
    data.push( [2011,"SE",14992,4867,"Black","AUTO"] );
    data.push( [2011,"SEL",14992,18948,"Black","AUTO"] );
    data.push( [2009,"SES",14992,24030,"Red","AUTO"] );
    data.push( [2010,"SEL",14990,33036,"Black","AUTO"] );
    data.push( [2011,"SE",14989,23967,"White","AUTO"] );
    data.push( [2010,"SE",14906,37905,"Silver","AUTO"] );
    data.push( [2010,"SE",14900,28955,"White","AUTO"] );
    data.push( [2010,"SE",14893,11165,"White","AUTO"] );
    data.push( [2010,"SES",14761,44813,"Black","AUTO"] );
    data.push( [2010,"SES",14699,36469,"Gray","AUTO"] );
    data.push( [2010,"SES",14677,22143,"Black","MANUAL"] );
    data.push( [2009,"SES",14549,34046,"Silver","AUTO"] );
    data.push( [2010,"SE",14499,32703,"Red","AUTO"] );
    data.push( [2010,"SES",14495,35894,"Silver","AUTO"] );
    data.push( [2010,"SE",14495,38275,"Black","AUTO"] );
    data.push( [2010,"SE",14480,24855,"Blue","AUTO"] );
    data.push( [2009,"SEL",14477,29501,"Gray","MANUAL"] );
    data.push( [2009,"SEL",14355,35394,"Red","AUTO"] );
    data.push( [2010,"SE",14299,36447,"Black","AUTO"] );
    data.push( [2010,"SES",14275,35318,"Black","AUTO"] );
    data.push( [2010,"SES",14000,24929,"Silver","AUTO"] );
    data.push( [2009,"SE",13999,23785,"Red","AUTO"] );
    data.push( [2010,"SE",13997,15167,"Black","MANUAL"] );
    data.push( [2010,"SE",13995,13541,"Silver","AUTO"] );
    data.push( [2010,"SE",13995,20278,"Black","MANUAL"] );
    data.push( [2009,"SES",13995,46126,"Black","AUTO"] );
    data.push( [2009,"SES",13995,53733,"Silver","AUTO"] );
    data.push( [2009,"SES",13992,21108,"Silver","AUTO"] );
    data.push( [2010,"SE",13992,21721,"Green","AUTO"] );
    data.push( [2010,"SES",13992,26716,"Gray","MANUAL"] );
    data.push( [2009,"SES",13992,26887,"Black","AUTO"] );
    data.push( [2009,"SE",13991,36252,"Silver","MANUAL"] );
    data.push( [2009,"SE",13950,9450,"Black","AUTO"] );
    data.push( [2010,"SE",13950,31414,"Black","AUTO"] );
    data.push( [2010,"SE",13950,37185,"Blue","AUTO"] );
    data.push( [2010,"SE",13895,48174,"Gray","AUTO"] );
    data.push( [2009,"SE",13888,50533,"White","AUTO"] );
    data.push( [2009,"SE",13845,36713,"Blue","AUTO"] );
    data.push( [2009,"SES",13799,34888,"Black","AUTO"] );
    data.push( [2009,"SES",13742,38380,"Black","AUTO"] );
    data.push( [2010,"SEL",13687,35574,"Gray","AUTO"] );
    data.push( [2009,"SEL",13663,27528,"Silver","AUTO"] );
    data.push( [2010,"SES",13599,33302,"Red","AUTO"] );
    data.push( [2009,"SEL",13584,43369,"Red","AUTO"] );
    data.push( [2009,"SES",13425,64055,"Black","AUTO"] );
    data.push( [2010,"SE",13384,41342,"Gray","AUTO"] );
    data.push( [2010,"SE",13383,34503,"Black","AUTO"] );
    data.push( [2010,"SE",13350,16573,"Blue","AUTO"] );
    data.push( [2009,"SES",12999,32403,"Blue","AUTO"] );
    data.push( [2009,"SE",12998,34846,"Blue","AUTO"] );
    data.push( [2007,"SE",12997,39665,"Red","AUTO"] );
    data.push( [2010,"SE",12995,21325,"Black","AUTO"] );
    data.push( [2010,"SE",12995,32743,"Black","MANUAL"] );
    data.push( [2010,"SE",12995,40058,"White","MANUAL"] );
    data.push( [2009,"SE",12995,42325,"Blue","AUTO"] );
    data.push( [2009,"SE",12995,44518,"Red","AUTO"] );
    data.push( [2009,"SE",12995,53902,"Gray","AUTO"] );
    data.push( [2008,"SE",12995,127327,"Red","AUTO"] );
    data.push( [2009,"SE",12992,27136,"Gray","AUTO"] );
    data.push( [2009,"SES",12990,45813,"Silver","AUTO"] );
    data.push( [2009,"SE",12988,31538,"Gray","AUTO"] );
    data.push( [2010,"SE",12849,29517,"Silver","AUTO"] );
    data.push( [2010,"SE",12780,35871,"Black","AUTO"] );
    data.push( [2008,"SE",12777,49787,"Black","MANUAL"] );
    data.push( [2008,"SES",12704,36323,"Blue","AUTO"] );
    data.push( [2009,"SES",12595,39211,"Blue","AUTO"] );
    data.push( [2009,"SE",12507,44789,"Gray","AUTO"] );
    data.push( [2008,"SE",12500,45996,"White","MANUAL"] );
    data.push( [2009,"SE",12500,54988,"White","MANUAL"] );
    data.push( [2009,"SE",12280,29288,"Red","AUTO"] );
    data.push( [2009,"SE",11999,36124,"Blue","AUTO"] );
    data.push( [2009,"SE",11992,32559,"Black","MANUAL"] );
    data.push( [2009,"SES",11984,59048,"Black","AUTO"] );
    data.push( [2009,"SE",11980,55170,"Red","AUTO"] );
    data.push( [2010,"SE",11792,39722,"Green","AUTO"] );
    data.push( [2008,"SE",11754,38286,"Black","AUTO"] );
    data.push( [2008,"SES",11749,57341,"Red","AUTO"] );
    data.push( [2008,"SES",11495,82221,"Silver","AUTO"] );
    data.push( [2008,"SE",11450,85229,"Red","MANUAL"] );
    data.push( [2009,"SES",10995,42834,"Red","AUTO"] );
    data.push( [2005,"SES",10995,69415,"Blue","AUTO"] );
    data.push( [2009,"SEL",10995,78264,"Gray","AUTO"] );
    data.push( [2009,"SE",10979,60709,"Red","AUTO"] );
    data.push( [2008,"SE",10955,39643,"Gray","AUTO"] );
    data.push( [2009,"SE",10955,40180,"Gold","AUTO"] );
    data.push( [2008,"SE",10836,40330,"Green","MANUAL"] );
    data.push( [2007,"SES",10815,77231,"Red","AUTO"] );
    data.push( [2007,"SE",10770,72937,"Silver","MANUAL"] );
    data.push( [2010,"SE",10717,64199,"Black","AUTO"] );
    data.push( [2007,"SES",10000,63926,"Red","AUTO"] );
    data.push( [2007,"SES",9999,74427,"Silver","AUTO"] );
    data.push( [2007,"SES",9999,78948,"Black","MANUAL"] );
    data.push( [2006,"SE",9995,51311,"Silver","AUTO"] );
    data.push( [2008,"SE",9995,95364,"White","AUTO"] );
    data.push( [2008,"SE",9992,74109,"White","AUTO"] );
    data.push( [2007,"SE",9651,63296,"Blue","AUTO"] );
    data.push( [2007,"SES",9000,80605,"Red","AUTO"] );
    data.push( [2006,"SE",8999,49656,"Silver","AUTO"] );
    data.push( [2007,"SE",8996,48652,"Silver","MANUAL"] );
    data.push( [2006,"SE",8800,71331,"White","AUTO"] );
    data.push( [2008,"SE",8495,106171,"Black","AUTO"] );
    data.push( [2008,"SE",8494,68901,"Silver","AUTO"] );
    data.push( [2009,"SE",8480,70036,"White","MANUAL"] );
    data.push( [2007,"SES",7999,81596,"Yellow","MANUAL"] );
    data.push( [2006,"SES",7995,35000,"Black","MANUAL"] );
    data.push( [2006,"SES",7995,97987,"Red","AUTO"] );
    data.push( [2003,"SES",7900,96000,"White","AUTO"] );
    data.push( [2005,"SES",7488,59013,"Red","AUTO"] );
    data.push( [2004,"SE",6999,105714,"Silver","AUTO"] );
    data.push( [2007,"SE",6995,86862,"White","AUTO"] );
    data.push( [2000,"SE",6980,60161,"Green","AUTO"] );
    data.push( [2004,"SES",6980,101130,"Gray","AUTO"] );
    data.push( [2004,"SES",6950,119720,"Black","AUTO"] );
    data.push( [2006,"SES",6200,95000,"Silver","AUTO"] );
    data.push( [2002,"SE",5995,87003,"Red","AUTO"] );
    data.push( [2000,"SE",5980,96841,"Red","AUTO"] );
    data.push( [2001,"SE",4899,151479,"Yellow","AUTO"] );
    data.push( [2000,"SE",3800,109259,"Red","AUTO"] );

    __table.fromArray( data, types );
    
    // approximate quartiles of car prices 
    var q = __table.get_quantiles("price", 0.25);
    console.log( "Price quartiles: [3800, 10995, 13951.5, 14904.5, 21992]", q );
    
    var q = __table.get_quantiles("price", 0.2);
    console.log( "Price quintiles: [3800, 10759.4, 12993.8, 13992, 14999, 21992]", q );
    
    var mean = __table.get_mean("price");
    console.log( "Mean of car prices: ", mean );
    
    var std = __table.get_std("price");
    console.log( "Std. dev. of car prices: [3122.48]", std );
    
    var obj = __table.oneWayTable("year");
    var tbl = __table.__tblToArray(obj);
    console.log( "");
    console.log( "one-way table of years" );
    console.log( "Items : ", tbl[0] );
    console.log( "Counts: ", tbl[1] );
    
    // work directly with the return object and get data in percentages
    obj = __table.oneWayTable("color", true);
    console.log( "");
    console.log( "color frequencies as percentages");
    for( var item in obj )
      console.log( item, obj[item] );
    
    console.log( "" );
    console.log( "Cross Table model vs. groups of colors" );
    console.log( "" );
    
    var output = __table.crossTable("model", "color", ["Black Silver White Gray", "Blue Gold Green Red Yellow"], ["Simple-Color", "Bold-Color"] );
      
    console.log( "output: ", output );
    
    // full cross-tabulation #1
    data  = [];
    types = [ __table.CHARACTER, __table.NUMERIC, __table.NUMERIC, __table.NUMERIC ];
    
    data.push( [ "Age", "Digital", "Analog", "Undecided" ] );
    data.push( ["30-", 90, 40, 10] );
    data.push( ["30+", 10, 40, 10] );
    
    __table.fromArray( data, types );
    console.log( "" );
    console.log( "New table, item count: ", __table.get_itemCount() );
    console.log( "" );
    console.log( "CrossTabulation of age vs. watch characteristics" );
    
    output = __table.crossTabulation();
    
    console.log( "output: ", output );
    
    // full cross-tabulation #2 (types remain unchanged)
    data = [];
    
    data.push( [ "City", "Blue Jays", "Red Socks", "Yankees"] );
    data.push( ["Boston", 11, 33, 7] );
    data.push( ["Montreal", 23, 14, 9] );
    data.push( ["Montpellier", 22, 13, 14] );
    
    __table.fromArray( data, types );
    console.log( "" );
    console.log( "CrossTabulation of city vs. baseball teams" );
    
    output = __table.crossTabulation();
   
    console.log( "Table degrees of freedom: ", output.df );
    console.log( "Total chi-squared: ", output.chi2 );
    console.log( "Q-value: ", output.q );
    
    // full-cross tabulation is computed column-major, so process the output by columns, but display it row-major
    var i, j;
    var theTable = output.table;
    var rows     = theTable.length;
    var columns  = theTable[0].length;
    
    // display categories (1st column is the independent variable)
    var categories = __table.get_categories();
    categories     = categories.slice(1, categories.length);
    console.log( categories );

    var row;
    for( i=0; i<rows; ++i )
    {
      row = [];
      for( j=0; j<columns; ++j )
        row.push( theTable[j][i] );
      
      console.log( row );
    }
   
  };
  
});