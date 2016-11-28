/*
 * Supporting script for clock time. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../abstractModels/ClockTimeModel'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  ClockTimeModule         // ClockTimeModel
                  )
{
  $( document ).ready( onPageLoaded );
  
  
  function onPageLoaded()
  {
    var IS_24_HOUR  = true;
    var NOT_24_HOUR = false;
    var AM          = true;
    var PM          = false;
    
    var clockModelRef = new ClockTimeModule();
    var __myModel     = new clockModelRef.ClockTimeModel();
    
    // update
    __myModel.set_is24Hour(false);
    __myModel.update(3, 45, 02, AM);
    console.log( "is24Hour false, 3:45:02 AM", __myModel.toString() );
  
    __myModel.update(12, 35, 52, AM );
    console.log( "is24Hour false, 12:35:52 AM", __myModel.toString() );
    
    __myModel.update( 12, 8, 0, PM );
    console.log( "is24Hour false, 12:08 PM", __myModel.toString() );
    
    __myModel.update( 13, 35, 52, PM );
    console.log( "is24Hour false, 13:35:52 PM", __myModel.toString() );
    
    // parse, no period (24-hour time)
    __myModel.set_is24Hour(true);
    __myModel.update(3, 45, 2 );
    console.log( "(24-hour format), 3:45:02", __myModel.toString() );
    
    __myModel.update( 12, 35, 52 );
    console.log( "(24-hour format), 12:35:52", __myModel.toString() );
    
    __myModel.update( 0, 35, 7 );
    console.log( "(24-hour format) 00:35:07", __myModel.toString() );
    
    console.log( "value", __myModel.get_value() );
  
    // elapsed time tests
    __myModel.set_is24Hour(false);
    console.log( "  elapsed time tests using period time" );
    
    __myModel.update(11, 23, 0, true);
    var clock2 = new clockModelRef.ClockTimeModel();
    clock2.create(6, 52, 0, NOT_24_HOUR, PM);
    
    console.log( "clock 1 time:", __myModel.toString(), "clock 2 time", clock2.toString() );
    console.log( "   elapsed hours:", __myModel.get_elapsedHours(clock2) );
    console.log( "   elapsed min  :", __myModel.get_elapsedMinutes(clock2) );
    console.log( "   elapsed sec  :", __myModel.get_elapsedSeconds(clock2) );
    
    __myModel.update(10, 53, 0, AM);
    clock2 = new clockModelRef.ClockTimeModel();
    clock2.create(3, 57, 0, NOT_24_HOUR, PM);
    
    console.log( "clock 1 time:", __myModel, "clock 2 time", clock2.toString()  );
    console.log( "   elapsed hours:", __myModel.get_elapsedHours(clock2) );
    console.log( "   elapsed min  :", __myModel.get_elapsedMinutes(clock2) );
    console.log( "   elapsed sec  :", __myModel.get_elapsedSeconds(clock2) );
    
    clock2 = new clockModelRef.ClockTimeModel();
    clock2.create(3, 33, 0, NOT_24_HOUR, PM);
    
    console.log( "clock 1 time:", __myModel.toString(), "clock 2 time", clock2.toString() );
    console.log( "   elapsed hours:", __myModel.get_elapsedHours(clock2) );
    console.log( "   elapsed min  :", __myModel.get_elapsedMinutes(clock2) );
    console.log( "   elapsed sec  :", __myModel.get_elapsedSeconds(clock2) );
    
    __myModel.update(12, 50, 0, AM);
    clock2.create(12, 34, 0, NOT_24_HOUR, PM);
    
    console.log( "clock 1 time:", __myModel.toString() , "clock 2 time", clock2.toString() );
    console.log( "   elapsed hours:", __myModel.get_elapsedHours(clock2) );
    console.log( "   elapsed min  :", __myModel.get_elapsedMinutes(clock2) );
    console.log( "   elapsed sec  :", __myModel.get_elapsedSeconds(clock2) );
    
    __myModel.update(3, 42, 0, PM);
    clock2.create(6, 18, 0, NOT_24_HOUR, AM);
    
    console.log( "clock 1 time:", __myModel.toString() , "clock 2 time", clock2.toString() );
    console.log( "   elapsed hours:", __myModel.get_elapsedHours(clock2) );
    console.log( "   elapsed min  :", __myModel.get_elapsedMinutes(clock2) );
    console.log( "   elapsed sec  :", __myModel.get_elapsedSeconds(clock2) );
    
    __myModel.update(12, 0, 0, PM);
    clock2.create(12, 0, 0, NOT_24_HOUR, PM);
    
    console.log( "clock 1 time:", __myModel.toString() , "clock 2 time", clock2.toString() );
    console.log( "   elapsed hours:", __myModel.get_elapsedHours(clock2) );
    console.log( "   elapsed min  :", __myModel.get_elapsedMinutes(clock2) );
    console.log( "   elapsed sec  :", __myModel.get_elapsedSeconds(clock2) );
    
    __myModel.update(12, 0, 0, PM);
    clock2.create(12, 0, 0, NOT_24_HOUR, AM);
    
    console.log( "clock 1 time:", __myModel.toString() , "clock 2 time", clock2.toString() );
    console.log( "   elapsed hours:", __myModel.get_elapsedHours(clock2) );
    console.log( "   elapsed min  :", __myModel.get_elapsedMinutes(clock2) );
    console.log( "   elapsed sec  :", __myModel.get_elapsedSeconds(clock2) );

    __myModel.set_is24Hour(true);
    console.log( "  elapsed time tests using 24-hour time" );
    
    __myModel.update(19, 17, 20);
    clock2.update(22, 31, 0);
    
    console.log( "clock 1 time:", __myModel.toString() , "clock 2 time", clock2.toString() );
    console.log( "   elapsed hours:", __myModel.get_elapsedHours(clock2) );
    console.log( "   elapsed min  :", __myModel.get_elapsedMinutes(clock2) );
    console.log( "   elapsed sec  :", __myModel.get_elapsedSeconds(clock2) );
    
    __myModel.update(10, 20);
    clock2.update(22, 04, 0);
    
    console.log( "clock 1 time:", __myModel.toString() , "clock 2 time", clock2.toString() );
    console.log( "   elapsed hours:", __myModel.get_elapsedHours(clock2) );
    console.log( "   elapsed min  :", __myModel.get_elapsedMinutes(clock2) );
    console.log( "   elapsed sec  :", __myModel.get_elapsedSeconds(clock2) );
    
    __myModel.set_is24Hour(false);
    clock2.set_is24Hour(true);
    console.log( "  addition test" );
    __myModel.update(10, 13, 0, AM);
    clock2.update(2, 11, 0);
    
    console.log( "add 2:11 to 10:13 AM:", __myModel.add(clock2).toString() );
    
    __myModel.set_is24Hour(true);
    clock2.set_is24Hour(true);
    console.log( "  addition test, 24-hour" );
    __myModel.update(12, 53, 0);
    clock2.update(8, 22, 0);
    
    console.log( "add 8:22 to 12:53 (21:15:00):", __myModel.add(clock2).toString() );
    
    __myModel.set_is24Hour(false);
    clock2.set_is24Hour(true);
    console.log( "  addition test, period time" );
    __myModel.update(10, 20, 0, PM);
    clock2.update(6, 18, 0);
    
    var clock3 = __myModel.add(clock2);
    clock3.set_is24Hour(false);
    console.log( "add 6:18 to 10:20 PM (4:38 AM):", clock3.toString() );
    
    __myModel.set_is24Hour(false);
    clock2.set_is24Hour(true);
    console.log( "  addition test, period time" );
    __myModel.update(12, 31, 0, AM);
    clock2.update(1, 29, 0);
    
    clock3 = __myModel.add(clock2);
    clock3.set_is24Hour(false);
    console.log( "add 1:29 to 12:31 PM (2:00 AM):", clock3.toString()  );
    
    __myModel.set_is24Hour(true);
    clock2.set_is24Hour(true);
    console.log( "  addition test, 24-hour" );
    __myModel.update(0, 31, 0);
    clock2.update(1, 29, 0);
    
    console.log( "add 1:29 to 12:31 PM (0:2:00):", __myModel.add(clock2).toString() );
    
    __myModel.set_is24Hour(false);
    clock2.set_is24Hour(true);
    console.log( "  subtraction test, period time" );
    __myModel.update(6, 31, 0, AM);
    clock2.update(1, 18, 0);
    
    console.log( "subract 1:18 from 6:31 AM (5:13:00):", __myModel.subtract(clock2).toString() );
    
    __myModel.set_is24Hour(false);
    clock2.set_is24Hour(true);
    console.log( "  subtraction test, period time" );
    __myModel.update(12, 45, 0, PM);
    clock2.update(5, 51, 0);
    
    console.log( "subract 5:51 from 12:45 PM (6:54:00):", __myModel.subtract(clock2).toString() );
    
    __myModel.set_is24Hour(false);
    clock2.set_is24Hour(true);
    console.log( "  subtraction test, period time" );
    __myModel.update(12, 45, 0, PM);
    clock2.update(5, 51, 0);
    
    console.log( "subract 5:51 from 12:45 PM (6:54:00):", __myModel.subtract(clock2).toString() );
    
    __myModel.set_is24Hour(false);
    clock2.set_is24Hour(true);
    console.log( "  subtraction test, period time" );
    __myModel.update(5, 51, 0, AM);
    clock2.update(8, 22, 0);
    
    console.log( "subract 8:22 from 5:51 AM (21:29:00):", __myModel.subtract(clock2).toString() );
  };
  
});