/*
	Daniel Hackenberger
	test test test
	*/

document.ontouchmove = function(e){ e.preventDefault(); }
var PFTRecord = []; //Initialize Record Log
var PFTScores = []; //Initialize Score Log	
var CFTRecord = []; //Initialize CFT record log
var CFTScores = []; //Initialize CFT Score log
var weightRecord = []; //Initialize Weight Log
$(document).ready(function(){
	
	if(localStorage.getItem('record')){
		PFTRecord = JSON.parse(localStorage.getItem('record')); //Load Event Records
	}
	if(localStorage.getItem('scores')){
		PFTScores = JSON.parse(localStorage.getItem('scores')); //Load Scores
	} 
	if(localStorage.getItem('weight')){
		weightRecord = JSON.parse(localStorage.getItem('weight')); //Load Weight Log
	}
	if(localStorage.getItem('CFTrecord')){
		CFTRecord = JSON.parse(localStorage.getItem('CFTrecord')); // load CFT Records
	}
	if(localStorage.getItem('CFTscores')){
		CFTScores = JSON.parse(localStorage.getItem('CFTscores')); // load cft scores
	}
	
	document.getElementById("Date").valueAsDate = new Date(); // Initialize date in as today's date for new PFT
	document.getElementById("CFTDate").valueAsDate = new Date(); // Initialize date in as today's date for new CFT
	document.getElementById("WeightDate").valueAsDate = new Date(); // Initialize date in as today's date for new weighin
	document.getElementById("Abdomen").value = 0; //Initialize Abdomen to 0
	document.getElementById("Neck").value = 0; //Initialize Neck to 0
	document.getElementById("Hip").value = 0; //Initialize Hip to 0 to prevent null values on initial startup
	for( var i = 0; i < PFTRecord.length; i++ ) { //add records to PFTLog screen
		initialadditem(PFTRecord[i], PFTScores[i]);		
		$('#Log').listview('refresh');
	}
	for( var i = 0; i < weightRecord.length; i++) {
		initialaddWeighIn(weightRecord[i]);
		$('#WLog').listview('refresh');
	}
	for ( var i = 0;i<CFTRecord.length; i++ ) {
		CFTinitialadditem(CFTRecord[i], CFTScores[i]);
		$('#CFTLog').listview('refresh');
	}
	
	
	$('#clear').tap(function(){ 
		//Listens for tap on the "clear" button.  Calls to Clear the entries in new PFT
		clearPFT();		
	});
	$('#CFTclear').tap(function(){
		//Listens for tap on the "clear" button on the CFT screen.  Calls to clear the entires in the new CFTDate
		clearCFT();
	});
	
	$('#clearWeight').tap(function(){
		clearWeight();
	});
	
	$('#saveWeight').tap(function(){

		var height = $('#Height').val();
		var weight = $('#Weight').val();
		var WeighinDate = $('#WeightDate').val();
		var WGender = $('#WeightGender').val();
		var abdomen = $('#Abdomen').val();
		var neck = $('#Neck').val();
		var hip = $('#Hip').val();
		
		clearWeight();
		
		var id = new Date().getTime();
		var minWeight = getWeightMin(height);
		var maxWeight = getWeightMax(WGender, height);
		var CValue = getCValue(WGender, abdomen, neck, hip);
		
		var bodyFat = getBodyFat(CValue, height, WGender);
		
		var weighinData = {id:id, height:height, weight:weight,WeighinDate:WeighinDate,WGender:WGender,minWeight:minWeight,maxWeight:maxWeight, bodyFat:bodyFat, abdomen:abdomen, neck:neck, hip:hip};
		
		weightRecord.push(weighinData);
		addWeighIn(weighinData);
		saveWeighin(weightRecord);
		
	});
	$('#save').tap(function(){
		//Listens for save button to be pushed - Save the entries as a new entry in the log, update global records, save items to local storage
		var Pull = $('#PullUps').val();
		var Push = $('#PushUps').val();
		var Crunch = $('#Crunches').val();
		var RunMin = $('#RunTimeMinutes').val();
		var RunSec = $('#RunTimeSeconds').val();
		var PFTDateRan = $('#Date').val();
		
		var elevation = false;
		
		if ($('#Elevation').is(':checked'))
		{
			elevation = true;
		}
					
		var Gender = $('#Gender').val();
		var AgeGroup = $('#AgeGroup').val();
		
		clearPFT();
		
		var id = new Date().getTime();
		var recorddata = {id:id, elevation:elevation, Pull:Pull,Push:Push,Crunch:Crunch,RunMin:RunMin,RunSec:RunSec,PFTDateRan:PFTDateRan, Gender:Gender, AgeGroup:AgeGroup };
	
		PFTRecord.push(recorddata);
		var PFTData = CalculateScore(recorddata);
		additem(recorddata, PFTData);		
		saveitems(PFTRecord);

	});
	$('#CFTsave').tap(function(){
		//Listens for save button to be pushed - Save the entries as a new entry in the log, update global records, save items to local storage
		var ACL = $('#ACL').val();
		var MTCMin = $('#MTCMin').val();
		var MTCSec = $('#MTCSec').val();
		var MUFMin = $('#MUFMin').val();
		var MUFSec = $('#MUFSec').val();
		var CFTDateRan = $('#CFTDate').val();
		
		var elevation = false;
		
		if ($('#CFTElevation').is(':checked'))
		{
			elevation = true;
		}
					
		var CFTGender = $('#CFTGender').val();
		var CFTAgeGroup = $('#CFTAgeGroup').val();
		
		clearCFT();
		
		var CFTid = new Date().getTime();
		var CFTrecorddata = {CFTid:CFTid, elevation:elevation, ACL:ACL, MTCMin:MTCMin, MTCSec:MTCSec, MUFMin:MUFMin, MUFSec:MUFSec,CFTDateRan:CFTDateRan, CFTGender:CFTGender, CFTAgeGroup:CFTAgeGroup };
	
		CFTRecord.push(CFTrecorddata);
		var CFTData = CalculateCFTScore(CFTrecorddata); //this initializes the scores for each event
		
		CFTadditem(CFTrecorddata, CFTData);		
		CFTsaveitems(CFTRecord);

	});
});
	



function getCValue(gender, abdomen, neck, hip)
{
	var value = 0;
	switch( gender ){
		case "Male":
			value = abdomen - neck; 
			break;
		case "Female":
			value =  +abdomen + +hip - +neck; 
			//value = value - neck;  //females are hip + abdomen - neck
			break;
	}
	return value;
}

function getBodyFat(Circumfrence, Height, Gender)
{
		var fat = 0;
	switch( Gender ){
		case "Male":
		var maleMatrix = ([
			[9 , 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//13.5
			[11,11,10,10,10,10, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//14			
			[12,12,12,11,11,11,11,10,10,10,10, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//14.5
			[13,13,13,13,12,12,12,12,11,11,11,11,10,10,10,10,10, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//15
			[15,14,14,14,14,13,13,13,13,12,12,12,12,11,11,11,11,11,10,10,10,10, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//15.5
			[16,16,15,15,15,15,14,14,14,14,13,13,13,13,12,12,12,12,12,11,11,11,11,10,10,10,10,10, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//16
			[17,17,16,16,16,16,15,15,15,15,14,14,14,14,14,13,13,13,13,12,12,12,12,12,11,11,11,11,11,10,10,10,10,10, 9, 9, 0, 0, 0, 0],//16.5
			[18,18,18,17,17,17,17,16,16,16,16,15,15,15,15,14,14,14,14,14,13,13,13,13,13,12,12,12,12,11,11,11,11,11,10,10,10,10,10, 9],//17
			[19,19,19,18,18,18,18,17,17,17,17,16,16,16,16,16,15,15,15,15,14,14,14,14,14,13,13,13,13,13,12,12,12,12,12,11,11,11,11,11],//17.5
			[20,20,20,19,19,19,19,18,18,18,18,18,17,17,17,17,16,16,16,16,15,15,15,15,15,14,14,14,14,14,13,13,13,13,13,12,12,12,12,12],//18
			[21,21,21,20,20,20,20,19,19,19,19,19,18,18,18,18,17,17,17,17,17,16,16,16,16,15,15,15,15,15,14,14,14,14,14,13,13,13,13,13],//18.5
			[22,22,22,21,21,21,21,20,20,20,20,20,19,19,19,19,18,18,18,18,18,17,17,17,17,16,16,16,16,16,15,15,15,15,15,14,14,14,14,14],//19
			[23,23,23,22,22,22,22,21,21,21,21,21,20,20,20,20,19,19,19,19,18,18,18,18,18,17,17,17,17,17,16,16,16,16,16,15,15,15,15,15],//19.5
			[24,24,24,23,23,23,23,22,22,22,22,21,21,21,21,21,20,20,20,20,19,19,19,19,19,18,18,18,18,18,17,17,17,17,17,16,16,16,16,16],//20
			[25,25,25,24,24,24,24,23,23,23,23,22,22,22,22,21,21,21,21,21,20,20,20,20,19,19,19,19,19,18,18,18,18,18,17,17,17,17,17,16],//20.5
			[26,26,25,25,25,25,24,24,24,24,24,23,23,23,23,22,22,22,22,21,21,21,21,21,20,20,20,20,20,19,19,19,19,19,18,18,18,18,18,17],//21
			[27,27,26,26,26,26,25,25,25,25,24,24,24,24,23,23,23,23,23,22,22,22,22,21,21,21,21,21,20,20,20,20,20,19,19,19,19,19,18,18],//21.5
			[28,27,27,27,27,26,26,26,26,25,25,25,25,25,24,24,24,24,23,23,23,23,23,22,22,22,22,22,21,21,21,21,20,20,20,20,20,20,19,19],//22
			[29,28,28,28,28,27,27,27,27,26,26,26,26,25,25,25,25,24,24,24,24,24,23,23,23,23,23,22,22,22,22,22,21,21,21,21,21,20,20,20],//22.5
			[29,29,29,29,28,28,28,28,27,27,27,27,26,26,26,26,26,25,25,25,25,24,24,24,24,24,23,23,23,23,23,22,22,22,22,22,21,21,21,21],//23
			[30,30,30,29,29,29,29,28,28,28,28,27,27,27,27,27,26,26,26,26,25,25,25,25,25,24,24,24,24,24,23,23,23,23,23,22,22,22,22,22],//23.5
			[31,31,30,30,30,30,29,29,29,29,28,28,28,28,28,27,27,27,27,26,26,26,26,26,25,25,25,25,25,24,24,24,24,24,23,23,23,23,23,22],//24
			[32,31,31,31,31,30,30,30,30,29,29,29,29,29,28,28,28,28,27,27,27,27,27,26,26,26,26,26,25,25,25,25,25,24,24,24,24,24,23,23],//24.5
			[32,32,32,32,31,31,31,31,30,30,30,30,30,29,29,29,29,28,28,28,28,28,27,27,27,27,26,26,26,26,26,25,25,25,25,25,24,24,24,24],//25
			[33,33,33,32,32,32,32,31,31,31,31,31,30,30,30,30,29,29,29,29,29,28,28,28,28,27,27,27,27,27,26,26,26,26,26,25,25,25,25,25],//25.5
			[34,34,33,33,33,33,32,32,32,32,31,31,31,31,31,30,30,30,30,29,29,29,29,29,28,28,28,28,28,27,27,27,27,27,26,26,26,26,26,25],//26
			[35,34,34,34,34,33,33,33,33,32,32,32,32,32,31,31,31,31,30,30,30,30,30,29,29,29,29,28,28,28,28,28,27,27,27,27,27,26,26,26],//26.5
			[35,35,35,35,34,34,34,34,33,33,33,33,32,32,32,32,32,31,31,31,31,30,30,30,30,30,29,29,29,29,29,28,28,28,28,28,27,27,27,27],//27
			[36,36,36,35,35,35,35,34,34,34,34,33,33,33,33,32,32,32,32,32,31,31,31,31,30,30,30,30,30,29,29,29,29,29,28,28,28,28,28,27],//27.5
			[37,36,36,36,36,35,35,35,35,34,34,34,34,34,33,33,33,33,32,32,32,32,32,31,31,31,31,31,30,30,30,30,29,29,29,29,29,29,28,28],//28
			[0 , 0,37,37,36,36,36,36,35,35,35,35,34,34,34,34,34,33,33,33,33,32,32,32,32,32,31,31,31,31,31,30,30,30,30,30,29,29,29,29],//28.5
			[0 , 0, 0 ,0,37,37,37,36,36,36,36,35,35,35,35,34,34,34,34,34,33,33,33,33,32,32,32,32,32,31,31,31,31,31,30,30,30,30,30,29],//29
			[0 , 0, 0, 0, 0, 0, 0,37,37,36,36,36,36,36,35,35,35,35,34,34,34,34,34,33,33,33,33,32,32,32,32,32,31,31,31,31,31,30,30,30],//29.5
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,36,36,36,36,35,35,35,35,35,34,34,34,34,34,33,33,33,33,32,32,32,32,32,31,31,31,31,31],//30
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,37,36,36,36,36,35,35,35,35,35,34,34,34,34,34,33,33,33,33,32,32,32,32,32,32,31],//30.5
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,36,36,36,36,36,35,35,35,35,35,34,34,34,34,33,33,33,33,33,33,32,32,32],//31
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,36,36,36,36,36,35,35,35,35,35,34,34,34,34,33,33,33,33,33,33],//31.5
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,37,36,36,36,36,36,35,35,35,35,34,34,34,34,34,33,33,33],//32
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,36,36,36,36,36,35,35,35,35,35,34,34,34,34,34],//32.5
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,36,36,36,36,36,35,35,35,35,35,34,34],//33
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,36,36,36,36,36,35,35,35,35],//33.5
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,37,36,36,36,36,36,35],//34
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,37,36,36,36],//34.5
			[0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37,37,36]//35
			
			
		]);
		Height = (Height - 60)*2;
		Circumfrence = (Circumfrence - 13.5)*2;
		
		if (Circumfrence > 43)
			fat = "Circumference too large for table"; 
		else if (Height < 0)
			fat = "Too short for table"; 
		else if (Height > 39)
			fat = "Too tall for table";
		else if (Circumfrence < 0 )
			fat = "Circumference value does not fall on table"; 	
		else if((Height>=0) && (Circumfrence >=0))
			fat = maleMatrix[Circumfrence][Height];
		else 
			fat = 102; // I don't know
		break;
			
		case "Female":
			var femaleMatrix = ([
			[19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//45
			[20,20,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//45.5	
			[21,20,20,20,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//46
			[21,21,21,20,20,20,19,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//46.5
			[22,22,22,21,21,20,20,20,19,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//47  
			[23,23,22,22,22,21,21,21,20,20,19,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//47.5
			[24,23,23,23,22,22,22,21,21,21,20,20,20,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//48  
			[24,24,24,23,23,23,22,22,22,21,21,21,20,20,20,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//48.5
			[25,25,24,24,24,23,23,23,22,22,22,21,21,21,20,20,20,19,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//49/
			[26,26,25,25,24,24,24,23,23,23,22,22,22,21,21,21,20,20,20,19,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//49.5
			[27,26,26,26,25,25,24,24,24,23,23,23,22,22,22,21,21,21,21,20,20,20,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//50
			[27,27,27,26,26,26,25,25,25,24,24,23,23,23,23,22,22,22,21,21,21,20,20,20,19,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//50.5
			[28,28,27,27,27,26,26,26,25,25,25,24,24,24,23,23,23,22,22,22,21,21,21,20,20,20,19,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//51
			[29,28,28,28,27,27,27,26,26,26,25,25,25,24,24,24,23,23,23,22,22,22,21,21,21,20,20,20,20,19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//51.5
			[29,29,29,28,28,28,27,27,27,26,26,26,25,25,25,24,24,24,23,23,23,22,22,22,21,21,21,21,20,20,20,19,19, 0, 0, 0, 0, 0, 0, 0],//52
			[30,30,29,29,29,28,28,28,27,27,27,26,26,26,25,25,25,24,24,24,23,23,23,22,22,22,22,21,21,21,20,20,20,19,19, 0, 0, 0, 0, 0],//52.5
			[31,30,30,30,29,29,29,28,28,28,27,27,27,26,26,26,25,25,25,24,24,24,23,23,23,22,22,22,22,21,21,21,20,20,20,20,19,19, 0, 0],//53
			[31,31,31,30,30,30,29,29,29,28,28,28,27,27,27,26,26,26,25,25,25,24,24,24,23,23,23,23,22,22,22,21,21,21,21,20,20,20,19,19],//53.5
			[32,32,31,31,31,30,30,30,29,29,29,28,28,28,27,27,27,26,26,26,25,25,25,24,24,24,24,23,23,23,22,22,22,21,21,21,21,20,20,20],//54
			[33,32,32,32,31,31,31,30,30,30,29,29,29,28,28,28,27,27,27,26,26,26,25,25,25,24,24,24,24,23,23,23,22,22,22,22,21,21,21,20],//54.5
			[33,33,33,32,32,32,31,31,31,30,30,30,29,29,29,28,28,28,27,27,27,26,26,26,25,25,25,25,24,24,24,23,23,23,22,22,22,22,21,21],//55
			[34,34,33,33,33,32,32,32,31,31,31,30,30,30,29,29,29,28,28,28,27,27,27,26,26,26,25,25,25,25,24,24,24,23,23,23,23,22,22,22],//55.5
			[35,34,34,34,33,33,33,32,32,31,31,31,30,30,30,30,29,29,29,28,28,28,27,27,27,26,26,26,25,25,25,25,24,24,24,23,23,23,23,22],//56
			[35,35,35,34,34,34,33,33,32,32,32,31,31,31,30,30,30,29,29,29,29,28,28,28,27,27,27,26,26,26,26,25,25,25,24,24,24,24,23,23],//56.5
			[36,36,35,35,34,34,34,33,33,33,32,32,32,31,31,31,30,30,30,29,29,29,29,28,28,28,27,27,27,26,26,26,26,25,25,25,24,24,24,24],//57
			[37,36,36,35,35,35,34,34,34,33,37,36,36,35,35,35,34,34,34,33,30,29,29,29,29,28,28,28,27,27,27,26,26,26,26,25,25,25,25,24],//57.5
			[37,37,36,36,36,35,35,35,34,34,34,33,33,33,32,32,32,31,31,31,30,30,30,29,29,29,29,28,28,28,27,27,27,27,26,26,26,25,25,25],//58
			[38,37,37,37,36,36,36,35,35,35,34,34,34,33,33,33,32,32,32,31,31,31,30,30,30,29,29,29,29,28,28,28,27,27,27,27,26,26,26,25],//58.5
			[38,38,38,37,37,37,36,36,36,35,35,35,34,34,34,33,33,33,32,32,32,31,31,31,30,30,30,29,29,29,29,28,28,28,27,27,27,27,26,26],//59
			[39,39,38,38,38,37,37,36,36,36,35,35,35,34,34,34,33,33,33,33,32,32,32,31,31,31,30,30,30,29,29,29,29,28,28,28,27,27,27,27],//59.5
			[40,39,39,38,38,38,37,37,37,36,36,36,35,35,35,34,34,34,33,33,33,32,32,32,32,31,31,31,30,30,30,30,29,29,29,28,28,28,28,27],//60
			[40,40,39,39,39,38,38,38,37,37,37,36,36,36,35,35,35,34,34,34,33,33,33,32,32,32,32,31,31,31,30,30,30,30,29,29,29,28,28,28],//60.5
			[41,40,40,40,39,39,39,38,38,38,37,37,37,36,36,36,35,35,35,34,34,34,33,33,33,32,32,32,32,31,31,31,30,30,30,30,29,29,29,28],//61
			[41,41,41,40,40,40,39,39,38,38,38,37,37,37,36,36,36,36,35,35,35,34,34,34,33,33,33,32,32,32,32,31,31,31,30,30,30,30,29,29],//61.5
			[42,42,41,41,40,40,40,39,39,39,38,38,38,37,37,37,36,36,36,35,35,35,35,34,34,34,33,33,33,32,32,32,32,31,31,31,30,30,30,30],//62
			[42,42,42,41,41,41,40,40,40,39,39,39,38,38,38,37,37,37,36,36,36,35,35,35,34,34,34,34,33,33,33,32,32,32,32,31,31,31,30,30],//62.5
			[43,43,42,42,42,41,41,41,40,40,40,39,39,39,38,38,38,37,37,37,36,36,36,35,35,35,34,34,34,34,33,33,33,32,32,32,32,31,31,31],//63
			[44,43,43,42,42,42,41,41,41,40,40,40,39,39,39,38,38,38,37,37,37,37,36,36,36,35,35,35,34,34,34,34,33,33,33,32,32,32,32,31],//63.5
			[44,44,43,43,43,42,42,42,41,41,41,40,40,40,39,39,39,38,38,38,37,37,37,36,36,36,36,35,35,35,34,34,34,34,33,33,33,32,32,32],//64
			[45,44,44,44,43,43,43,42,42,42,41,41,41,40,40,40,39,39,39,38,38,38,37,37,37,36,36,36,36,35,35,35,34,34,34,33,33,33,33,32],//64.5
			[45,45,45,44,44,43,43,43,42,42,42,41,41,41,40,40,40,39,39,39,38,38,38,38,37,37,37,36,36,36,35,35,35,35,34,34,34,33,33,33],//65
			[46,45,45,45,44,44,44,43,43,43,42,42,42,41,41,41,40,40,40,39,39,39,38,38,38,37,37,37,37,36,37,37,37,36,36,36,35,35,35,35],//65.5
			[ 0, 0,47,46,46,46,45,45,45,44,44,44,43,43,43,42,42,42,41,41,41,40,40,40,39,39,39,39,38,38,38,37,37,37,36,36,36,36,35,35],//67 
			[ 0, 0, 0,47,46,46,46,45,45,45,44,44,44,43,43,43,42,42,42,41,41,41,41,40,40,40,39,39,39,38,38,38,38,37,37,37,36,36,36,36],//67.5	
			[ 0, 0, 0, 0,47,47,46,46,46,45,45,45,44,44,44,43,43,43,42,42,42,41,41,41,40,40,40,40,39,39,39,38,38,38,38,37,37,37,36,36],//68
			[ 0, 0, 0, 0, 0, 0,47,46,46,46,45,45,45,44,44,44,43,43,43,43,42,42,42,41,41,41,40,40,40,39,39,39,39,38,38,38,37,37,37,37],//68.5
			[ 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45,45,45,44,44,44,43,43,43,42,42,42,41,41,41,41,40,40,40,39,39,39,39,38,38,38,37,37],//69  
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0,47,46,46,46,45,45,45,44,44,44,44,43,43,43,42,42,42,41,41,41,41,40,40,40,39,39,39,39,38,38,38],//69.5
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45,45,45,44,44,44,43,43,43,43,42,42,42,41,41,41,40,40,40,40,39,39,39,38,38],//70  
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,46,46,46,46,45,45,45,44,44,44,43,43,43,42,42,42,42,41,41,41,40,40,40,40,39,39,39],//70.5
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45,45,45,44,44,44,44,43,43,43,42,42,42,41,41,41,41,40,40,40,39,39],//71
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45,45,45,44,44,44,43,43,43,43,42,42,42,41,41,41,41,40,40,40],//71.5
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45,45,45,45,44,44,44,43,43,43,42,42,42,42,41,41,41,40,40],//72
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45,45,45,44,44,44,44,43,43,43,42,42,42,42,41,41,41],//72.5
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,46,46,46,45,45,45,45,44,44,44,43,43,43,43,42,42,42,41,41],//73
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45,45,45,44,44,44,44,43,43,43,42,42,42,42],//73.5
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,46,46,46,46,45,45,45,44,44,44,44,43,43,43,42,42],//74
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45,45,45,45,44,44,44,43,43,43,43],//74.5
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,46,46,46,46,45,45,45,44,44,44,44,43,43],//75
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,46,45,45,45,44,44,44,44],//75.5
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45,45,45,45,44,44],//76
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,46,46,46,46,45,45,45,44],//76.5
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45,45,45],//77
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46,45],//77.5
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46,46,46],//78
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47,47,46],//78.5
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47]//79		
		]);	
		Height = (Height - 58)*2;
		Circumfrence = (Circumfrence - 45)*2;
		if (Circumfrence > 29)
			fat = "Circumference too large for table"; 
		else if (Height < 0)
			fat = "Too short for table"; 
		else if (Height > 42)
			fat = "Too tall for table";
		else if (Circumfrence < 0 )
			fat = "Circumference value does not fall on table"; 
		else if((Height>=0) && (Circumfrence >=0))
			fat = femaleMatrix[Circumfrence][Height];
		else 
			fat = 102; // I don't know
		
		
		break;
	}

	return fat;
	
}

function getWeightMin(height)
{
	height = Math.ceil(height);
	var Weight = [85,88,91,94,97,100,104,107,110,114,117,121,125,128,132,136,140,144,148,152,156,160,164,168,173,177,182];	
	return Weight[height-56];
}

function getWeightMax(gender, height)
{
	var standard =0;
	var maleWeight = [122,127,131,136,141,145,150,155,160,165,170,175,180,186,191,197,202,208,214,220,225,231,237,244,250,256,263];
	var femaleWeight = [115,120,124,129,133,137,142,146,151,156,161,166,171,176,181,186,191,197,202,208,213,219,225,230,236,242,248];
	height = Math.ceil(height);
	
	switch( gender ){
		case "Male":
			standard = maleWeight[height-56];
		break;
		case "Female":
			standard = femaleWeight[height-56];
		break;
	}
	
	return standard;
}

function clearPFT() {
	//Clears the new PFT log entries and reinitializes the Date as today's date
	$('#PullUps').val('');
	$('#PushUps').val('');
	$('#Crunches').val('');
	$('#RunTimeMinutes').val('');
	$('#RunTimeSeconds').val('');
	document.getElementById("Date").valueAsDate = new Date();
}

function clearCFT() {
	//Clears the new CFT log entries and reinitializes the Date as today's date
	$('#ACL').val('');
	$('#MUFMin').val('');
	$('#MUFSec').val('');
	$('#MTCMin').val('');
	$('#MTCSec').val('');
	document.getElementById("CFTDate").valueAsDate = new Date();
}

function clearWeight() {
	//Clears the new weight log entries and reinitializes the Date as today's date
	$('#Height').val('');
	$('#Weight').val('');
	$('#Abdomen').val('0');
	$('#Neck').val('0');
	$('#Hip').val('0');
	document.getElementById("Date").valueAsDate = new Date();
}
function initialadditem(itemdata, PFTData1) {
	//Requires Results object, and PFT score object.  Adds the loaded items into the log. Need this because listview.('refresh') will not work unless the log is initialized. 
	var item = $('#score_entry').clone(); 
	item.attr({id:itemdata.id});
	
	var displayPFT = "Date: \n" + JSON.stringify(itemdata.PFTDateRan) + 
		" Elevation Adjustment: " + JSON.stringify(itemdata.elevation) +
		" Gender: " + itemdata.Gender + " Age Group: " + itemdata.AgeGroup + 
	    " Pull Ups: " + itemdata.Pull + " Score: \n" + PFTData1.PullScore +
		" Push Ups: " + itemdata.Push + " Score: \n" + PFTData1.PushScore +
		" Crunches: " + itemdata.Crunch + " Score: \n" + PFTData1.CrunchScore + 
		" Run Time: " + itemdata.RunMin + ":" + itemdata.RunSec + " Score: \n" + PFTData1.RunScore +
		" TOTAL SCORE: " + PFTData1.TotalScore + " PFT CLASS: " + PFTData1.PFTClass;
		
	item.find('span.text').text(displayPFT);
	
	var delbutton = $('#delete_entry').clone().show();
	
	item.append(delbutton);
	delbutton.attr('id','delete_'+itemdata.id).tap(function(){
		for( var i = 0; i <PFTRecord.length; i++ ){
			if( itemdata.id == PFTRecord[i].id) {
				PFTRecord.splice(i,1);
				PFTScores.splice(i,1);
			}
		}
		item.remove();
		saveitems(PFTRecord);
		saveScores(PFTScores);
		return false;
	});
	
	item.data('itemdata',itemdata);	
	
	$('#Log').append(item);
}

function CFTinitialadditem(itemdata, CFTData1) {
	//Requires Results object, and PFT score object.  Adds the loaded items into the log. Need this because listview.('refresh') will not work unless the log is initialized. 
	var item = $('#CFTscore_entry').clone(); 
	item.attr({id:itemdata.CFTid});
	
	var displayCFT = "Date: " + JSON.stringify(itemdata.CFTDateRan) +
		" Elevation Adjustment: " + JSON.stringify(itemdata.elevation) +	
		" Gender: " + itemdata.CFTGender + " Age Group: " + itemdata.CFTAgeGroup + 
	    " Movement to Contact: " + itemdata.MTCMin + ":" + itemdata.MTCSec + " Score: " + CFTData1.MTCScore +
		" Ammo Can Lifts: " + itemdata.ACL + " Score: " + CFTData1.ACLScore +
		" Maneuver Under Fire: " + itemdata.MUFMin + ":" + itemdata.MUFSec + " Score: " + CFTData1.MUFScore + 
		" TOTAL SCORE: " + CFTData1.TotalScore + " CFT CLASS: " + CFTData1.CFTClass;
		
	item.find('span.text').text(displayCFT);
	
	var delbutton = $('#delete_entry').clone().show();
	
	item.append(delbutton);
	delbutton.attr('id','delete_'+itemdata.id).tap(function(){
		for( var i = 0; i <CFTRecord.length; i++ ){
			if( itemdata.id == CFTRecord[i].id) {
				CFTRecord.splice(i,1);
				CFTScores.splice(i,1);
			}
		}
		item.remove();
		CFTsaveitems(CFTRecord);
		CFTsaveScores(CFTScores);
		return false;
	});
	
	item.data('itemdata',itemdata);	
	
	$('#CFTLog').append(item);
}

function additem(itemdata, PFTData1) {
	//Requires Results object, and PFT score object.  Adds items to log, saves records to localStorage
	var item = $('#score_entry').clone(); 
	item.attr({id:itemdata.id});
	
	var displayPFT = "Date: " + JSON.stringify(itemdata.PFTDateRan) +
		" Elevation Adjustment: " + JSON.stringify(itemdata.elevation) +	
		" Gender: " + itemdata.Gender + " Age Group: " + itemdata.AgeGroup + 
	    " Pull Ups: " + itemdata.Pull + " Score: " + PFTData1.PullScore +
		" Push Ups: " + itemdata.Push + " Score: " + PFTData1.PushScore +
		" Crunches: " + itemdata.Crunch + " Score: " + PFTData1.CrunchScore + 
		" Run Time: " + itemdata.RunMin + ":" + itemdata.RunSec + " Score: " + PFTData1.RunScore +
		" TOTAL SCORE: " + PFTData1.TotalScore + " PFT CLASS: " + PFTData1.PFTClass;
		
	item.find('span.text').text(displayPFT);	
	var delbutton = $('#delete_entry').clone().show();
	item.append(delbutton);
	delbutton.attr('id','delete_'+itemdata.id).tap(function(){
		for( var i = 0; i <PFTRecord.length; i++ ){
			if( itemdata.id == PFTRecord[i].id) {
				PFTRecord.splice(i,1);
				PFTScores.splice(i,1);
			}
		}
		item.remove();
		saveitems(PFTRecord);
		saveScores(PFTScores);
		return false;
	});
	
	item.data('itemdata',itemdata);	
	$('#Log').append(item).listview('refresh');

}

function CFTadditem(itemdata, CFTData1) {
	//var itemdata = {CFTid:CFTid, elevation:elevation, ACL:ACL, MTCMin:MTCMin, MTCSec:MTCSec, MUFMin:MUFMin, MUFSec:MUFSec,CFTDateRan:CFTDateRan, CFTGender:CFTGender, CFTAgeGroup:CFTAgeGroup };
	var item = $('#CFTscore_entry').clone(); 
	item.attr({id:itemdata.CFTid});
	
	var displayCFT = "Date: " + JSON.stringify(itemdata.CFTDateRan) +
		" Elevation Adjustment: " + JSON.stringify(itemdata.elevation) +	
		" Gender: " + itemdata.CFTGender + " Age Group: " + itemdata.CFTAgeGroup + 
	    " Movement to Contact: " + itemdata.MTCMin + ":" + itemdata.MTCSec + " Score: " + CFTData1.MTCScore +
		" Ammo Can Lifts: " + itemdata.ACL + " Score: " + CFTData1.ACLScore +
		" Maneuver Under Fire: " + itemdata.MUFMin + ":" + itemdata.MUFSec + " Score: " + CFTData1.MUFScore + 
		" TOTAL SCORE: " + CFTData1.TotalScore + " CFT CLASS: " + CFTData1.CFTClass;
		
	item.find('span.text').text(displayCFT);	
	var delbutton = $('#delete_entry').clone().show();
	item.append(delbutton);
	delbutton.attr('id','delete_'+itemdata.id).tap(function(){
		for( var i = 0; i <CFTRecord.length; i++ ){
			if( itemdata.id == CFTRecord[i].id) {
				CFTRecord.splice(i,1);
				CFTScores.splice(i,1);
			}
		}
		item.remove();
		CFTsaveitems(CFTRecord);
		CFTsaveScores(CFTScores);
		return false;
	});
	
	item.data('itemdata',itemdata);	
	$('#CFTLog').append(item).listview('refresh');

}


function addWeighIn(weightData) {
//var weighinData = {id:id, height:height, weight:weight,WeighinDate:WeighinDate,WGender:WGender,minWeight:minWeight,maxWeight:maxWeight, 
// bodyFat:bodyFat, abdomen:abdomen, neck:neck, hip:hip };

	var item = $('#weight_entry').clone(); 
	item.attr({id:weightData.id});
	
	var displayWeighin = "Date: " + JSON.stringify(weightData.WeighinDate) +
		" Gender: " + weightData.WGender + 
	    " Height: " + weightData.height + " Weight: " + weightData.weight +
		" Min Weight: " + weightData.minWeight + " Max Weight: " + weightData.maxWeight +
		" Neck: " + weightData.neck + " Abdomen / Waist: " + weightData.abdomen + 
		" Hip: " + weightData.hip + " Body Fat: " + weightData.bodyFat;
		
		
	item.find('span.text').text(displayWeighin);	//this might be a problem?
	var delbutton = $('#weight_delete_entry').clone().show();
	item.append(delbutton);
	delbutton.attr('id','delete_'+weightData.id).tap(function(){
		for( var i = 0; i <weightRecord.length; i++ ){
			if( weightData.id == weightRecord[i].id) {
				weightRecord.splice(i,1);
			}
		}
		item.remove();
		saveWeighin(weightRecord);
		return false;
	});
	
	item.data('weightData',weightData);	
	$('#WLog').append(item).listview('refresh');

}

function initialaddWeighIn(weightData) {

	var item = $('#weight_entry').clone(); 
	item.attr({id:weightData.id});
	
	var displayWeighin = "Date: " + JSON.stringify(weightData.WeighinDate) +
		" Gender: " + weightData.WGender + 
	    " Height: " + weightData.height + " Weight: " + weightData.weight +
		" Min Weight: " + weightData.minWeight + " Max Weight: " + weightData.maxWeight +
		" Neck: " + weightData.neck + " Abdomen / Waist: " + weightData.abdomen + 
		" Hip: " + weightData.hip + " Body Fat: " + weightData.bodyFat;
		
	item.find('span.text').text(displayWeighin);	//this might be a problem?
	var delbutton = $('#weight_delete_entry').clone().show();
	item.append(delbutton);
	delbutton.attr('id','delete_'+weightData.id).tap(function(){
		for( var i = 0; i <weightRecord.length; i++ ){
			if( weightData.id == weightRecord[i].id) {
				weightRecord.splice(i,1);
			}
		}
		item.remove();
		saveWeighin(weightRecord);
		return false;
	});
	
	item.data('weightData',weightData);	
	$('#WLog').append(item);

}


function getPullIndex(amount, min, max, length)
{
	var index = 0;
	if(amount < min){index = 0;	}
	else if(amount > max){index=length-1;}
	else{index=amount-min+1;}
	
	return index;
}

function getPushIndex(amount, min, max, length)
{
	var index = 0;
	if(amount<min) {
		index=0;
	}
	else if(amount>max) {
		index=length-1;
	}
	else {
		index=amount-min+1;
	}
	return index;
}

function getCrunchIndex(amount, min, max, length)
{
	var index = 0;
	
	if(amount<min){index=0;}
	else if(amount>max){index=length-1;}
	else {index=amount-min+1;}

	return index;
}

function getRunIndex(runMin, runSec, minMin, minSec, length, elevation)
/*
	index = 0 
	subtract mininimum runmin from the runners minutes
	subtract minimum run seconds from the runners seconds, if <0 run sec = runsec+60 and runmin-1
	then multiply remaining minutes by 6 to add to index
	divide seconds by 10 and add 1 to index
	mod10 !0 =, add 1 to index
	if the index is greater than the length, then they fail
*/
{
	var index = 0;
	var runCalcMin = 0;
	var runCalcSec = 0;
	if(runMin == 0) {return index;}
	else
	{
		if(elevation)
		{
			minMin = minMin+1;
			minSec = minSec+30;
			if(minSec == 60)
			{
				minMin = minMin +1;
				minSec = 0;
			}
		}
		runMin = runMin - minMin;
		runSec = runSec - minSec;
		if (runSec < 0) 
		{
			runSec = runSec + 60;
			runMin = runMin -1;
		}
		
		if (runMin < 0 || (runMin == 0 && runSec == 0))
		{
			return length-1;
		}
		else
		{
			index = runMin*6 + (Math.floor(runSec/10));
			
			if(runSec%10 != 0){
				index=index+1;
			}
			
		index=Math.abs(index-length+1);
		
		if(index>=length)
			return 0;
		else return index;
		
		}
	}
	
	
	return index;
	
}

function CalculateCFTScore(Results)
{
	//Results = CFTid, elevation, ACL, MTCMin, 
	//MTCSec, MUFMin, MUFSec,CFTDateRan, CFTGender, CFTAgeGroup 
	
	var ACLScore = 0;
	var MUFScore = 0;
	var MTCScore = 0;
	
	var tempMTCSec = Results.MTCSec;
	var tempMTCMin = Results.MTCMin;
	var tempMUFSec = Results.MUFSec;
	var tempMUFMin = Results.MUFMin;
	
	if (Results.elevation)
	{	

		
		Results.MTCSec = Results.MTCSec-6;
		if(Results.MTCSec < 0)
		{
			Results.MTCSec = Results.MTCSec+60;
			Results.MTCMin = Results.MTCMin-1;
		}
		
		Results.MUFSec = Results.MUFSec-8;
		if (Results.MUFSec < 0)
		{
			Results.MUFSec = Results.MUFSec + 60;
			Results.MUFMin = Results.MUFMin -1;
		}
	}
	switch (Results.CFTGender){
		case "Male":
			
	
		var maleMTCScores = ([
			[100,100,100,100,100,100,100,100], //2:38
			[100, 99,100,100,100,100,100,100],
			[100, 98, 99,100,100,100,100,100],
			[ 99, 98, 99,100,100,100,100,100],
			[ 98, 96, 97,100,100,100,100,100], //2:42
			[ 97, 96, 97, 99,100,100,100,100],
			[ 96, 95, 96, 98,100,100,100,100],
			[ 95, 94, 95, 97,100,100,100,100],
			[ 94, 93, 94, 97, 99,100,100,100],
			[ 94, 92, 93, 96, 98,100,100,100],
			[ 93, 91, 92, 95, 98,100,100,100],
			[ 92, 90, 91, 94, 97,100,100,100],
			[ 91, 89, 90, 93, 96,100,100,100],
			[ 90, 88, 90, 92, 95,100,100,100],
			[ 89, 87, 89, 91, 94,100,100,100],
			[ 88, 87, 88, 90, 93, 99,100,100],
			[ 87, 86, 87, 90, 93, 98,100,100],
			[ 86, 85, 86, 89, 92, 98,100,100],
			[ 85, 84, 85, 88, 91, 97,100,100],
			[ 84, 83, 84, 87, 90, 96,100,100],
			[ 83, 82, 83, 86, 89, 95,100,100],
			[ 82, 81, 83, 85, 88, 95,100,100],
			[ 82, 80, 82, 84, 88, 94,100,100],
			[ 81, 79, 81, 83, 87, 93,100,100],
			[ 80, 79, 80, 83, 86, 92, 99,100],
			[ 79, 78, 79, 82, 85, 92, 99,100],
			[ 78, 77, 78, 81, 84, 91, 98,100],
			[ 77, 76, 77, 80, 84, 90, 97,100],
			[ 76, 75, 77, 79, 83, 89, 97, 99],
			[ 75, 74, 76, 78, 82, 89, 96, 99],
			[ 75, 74, 76, 78, 82, 89, 96, 99],
			[ 73, 72, 74, 77, 80, 87, 94, 98],
			[ 72, 71, 73, 76, 79, 86, 94, 97],
			[ 71, 70, 72, 75, 79, 86, 93, 97],
			[ 70, 70, 71, 74, 78, 85, 92, 96],
			[ 70, 69, 70, 73, 77, 84, 92, 96],
			[ 69, 68, 70, 72, 76, 83, 91, 95],
			[ 68, 67, 69, 71, 75, 83, 90, 95],
			[ 67, 66, 68, 70, 75, 82, 90, 94],
			[ 66, 65, 67, 70, 74, 81, 89, 94],
			[ 65, 64, 66, 69, 73, 80, 88, 93],
			[ 64, 63, 65, 68, 72, 79, 88, 93],
			[ 63, 62, 64, 67, 71, 79, 87, 92],
			[ 62, 61, 63, 66, 70, 78, 86, 92],
			[ 61, 61, 63, 65, 70, 77, 86, 91],
			[ 60, 60, 62, 64, 69, 76, 85, 91],//3:23 top of second page
			[ 59, 59, 61, 63, 68, 76, 84, 90],
			[ 58, 58, 60, 63, 67, 75, 83, 90],
			[ 58, 57, 59, 62, 66, 74, 83, 89],
			[ 57, 56, 58, 61, 65, 73, 82, 89],
			[ 56, 55, 57, 60, 65, 73, 81, 88],
			[ 55, 54, 57, 59, 64, 72, 81, 88],
			[ 54, 53, 56, 58, 63, 71, 80, 87],
			[ 53, 53, 55, 57, 62, 70, 79, 87],
			[ 52, 52, 54, 57, 61, 70, 79, 86],
			[ 51, 51, 53, 56, 61, 69, 78, 86],
			[ 50, 50, 52, 55, 60, 68, 77, 85],
			[ 49, 49, 51, 54, 59, 67, 77, 85],
			[ 48, 48, 50, 53, 58, 67, 76, 85],
			[ 47, 47, 50, 52, 57, 66, 75, 84],
			[ 46, 46, 49, 51, 56, 65, 74, 84],
			[ 46, 45, 48, 50, 56, 64, 74, 83],
			[ 45, 44, 47, 50, 55, 64, 73, 83],
			[ 44, 44, 46, 49, 54, 63, 72, 82],
			[ 43, 43, 45, 48, 53, 62, 72, 82],
			[ 42, 42, 44, 47, 52, 61, 71, 81],
			[ 41, 41, 43, 46, 52, 61, 70, 81],
			[ 40, 40, 43, 45, 51, 60, 70, 80],//CUTOFF FOR FIRST 2 AGE GROUPS
			[  0,  0, 42, 44, 50, 59, 69, 80],
			[  0,  0, 41, 43, 49, 58, 68, 79],
			[  0,  0, 40, 43, 48, 57, 68, 79],
			[  0,  0,  0, 42, 47, 57, 67, 78],
			[  0,  0,  0, 41, 47, 56, 66, 78],
			[  0,  0,  0, 40, 46, 55, 66, 77],
			[  0,  0,  0,  0, 45, 54, 65, 77],
			[  0,  0,  0,  0, 44, 54, 64, 76],
			[  0,  0,  0,  0, 43, 53, 63, 76],
			[  0,  0,  0,  0, 42, 52, 63, 75],
			[  0,  0,  0,  0, 42, 51, 62, 75],
			[  0,  0,  0,  0, 41, 51, 61, 74],
			[  0,  0,  0,  0, 40, 50, 61, 74],//3:58
			[  0,  0,  0,  0,  0, 49, 60, 73], 
			[  0,  0,  0,  0,  0, 48, 59, 73],
			[  0,  0,  0,  0,  0, 48, 59, 72],
			[  0,  0,  0,  0,  0, 47, 58, 72],
			[  0,  0,  0,  0,  0, 46, 57, 71],
			[  0,  0,  0,  0,  0, 45, 57, 71],
			[  0,  0,  0,  0,  0, 45, 56, 70],
			[  0,  0,  0,  0,  0, 43, 54, 70],
			[  0,  0,  0,  0,  0, 42, 54, 69],
			[  0,  0,  0,  0,  0, 42, 53, 69],
			[  0,  0,  0,  0,  0, 41, 52, 68],
			[  0,  0,  0,  0,  0, 40, 52, 68],//4:11
			[  0,  0,  0,  0,  0,  0, 51, 67],
			[  0,  0,  0,  0,  0,  0, 50, 67],
			[  0,  0,  0,  0,  0,  0, 50, 66],
			[  0,  0,  0,  0,  0,  0, 49, 66],
			[  0,  0,  0,  0,  0,  0, 48, 65],
			[  0,  0,  0,  0,  0,  0, 48, 65],
			[  0,  0,  0,  0,  0,  0, 47, 64],
			[  0,  0,  0,  0,  0,  0, 46, 64],
			[  0,  0,  0,  0,  0,  0, 46, 63],
			[  0,  0,  0,  0,  0,  0, 45, 63],
			[  0,  0,  0,  0,  0,  0, 44, 62],
			[  0,  0,  0,  0,  0,  0, 43, 62],
			[  0,  0,  0,  0,  0,  0, 43, 61],
			[  0,  0,  0,  0,  0,  0, 42, 61],
			[  0,  0,  0,  0,  0,  0, 41, 60],
			[  0,  0,  0,  0,  0,  0, 41, 60],
			[  0,  0,  0,  0,  0,  0, 40, 59],
			[  0,  0,  0,  0,  0,  0,  0, 59],
			[  0,  0,  0,  0,  0,  0,  0, 58],
			[  0,  0,  0,  0,  0,  0,  0, 58],
			[  0,  0,  0,  0,  0,  0,  0, 57],
			[  0,  0,  0,  0,  0,  0,  0, 57],
			[  0,  0,  0,  0,  0,  0,  0, 56],
			[  0,  0,  0,  0,  0,  0,  0, 56],
			[  0,  0,  0,  0,  0,  0,  0, 55],
			[  0,  0,  0,  0,  0,  0,  0, 55],
			[  0,  0,  0,  0,  0,  0,  0, 55],
			[  0,  0,  0,  0,  0,  0,  0, 54],
			[  0,  0,  0,  0,  0,  0,  0, 54],
			[  0,  0,  0,  0,  0,  0,  0, 53],
			[  0,  0,  0,  0,  0,  0,  0, 53],
			[  0,  0,  0,  0,  0,  0,  0, 52],
			[  0,  0,  0,  0,  0,  0,  0, 52],
			[  0,  0,  0,  0,  0,  0,  0, 51],
			[  0,  0,  0,  0,  0,  0,  0, 51],
			[  0,  0,  0,  0,  0,  0,  0, 50],
			[  0,  0,  0,  0,  0,  0,  0, 50],
			[  0,  0,  0,  0,  0,  0,  0, 49],
			[  0,  0,  0,  0,  0,  0,  0, 49],
			[  0,  0,  0,  0,  0,  0,  0, 48],
			[  0,  0,  0,  0,  0,  0,  0, 48],
			[  0,  0,  0,  0,  0,  0,  0, 47],
			[  0,  0,  0,  0,  0,  0,  0, 47],
			[  0,  0,  0,  0,  0,  0,  0, 46],
			[  0,  0,  0,  0,  0,  0,  0, 46],
			[  0,  0,  0,  0,  0,  0,  0, 45],
			[  0,  0,  0,  0,  0,  0,  0, 45],
			[  0,  0,  0,  0,  0,  0,  0, 44],
			[  0,  0,  0,  0,  0,  0,  0, 44],
			[  0,  0,  0,  0,  0,  0,  0, 43],
			[  0,  0,  0,  0,  0,  0,  0, 43],
			[  0,  0,  0,  0,  0,  0,  0, 42],
			[  0,  0,  0,  0,  0,  0,  0, 42],
			[  0,  0,  0,  0,  0,  0,  0, 41],
			[  0,  0,  0,  0,  0,  0,  0, 41],
			[  0,  0,  0,  0,  0,  0,  0, 40],
			[  0,  0,  0,  0,  0,  0,  0,  0]
		]);
		
		var maleACLScores = ([
			[100,100,100,100,100,100,100,100],
			[100,100,100, 99,100,100,100,100],
			[100,100,100, 98,100,100,100,100],
			[100,100,100, 97,100,100,100,100],
			[100,100,100, 95,100,100,100,100],
			[100,100, 99, 94,100,100,100,100],
			[100, 99, 98, 93,100,100,100,100],
			[100, 98, 96, 92,100,100,100,100],    
			[100, 96, 95, 91,100,100,100,100],
			[100, 95, 94, 90,100,100,100,100],    
			[100, 94, 93, 89,100,100,100,100],   
			[100, 93, 91, 88,100,100,100,100],
			[100, 91, 90, 86, 97,100,100,100],   
			[100, 90, 89, 85, 96,100,100,100],
			[100, 89, 88, 84, 94,100,100,100],
			[ 99, 88, 87, 83, 93, 99,100,100],
			[ 97, 86, 85, 82, 92, 97,100,100],
			[ 96, 85, 84, 81, 90, 96,100,100],
			[ 95, 84, 83, 80, 89, 94,100,100],
			[ 93, 83, 82, 78, 87, 93,100,100],
			[ 92, 81, 80, 77, 86, 91,100,100],
			[ 90, 80, 79, 76, 85, 90, 98,100],
			[ 89, 79, 78, 75, 83, 88, 97,100],
			[ 88, 78, 77, 74, 82, 87, 95,100],
			[ 86, 76, 76, 73, 80, 85, 93,100],//95
			[ 85, 75, 74, 72, 79, 84, 91,100],
			[ 84, 74, 73, 71, 78, 82, 90, 99],
			[ 82, 73, 72, 69, 76, 81, 88, 98],
			[ 81, 71, 71, 68, 75, 79, 86, 98],
			[ 80, 70, 69, 67, 73, 78, 85, 97],
			[ 78, 69, 68, 66, 72, 76, 83, 96],
			[ 77, 68, 67, 65, 71, 75, 81, 95],
			[ 75, 66, 66, 64, 69, 73, 79, 95],
			[ 74, 65, 64, 63, 68, 72, 78, 94],
			[ 73, 64, 63, 62, 67, 70, 76, 93],
			[ 71, 63, 62, 60, 65, 69, 74, 92],
			[ 70, 61, 61, 59, 64, 67, 73, 92],
			[ 69, 60, 60, 58, 62, 66, 71, 91],
			[ 67, 59, 58, 57, 61, 64, 69, 90],
			[ 66, 58, 57, 56, 60, 63, 67, 89],
			[ 65, 56, 56, 55, 58, 61, 66, 89],
			[ 63, 55, 55, 54, 57, 60, 64, 88],
			[ 62, 54, 53, 52, 55, 58, 62, 87],
			[ 60, 53, 52, 51, 54, 57, 61, 86],//77
			[ 59, 51, 51, 50, 53, 55, 59, 86],
			[ 58, 50, 50, 49, 51, 54, 57, 85],
			[ 56, 49, 49, 48, 50, 52, 55, 84],
			[ 55, 48, 47, 47, 48, 51, 54, 83],
			[ 54, 46, 46, 46, 47, 49, 52, 83],
			[ 52, 45, 45, 45, 46, 48, 50, 82],
			[ 51, 44, 44, 43, 44, 46, 49, 81],
			[ 50, 43, 42, 42, 43, 45, 47, 80],
			[ 48, 41, 41, 41, 41, 43, 45, 79],
			[ 47, 40, 40, 40, 40, 42, 43, 79],
			[ 45,  0,  0,  0,  0, 40, 42, 78],
			[ 44,  0,  0,  0,  0,  0, 40, 77],
			[ 43,  0,  0,  0,  0,  0,  0, 76],
			[ 41,  0,  0,  0,  0,  0,  0, 76],
			[ 40,  0,  0,  0,  0,  0,  0, 75],
			[  0,  0,  0,  0,  0,  0,  0, 74],
			[  0,  0,  0,  0,  0,  0,  0, 73],
			[  0,  0,  0,  0,  0,  0,  0, 73],
			[  0,  0,  0,  0,  0,  0,  0, 72],
			[  0,  0,  0,  0,  0,  0,  0, 71],
			[  0,  0,  0,  0,  0,  0,  0, 70],
			[  0,  0,  0,  0,  0,  0,  0, 70],
			[  0,  0,  0,  0,  0,  0,  0, 69],
			[  0,  0,  0,  0,  0,  0,  0, 68],
			[  0,  0,  0,  0,  0,  0,  0, 67],
			[  0,  0,  0,  0,  0,  0,  0, 67],
			[  0,  0,  0,  0,  0,  0,  0, 66],
			[  0,  0,  0,  0,  0,  0,  0, 65],
			[  0,  0,  0,  0,  0,  0,  0, 64],
			[  0,  0,  0,  0,  0,  0,  0, 64],
			[  0,  0,  0,  0,  0,  0,  0, 63],
			[  0,  0,  0,  0,  0,  0,  0, 62],
			[  0,  0,  0,  0,  0,  0,  0, 61],
			[  0,  0,  0,  0,  0,  0,  0, 61],
			[  0,  0,  0,  0,  0,  0,  0, 60],
			[  0,  0,  0,  0,  0,  0,  0, 59],
			[  0,  0,  0,  0,  0,  0,  0, 58],
			[  0,  0,  0,  0,  0,  0,  0, 57],
			[  0,  0,  0,  0,  0,  0,  0, 57],
			[  0,  0,  0,  0,  0,  0,  0, 56],
			[  0,  0,  0,  0,  0,  0,  0, 55],
			[  0,  0,  0,  0,  0,  0,  0, 54],
			[  0,  0,  0,  0,  0,  0,  0, 54],
			[  0,  0,  0,  0,  0,  0,  0, 53],
			[  0,  0,  0,  0,  0,  0,  0, 52],
			[  0,  0,  0,  0,  0,  0,  0, 51],
			[  0,  0,  0,  0,  0,  0,  0, 51],
			[  0,  0,  0,  0,  0,  0,  0, 50],
			[  0,  0,  0,  0,  0,  0,  0, 49],
			[  0,  0,  0,  0,  0,  0,  0, 48],
			[  0,  0,  0,  0,  0,  0,  0, 48],
			[  0,  0,  0,  0,  0,  0,  0, 47],
			[  0,  0,  0,  0,  0,  0,  0, 46],
			[  0,  0,  0,  0,  0,  0,  0, 45],
			[  0,  0,  0,  0,  0,  0,  0, 45],
			[  0,  0,  0,  0,  0,  0,  0, 44],
			[  0,  0,  0,  0,  0,  0,  0, 43],
			[  0,  0,  0,  0,  0,  0,  0, 42],
			[  0,  0,  0,  0,  0,  0,  0, 42],
			[  0,  0,  0,  0,  0,  0,  0, 41],
			[  0,  0,  0,  0,  0,  0,  0, 40],
			[  0,  0,  0,  0,  0,  0,  0,  0]
		]);
		
		var maleMUFScores = ([
			[  100,100,  100,  100,  100,  100,  100,  100],
			[  100, 99,100,  100,  100,  100,  100,  100],
			[  100, 98, 99,  100,  100,  100,  100,  100],
			[100, 98, 98,  100,  100,  100,  100,  100],
			[ 99, 97, 98,  100,  100,  100,  100,  100],
			[ 98, 96, 97,  100,  100,  100,  100,  100],
			[ 97, 95, 96,100,  100,  100,  100,  100],
			[ 97, 94, 95, 99,  100,  100,  100,  100],
			[ 96, 94, 95, 99,  100,  100,  100,  100],
			[ 95, 93, 94, 98,  100,  100,  100,  100],
			[ 94, 92, 93, 97,  100,  100,  100,  100],
			[ 93, 91, 92, 96,  100,  100,  100,  100],
			[ 92, 90, 91, 96,100,  100,  100,  100],
			[ 91, 89, 91, 95, 99,  100,  100,  100],
			[ 91, 89, 90, 94, 99,  100,  100,  100],
			[ 90, 88, 89, 93, 98,  100,  100,  100],
			[ 89, 87, 88, 93, 97,  100,  100,  100],
			[ 88, 86, 88, 92, 97,  100,  100,  100],
			[ 87, 85, 87, 91, 96,  100,  100,  100],
			[ 86, 85, 86, 90, 95,100,  100,  100],
			[ 85, 84, 85, 90, 94, 99,  100,  100],
			[ 85, 83, 84, 89, 94, 99,  100,  100],
			[ 84, 82, 84, 88, 93, 98,  100,  100],
			[ 83, 81, 83, 87, 92, 98,  100,  100],
			[ 82, 81, 82, 87, 92, 97,  100,  100],
			[ 81, 80, 81, 86, 91, 96,  100,  100],
			[ 80, 79, 81, 85, 90, 96,  100,  100],
			[ 79, 78, 80, 84, 90, 95,  100,  100],
			[ 79, 77, 79, 84, 89, 94,  100,  100],
			[ 78, 76, 78, 83, 88, 94,  100,  100],
			[ 77, 76, 77, 82, 87, 93,  100,  100],
			[ 76, 75, 77, 81, 87, 93,  100,  100],
			[ 75, 74, 76, 81, 86, 92,  100,  100],
			[ 74, 73, 75, 80, 85, 91,  100,  100],
			[ 73, 72, 74, 79, 85, 91,  100,  100],
			[ 73, 72, 74, 78, 84, 90,  100,  100],
			[ 72, 71, 73, 78, 83, 89,100,  100],
			[ 71, 70, 72, 77, 83, 89, 99,  100],
			[ 70, 69, 71, 76, 82, 88, 99,  100],
			[ 69, 68, 70, 75, 81, 88, 98,  100],
			[ 68, 68, 70, 75, 80, 87, 97,  100],
			[ 67, 67, 69, 74, 80, 86, 97,  100],
			[ 67, 66, 68, 73, 79, 86, 96,  100],
			[ 66, 65, 67, 72, 78, 85, 96,  100],
			[ 65, 64, 66, 72, 78, 84, 95,  100],
			[ 64, 64, 66, 71, 77, 84, 94,  100],
			[ 63, 63, 65, 70, 76, 83, 94,  100],
			[ 62, 62, 64, 69, 76, 83, 93,  100],
			[ 61, 61, 63, 69, 75, 82, 92,100],
			[ 61, 60, 63, 68, 74, 81, 92, 99],
			[ 60, 59, 62, 67, 73, 81, 91, 99],
			[ 59, 59, 61, 66, 73, 80, 90, 99],
			[ 58, 58, 60, 66, 72, 79, 90, 98],
			[ 57, 57, 59, 65, 71, 79, 89, 98],
			[ 56, 56, 59, 64, 71, 78, 89, 98],
			[ 55, 55, 58, 63, 70, 78, 88, 98],
			[ 55, 55, 57, 63, 69, 77, 87, 97],
			[ 54, 54, 56, 62, 69, 76, 87, 97],
			[ 53, 53, 56, 61, 68, 76, 86, 97],
			[ 52, 52, 55, 60, 67, 75, 85, 96],
			[ 51, 51, 54, 60, 67, 74, 85, 96],
			[ 50, 51, 53, 59, 66, 74, 84, 96],
			[ 49, 50, 52, 58, 65, 73, 83, 95],
			[ 49, 49, 52, 57, 64, 73, 83, 95],
			[ 48, 48, 51, 57, 64, 72, 82, 95],
			[ 47, 47, 50, 56, 63, 71, 81, 95],
			[ 46, 46, 49, 55, 62, 71, 81, 94],
			[ 45, 46, 49, 54, 62, 70, 80, 94],
			[ 44, 45, 48, 54, 61, 69, 80, 94],
			[ 43, 44, 47, 53, 60, 69, 79, 93],
			[ 43, 43, 46, 52, 60, 68, 78, 93],
			[ 42, 42, 45, 51, 59, 68, 78, 93],
			[ 41, 42, 45, 51, 58, 67, 77, 92],
			[ 40, 41, 44, 50, 57, 66, 76, 92],
			[  0, 40, 43, 49, 57, 66, 76, 92],
			[  0,  0, 42, 48, 56, 65, 75, 92],
			[  0,  0, 42, 48, 55, 64, 74, 91],
			[  0,  0, 41, 47, 55, 64, 74, 91],
			[  0,  0, 40, 46, 54, 63, 73, 91],
			[  0,  0,  0, 45, 53, 63, 73, 90],
			[  0,  0,  0, 45, 53, 62, 72, 90],
			[  0,  0,  0, 44, 52, 61, 71, 90],
			[  0,  0,  0, 43, 51, 61, 71, 89],
			[  0,  0,  0, 42, 50, 60, 70, 89],
			[  0,  0,  0, 42, 50, 59, 69, 89],
			[  0,  0,  0, 41, 49, 59, 69, 89],
			[  0,  0,  0, 40, 48, 58, 68, 88],//3:30
			[  0,  0,  0,  0, 48, 58, 67, 88],
			[  0,  0,  0,  0, 47, 57, 67, 88],
			[  0,  0,  0,  0, 46, 56, 66, 87],
			[  0,  0,  0,  0, 46, 56, 66, 87],
			[  0,  0,  0,  0, 45, 55, 65, 87],
			[  0,  0,  0,  0, 44, 54, 64, 86],
			[  0,  0,  0,  0, 43, 54, 64, 86],
			[  0,  0,  0,  0, 43, 53, 63, 86],
			[  0,  0,  0,  0, 42, 53, 62, 86],
			[  0,  0,  0,  0, 41, 52, 62, 85],
			[  0,  0,  0,  0, 41, 51, 61, 85],
			[  0,  0,  0,  0, 40, 51, 60, 85],
			[  0,  0,  0,  0,  0, 50, 60, 84],
			[  0,  0,  0,  0,  0, 49, 59, 84],
			[  0,  0,  0,  0,  0, 49, 59, 84],
			[  0,  0,  0,  0,  0, 48, 58, 83],
			[  0,  0,  0,  0,  0, 48, 57, 83],
			[  0,  0,  0,  0,  0, 47, 57, 83],
			[  0,  0,  0,  0,  0, 46, 56, 83],
			[  0,  0,  0,  0,  0, 46, 55, 82],
			[  0,  0,  0,  0,  0, 45, 55, 82],
			[  0,  0,  0,  0,  0, 44, 54, 82],
			[  0,  0,  0,  0,  0, 44, 53, 81],
			[  0,  0,  0,  0,  0, 43, 53, 81],
			[  0,  0,  0,  0,  0, 43, 52, 81],
			[  0,  0,  0,  0,  0, 42, 51, 80],
			[  0,  0,  0,  0,  0, 41, 51, 80],
			[  0,  0,  0,  0,  0, 41, 50, 80],
			[  0,  0,  0,  0,  0, 40, 50, 79],//3:59
			[  0,  0,  0,  0,  0,  0, 49, 79],
			[  0,  0,  0,  0,  0,  0, 48, 79],
			[  0,  0,  0,  0,  0,  0, 48, 79],
			[  0,  0,  0,  0,  0,  0, 47, 78],
			[  0,  0,  0,  0,  0,  0, 46, 78],
			[  0,  0,  0,  0,  0,  0, 46, 48],
			[  0,  0,  0,  0,  0,  0, 45, 77],
			[  0,  0,  0,  0,  0,  0, 44, 77],
			[  0,  0,  0,  0,  0,  0, 44, 77],
			[  0,  0,  0,  0,  0,  0, 43, 76],
			[  0,  0,  0,  0,  0,  0, 73, 76],
			[  0,  0,  0,  0,  0,  0, 72, 76],
			[  0,  0,  0,  0,  0,  0, 41, 76],
			[  0,  0,  0,  0,  0,  0, 41, 75],
			[  0,  0,  0,  0,  0,  0, 40, 75],
			[  0,  0,  0,  0,  0, 0, 0, 75],
			[  0,  0,  0,  0,  0, 0, 0, 74],
			[  0,  0,  0,  0,  0, 0, 0, 74],
			[  0,  0,  0,  0,  0, 0, 0, 74],
			[  0,  0,  0,  0,  0, 0, 0, 73],
			[  0,  0,  0,  0,  0, 0, 0, 73],
			[  0,  0,  0,  0,  0, 0, 0, 73],
			[  0,  0,  0,  0,  0, 0, 0, 73],
			[  0,  0,  0,  0,  0, 0, 0, 72],
			[  0,  0,  0,  0,  0, 0, 0, 72],
			[  0,  0,  0,  0,  0, 0, 0, 72],
			[  0,  0,  0,  0,  0, 0, 0, 71],
			[  0,  0,  0,  0,  0, 0, 0, 71],
			[  0,  0,  0,  0,  0, 0, 0, 71],
			[  0,  0,  0,  0,  0, 0, 0, 70],
			[  0,  0,  0,  0,  0, 0, 0, 70],
			[  0,  0,  0,  0,  0, 0, 0, 70],
			[  0,  0,  0,  0,  0, 0, 0, 70],
			[  0,  0,  0,  0,  0, 0, 0, 69],
			[  0,  0,  0,  0,  0, 0, 0, 69],
			[  0,  0,  0,  0,  0, 0, 0, 69],
			[  0,  0,  0,  0,  0, 0, 0, 68],
			[  0,  0,  0,  0,  0, 0, 0, 68],
			[  0,  0,  0,  0,  0, 0, 0, 68],
			[  0,  0,  0,  0,  0, 0, 0, 67],
			[  0,  0,  0,  0,  0, 0, 0, 67],
			[  0,  0,  0,  0,  0, 0, 0, 67],
			[  0,  0,  0,  0,  0, 0, 0, 67],
			[  0,  0,  0,  0,  0, 0, 0, 66],
			[  0,  0,  0,  0,  0, 0, 0, 66],
			[  0,  0,  0,  0,  0, 0, 0, 66],
			[  0,  0,  0,  0,  0, 0, 0, 65],
			[  0,  0,  0,  0,  0, 0, 0, 65],
			[  0,  0,  0,  0,  0, 0, 0, 65],
			[  0,  0,  0,  0,  0, 0, 0, 64],
			[  0,  0,  0,  0,  0, 0, 0, 64],
			[  0,  0,  0,  0,  0, 0, 0, 64],
			[  0,  0,  0,  0,  0, 0, 0, 64],
			[  0,  0,  0,  0,  0, 0, 0, 63],
			[  0,  0,  0,  0,  0, 0, 0, 63],
			[  0,  0,  0,  0,  0, 0, 0, 63],
			[  0,  0,  0,  0,  0, 0, 0, 62],
			[  0,  0,  0,  0,  0, 0, 0, 62],
			[  0,  0,  0,  0,  0, 0, 0, 62],
			[  0,  0,  0,  0,  0, 0, 0, 61],
			[  0,  0,  0,  0,  0, 0, 0, 61],
			[  0,  0,  0,  0,  0, 0, 0, 61],
			[  0,  0,  0,  0,  0, 0, 0, 61],
			[  0,  0,  0,  0,  0, 0, 0, 60],
			[  0,  0,  0,  0,  0, 0, 0, 60],
			[  0,  0,  0,  0,  0, 0, 0, 60],
			[  0,  0,  0,  0,  0, 0, 0, 59],
			[  0,  0,  0,  0,  0, 0, 0, 59],
			[  0,  0,  0,  0,  0, 0, 0, 59],
			[  0,  0,  0,  0,  0, 0, 0, 58],
			[  0,  0,  0,  0,  0, 0, 0, 58],
			[  0,  0,  0,  0,  0, 0, 0, 58],
			[  0,  0,  0,  0,  0, 0, 0, 57],
			[  0,  0,  0,  0,  0, 0, 0, 57],
			[  0,  0,  0,  0,  0, 0, 0, 57],
			[  0,  0,  0,  0,  0, 0, 0, 57],
			[  0,  0,  0,  0,  0, 0, 0, 56],
			[  0,  0,  0,  0,  0, 0, 0, 56],
			[  0,  0,  0,  0,  0, 0, 0, 56],
			[  0,  0,  0,  0,  0, 0, 0, 55],
			[  0,  0,  0,  0,  0, 0, 0, 55],
			[  0,  0,  0,  0,  0, 0, 0, 55],
			[  0,  0,  0,  0,  0, 0, 0, 54],
			[  0,  0,  0,  0,  0, 0, 0, 54],
			[  0,  0,  0,  0,  0, 0, 0, 54],
			[  0,  0,  0,  0,  0, 0, 0, 54],
			[  0,  0,  0,  0,  0, 0, 0, 53],
			[  0,  0,  0,  0,  0, 0, 0, 53],
			[  0,  0,  0,  0,  0, 0, 0, 53],
			[  0,  0,  0,  0,  0, 0, 0, 52],
			[  0,  0,  0,  0,  0, 0, 0, 52],
			[  0,  0,  0,  0,  0, 0, 0, 52],
			[  0,  0,  0,  0,  0, 0, 0, 51],
			[  0,  0,  0,  0,  0, 0, 0, 51],
			[  0,  0,  0,  0,  0, 0, 0, 51],
			[  0,  0,  0,  0,  0, 0, 0, 51],
			[  0,  0,  0,  0,  0, 0, 0, 50],
			[  0,  0,  0,  0,  0, 0, 0, 50],
			[  0,  0,  0,  0,  0, 0, 0, 50],
			[  0,  0,  0,  0,  0, 0, 0, 49],
			[  0,  0,  0,  0,  0, 0, 0, 49],
			[  0,  0,  0,  0,  0, 0, 0, 49],
			[  0,  0,  0,  0,  0, 0, 0, 48],
			[  0,  0,  0,  0,  0, 0, 0, 48],
			[  0,  0,  0,  0,  0, 0, 0, 48],
			[  0,  0,  0,  0,  0, 0, 0, 48],
			[  0,  0,  0,  0,  0, 0, 0, 47],
			[  0,  0,  0,  0,  0, 0, 0, 47],
			[  0,  0,  0,  0,  0, 0, 0, 47],
			[  0,  0,  0,  0,  0, 0, 0, 46],
			[  0,  0,  0,  0,  0, 0, 0, 46],
			[  0,  0,  0,  0,  0, 0, 0, 46],
			[  0,  0,  0,  0,  0, 0, 0, 45],
			[  0,  0,  0,  0,  0, 0, 0, 45],
			[  0,  0,  0,  0,  0, 0, 0, 45],
			[  0,  0,  0,  0,  0, 0, 0, 45],
			[  0,  0,  0,  0,  0, 0, 0, 44],
			[  0,  0,  0,  0,  0, 0, 0, 44],
			[  0,  0,  0,  0,  0, 0, 0, 44],
			[  0,  0,  0,  0,  0, 0, 0, 43],
			[  0,  0,  0,  0,  0, 0, 0, 43],
			[  0,  0,  0,  0,  0, 0, 0, 43],
			[  0,  0,  0,  0,  0, 0, 0, 42],
			[  0,  0,  0,  0,  0, 0, 0, 42],
			[  0,  0,  0,  0,  0, 0, 0, 42],
			[  0,  0,  0,  0,  0, 0, 0, 42],
			[  0,  0,  0,  0,  0, 0, 0, 41],
			[  0,  0,  0,  0,  0, 0, 0, 41],
			[  0,  0,  0,  0,  0, 0, 0, 41],
			[  0,  0,  0,  0,  0, 0, 0, 40],
			[  0,  0,  0,  0,  0, 0, 0, 0]
		]); //246 columns
		
		//get column number based on time
		var MTCColumn = 149;
		if (Results.MTCMin == 0)
			MTCColumn = 149;
		else if (Results.MTCMin<2)
			MTCColumn = 0;
		else if (Results.MTCMin==2)
		{
			MTCColumn = Results.MTCSec-38;
			if(MTCColumn < 0)
				MTCColumn = 0;
		}
		else 
		{
			MTCColumn = Results.MTCMin-3;
			MTCColumn = MTCColumn * 60;
			MTCColumn = MTCColumn + 22;	
			MTCColumn = +MTCColumn + +Results.MTCSec;
		}
		if (MTCColumn > 149)
			MTCColumn = 149;
		
		var ACLColumn = 0;
		if (Results.ACL > 120)
			ACLColumn = 0;
		else
		{
			ACLColumn = Math.abs(Results.ACL-120);
			if(ACLColumn >105)
				ACLColumn = 105;
		}
		
		
		var MUFColumn = 246;
		if (Results.MUFMin == 0)
		{
			MUFColumn = 246;
		}
		else if (Results.MUFMin < 2)
		{
			MUFColumn = 0;
		}
		else if (Results.MUFMin == 2)
		{
			MUFColumn = Results.MUFSec - 4;
			if(MUFColumn < 0)
				MUFColumn = 0;
		}
		else 
		{
			MUFColumn = Results.MUFMin - 3;
			MUFColumn = MUFColumn * 60;
			MUFColumn = MUFColumn + 56;
			MUFColumn = +MUFColumn + +Results.MUFSec;
		}
		if (MUFColumn > 246)
			MUFColumn = 246;

		switch (Results.CFTAgeGroup) {
				case "17-20":
					MTCScore = maleMTCScores[MTCColumn][0];
					ACLScore = maleACLScores[ACLColumn][0];	
					MUFScore = maleMUFScores[MUFColumn][0];
				break;
				case "21-25":
					MTCScore = maleMTCScores[MTCColumn][1];
					ACLScore = maleACLScores[ACLColumn][1];
					MUFScore = maleMUFScores[MUFColumn][1];
				break;
				case"26-30":
					MTCScore = maleMTCScores[MTCColumn][2];
					ACLScore = maleACLScores[ACLColumn][2];
					MUFScore = maleMUFScores[MUFColumn][2];
				break;
				case"31-35":
					MTCScore = maleMTCScores[MTCColumn][3];
					ACLScore = maleACLScores[ACLColumn][3];
					MUFScore = maleMUFScores[MUFColumn][3];
				break;
				case"36-40":
					MTCScore = maleMTCScores[MTCColumn][4];
					ACLScore = maleACLScores[ACLColumn][4];
					MUFScore = maleMUFScores[MUFColumn][4];
				break;
				case"41-45":
					MTCScore = maleMTCScores[MTCColumn][5];
					ACLScore = maleACLScores[ACLColumn][5];
					MUFScore = maleMUFScores[MUFColumn][5];
				break;
				case "46-50":
					MTCScore = maleMTCScores[MTCColumn][6];
					ACLScore = maleACLScores[ACLColumn][6];
					MUFScore = maleMUFScores[MUFColumn][6];
				break;
				
				case"51+":
					MTCScore = maleMTCScores[MTCColumn][7];
					ACLScore = maleACLScores[ACLColumn][7];
					MUFScore = maleMUFScores[MUFColumn][7];
				break;
			}
		
		break; //END CASE MALE
		case "Female":
				var femaleMTCScores = ([
			[100,100,100,100,100,100,100,100],
			[100,100, 99,100,100,100,100,100],
			[100,100, 99,100,100,100,100,100],
			[100,100, 98, 99,100,100,100,100],
			[100, 99, 97, 99,100,100,100,100],
			[100, 99, 97, 98,100,100,100,100],
			[100, 98, 96, 97,100,100,100,100],
			[100, 97, 96, 97,100,100,100,100],
			[100, 97, 95, 96,100,100,100,100],
			[100, 97, 94, 96, 99,100,100,100],
			[ 99, 95, 94, 95, 99,100,100,100],
			[ 98, 95, 93, 94, 98,100,100,100],
			[ 98, 94, 92, 94, 98,100,100,100],
			[ 97, 93, 92, 93, 97,100,100,100],
			[ 96, 93, 91, 92, 96,100,100,100],//3:24
			[ 95, 92, 91, 92, 96,100,100,100],
			[ 95, 91, 90, 91, 95, 99,100,100],
			[ 94, 90, 89, 90, 94, 99,100,100],
			[ 93, 90, 89, 90, 94, 98,100,100],
			[ 92, 89, 88, 89, 93, 97,100,100],
			[ 91, 88, 87, 89, 93, 97,100,100],
			[ 91, 88, 87, 88, 92, 96,100,100],
			[ 90, 87, 86, 87, 91, 95,100,100],
			[ 89, 86, 85, 87, 91, 95,100,100],
			[ 88, 86, 85, 86, 90, 94,100,100],
			[ 88, 85, 84, 85, 89, 94,100,100],
			[ 87, 84, 84, 85, 89, 93,100,100],
			[ 86, 84, 83, 84, 88, 92,100,100],
			[ 85, 83, 82, 83, 88, 92,100,100],//3:38
			[ 84, 82, 82, 83, 87, 91,100,100],
			[ 84, 82, 81, 82, 86, 90, 99,100],
			[ 83, 81, 80, 81, 86, 90, 99,100],
			[ 82, 80, 80, 81, 85, 89, 98,100],
			[ 81, 80, 79, 80, 85, 88, 98,100],
			[ 81, 79, 79, 80, 84, 88, 97,100],
			[ 80, 78, 78, 79, 83, 87, 97,100],
			[ 79, 78, 77, 78, 83, 86, 96,100],
			[ 78, 77, 77, 78, 82, 86, 96,100],
			[ 77, 76, 76, 77, 81, 85, 95,100],
			[ 77, 75, 75, 76, 81, 85, 94,100],
			[ 76, 75, 75, 76, 80, 84, 94,100],
			[ 75, 74, 74, 75, 80, 83, 93,100],
			[ 74, 73, 73, 74, 79, 83, 93,100],
			[ 74, 73, 73, 74, 78, 82, 92,100],
			[ 73, 72, 72, 73, 78, 81, 92,100],//3:54
			[ 72, 71, 72, 73, 77, 81, 91,100],
			[ 71, 71, 71, 72, 76, 80, 90, 99],
			[ 70, 70, 70, 71, 76, 79, 90, 99],
			[ 70, 69, 70, 71, 75, 79, 89, 98],
			[ 69, 69, 69, 70, 75, 78, 89, 98],
			[ 68, 68, 68, 69, 74, 77, 88, 97],
			[ 67, 67, 68, 69, 73, 77, 88, 97],
			[ 66, 67, 67, 68, 73, 76, 87, 96],
			[ 66, 66, 67, 67, 72, 75, 87, 96],
			[ 65, 65, 66, 67, 72, 75, 86, 95],
			[ 64, 65, 65, 66, 71, 74, 85, 95],
			[ 63, 64, 65, 66, 70, 74, 85, 94],
			[ 63, 63, 64, 65, 70, 73, 84, 94],
			[ 62, 63, 63, 64, 69, 72, 84, 93],
			[ 61, 62, 63, 64, 68, 72, 83, 93],
			[ 60, 61, 62, 63, 68, 71, 83, 92],
			[ 59, 60, 61, 62, 67, 70, 82, 92],
			[ 59, 60, 61, 62, 67, 70, 81, 91],
			[ 58, 59, 60, 61, 66, 69, 81, 91],
			[ 57, 58, 60, 60, 65, 68, 80, 90],
			[ 56, 58, 59, 60, 65, 68, 80, 90],
			[ 56, 57, 58, 59, 64, 67, 79, 89],
			[ 55, 56, 58, 59, 64, 66, 79, 89],
			[ 54, 56, 57, 58, 63, 66, 78, 88],
			[ 53, 55, 56, 57, 62, 65, 78, 88],
			[ 52, 54, 56, 57, 62, 65, 77, 87],
			[ 52, 54, 55, 56, 61, 64, 76, 87],
			[ 51, 53, 55, 55, 60, 63, 76, 86],
			[ 50, 52, 54, 55, 60, 63, 75, 86],
			[ 49, 52, 53, 54, 59, 62, 75, 85],
			[ 49, 51, 53, 53, 59, 61, 74, 85],
			[ 48, 50, 52, 53, 58, 61, 74, 84],
			[ 47, 50, 51, 52, 57, 60, 73, 84],
			[ 46, 49, 51, 51, 57, 59, 73, 83],
			[ 45, 48, 50, 51, 56, 59, 72, 83],
			[ 45, 48, 49, 50, 55, 58, 71, 82],
			[ 44, 47, 49, 50, 55, 57, 71, 82],
			[ 43, 46, 48, 49, 54, 57, 70, 81],
			[ 42, 45, 48, 48, 54, 56, 70, 81],
			[ 42, 45, 47, 48, 53, 55, 69, 80],
			[ 41, 44, 46, 47, 52, 55, 69, 79],
			[ 40, 43, 46, 46, 52, 54, 68, 79],//4:36
			[  0, 43, 45, 46, 51, 54, 67, 78],
			[  0, 42, 44, 45, 51, 53, 67, 78],
			[  0, 41, 44, 44, 50, 52, 66, 77],
			[  0, 41, 43, 44, 49, 52, 66, 77],
			[  0, 40, 43, 43, 49, 51, 65, 76],
			[  0,  0, 42, 43, 48, 50, 65, 76],
			[  0,  0, 41, 42, 47, 50, 64, 75],
			[  0,  0, 41, 41, 47, 49, 64, 75],//4:44
			[  0,  0, 40, 41, 46, 48, 63, 74],
			[  0,  0,  0, 40, 46, 48, 62, 74],
			[  0,  0,  0,  0, 45, 47, 62, 73],
			[  0,  0,  0,  0, 44, 46, 61, 73],
			[  0,  0,  0,  0, 44, 46, 61, 72],
			[  0,  0,  0,  0, 43, 45, 60, 72],
			[  0,  0,  0,  0, 42, 45, 60, 71],
			[  0,  0,  0,  0, 42, 44, 59, 71],
			[  0,  0,  0,  0, 41, 43, 59, 70],
			[  0,  0,  0,  0, 41, 43, 58, 70],
			[  0,  0,  0,  0, 40, 42, 57, 69],//4:55
			[  0,  0,  0,  0,  0, 41, 57, 69],
			[  0,  0,  0,  0,  0, 41, 56, 68],
			[  0,  0,  0,  0,  0, 40, 56, 68],
			[  0,  0,  0,  0,  0,  0, 55, 67],
			[  0,  0,  0,  0,  0,  0, 55, 67],
			[  0,  0,  0,  0,  0,  0, 54, 66],
			[  0,  0,  0,  0,  0,  0, 53, 66],
			[  0,  0,  0,  0,  0,  0, 53, 65],
			[  0,  0,  0,  0,  0,  0, 52, 65],
			[  0,  0,  0,  0,  0,  0, 52, 64],
			[  0,  0,  0,  0,  0,  0, 51, 64],
			[  0,  0,  0,  0,  0,  0, 51, 63],
			[  0,  0,  0,  0,  0,  0, 50, 63],
			[  0,  0,  0,  0,  0,  0, 50, 62],
			[  0,  0,  0,  0,  0,  0, 49, 62],
			[  0,  0,  0,  0,  0,  0, 48, 61],
			[  0,  0,  0,  0,  0,  0, 48, 61],
			[  0,  0,  0,  0,  0,  0, 47, 60],
			[  0,  0,  0,  0,  0,  0, 47, 59],
			[  0,  0,  0,  0,  0,  0, 46, 59],
			[  0,  0,  0,  0,  0,  0, 46, 58],
			[  0,  0,  0,  0,  0,  0, 45, 58],
			[  0,  0,  0,  0,  0,  0, 44, 57],
			[  0,  0,  0,  0,  0,  0, 44, 57],
			[  0,  0,  0,  0,  0,  0, 43, 56],
			[  0,  0,  0,  0,  0,  0, 43, 56],
			[  0,  0,  0,  0,  0,  0, 42, 55],
			[  0,  0,  0,  0,  0,  0, 42, 55],//5:23
			[  0,  0,  0,  0,  0,  0, 41, 54],
			[  0,  0,  0,  0,  0,  0, 41, 54],
			[  0,  0,  0,  0,  0,  0, 40, 53],
			[  0,  0,  0,  0,  0,  0,  0, 53],
			[  0,  0,  0,  0,  0,  0,  0, 52],
			[  0,  0,  0,  0,  0,  0,  0, 52],
			[  0,  0,  0,  0,  0,  0,  0, 51],
			[  0,  0,  0,  0,  0,  0,  0, 51],
			[  0,  0,  0,  0,  0,  0,  0, 50],
			[  0,  0,  0,  0,  0,  0,  0, 50],
			[  0,  0,  0,  0,  0,  0,  0, 49],
			[  0,  0,  0,  0,  0,  0,  0, 49],
			[  0,  0,  0,  0,  0,  0,  0, 48],
			[  0,  0,  0,  0,  0,  0,  0, 48],
			[  0,  0,  0,  0,  0,  0,  0, 47],
			[  0,  0,  0,  0,  0,  0,  0, 47],
			[  0,  0,  0,  0,  0,  0,  0, 46],
			[  0,  0,  0,  0,  0,  0,  0, 46],
			[  0,  0,  0,  0,  0,  0,  0, 45],
			[  0,  0,  0,  0,  0,  0,  0, 45],
			[  0,  0,  0,  0,  0,  0,  0, 44],
			[  0,  0,  0,  0,  0,  0,  0, 44],
			[  0,  0,  0,  0,  0,  0,  0, 43],
			[  0,  0,  0,  0,  0,  0,  0, 43],
			[  0,  0,  0,  0,  0,  0,  0, 42],
			[  0,  0,  0,  0,  0,  0,  0, 42],
			[  0,  0,  0,  0,  0,  0,  0, 41],
			[  0,  0,  0,  0,  0,  0,  0, 41],
			[  0,  0,  0,  0,  0,  0,  0, 40],
			[  0,  0,  0,  0,  0,  0,  0,  0]
			
		]);// 162 rows
		
		var femaleACLScores = ([
			[100,100,100,100,100,100,100,100],
			[100,100,100, 99,100,100,100,100],
			[100, 99, 97,100,100,100,100,100],
			[100, 97, 96,100,100,100,100,100],
			[100, 96, 95, 99,100,100,100,100],
			[100, 95, 93, 97,100,100,100,100],
			[100, 93, 92, 96, 99,100,100,100],
			[100, 92, 91, 94, 97,100,100,100],
			[100, 90, 89, 93, 96,100,100,100],//67
			[100, 89, 88, 91, 94,100,100,100],
			[ 98, 88, 87, 90, 93,100,100,100],
			[ 97, 86, 85, 89, 91,100,100,100],
			[ 95, 85, 84, 87, 90,100,100,100],
			[ 93, 84, 83, 86, 88,100,100,100],
			[ 92, 82, 81, 84, 87, 98,100,100],
			[ 90, 81, 80, 83, 85, 96,100,100],
			[ 88, 80, 79, 81, 84, 95,100,100],
			[ 87, 78, 77, 80, 82, 93,100,100],
			[ 85, 77, 76, 79, 81, 91,100,100],
			[ 83, 75, 75, 77, 79, 89,100,100],
			[ 82, 74, 73, 76, 78, 88,100,100],
			[ 80, 73, 72, 74, 76, 86,100,100],
			[ 78, 71, 71, 73, 75, 84,100,100],
			[ 77, 70, 69, 71, 73, 82, 98,100],
			[ 75, 69, 68, 70, 72, 81, 96,100],
			[ 73, 67, 67, 69, 70, 79, 93,100],
			[ 72, 66, 65, 67, 69, 77, 91,100],
			[ 70, 65, 64, 66, 67, 75, 89,100],
			[ 68, 63, 63, 64, 66, 74, 87,100],
			[ 67, 62, 61, 63, 64, 72, 84,100],
			[ 65, 60, 60, 61, 63, 70, 82,100],
			[ 63, 59, 59, 60, 61, 68, 80,100],
			[ 62, 58, 57, 59, 60, 66, 78, 98],
			[ 60, 56, 56, 57, 58, 65, 76, 97],
			[ 58, 55, 55, 56, 57, 63, 73, 95],
			[ 57, 54, 53, 54, 55, 61, 71, 94],
			[ 55, 52, 52, 53, 54, 59, 69, 92],
			[ 53, 51, 51, 51, 52, 58, 67, 91],
			[ 52, 50, 49, 50, 51, 56, 64, 89],
			[ 50, 48, 48, 49, 49, 54, 62, 87],
			[ 48, 47, 47, 47, 48, 52, 60, 86],
			[ 47, 45, 45, 46, 46, 51, 58, 84],
			[ 45, 44, 44, 44, 45, 49, 56, 83],
			[ 43, 43, 43, 43, 43, 47, 53, 81],
			[ 42, 41, 41, 41, 42, 45, 51, 79],
			[ 40, 40, 40, 40, 40, 44, 49, 78],
			[  0,  0,  0,  0,  0, 42, 47, 76],
			[  0,  0,  0,  0,  0, 40, 44, 75],
			[  0,  0,  0,  0,  0,  0, 42, 73],
			[  0,  0,  0,  0,  0,  0, 40, 72],
			[  0,  0,  0,  0,  0,  0,  0, 70],
			[  0,  0,  0,  0,  0,  0,  0, 68],
			[  0,  0,  0,  0,  0,  0,  0, 67],
			[  0,  0,  0,  0,  0,  0,  0, 65],
			[  0,  0,  0,  0,  0,  0,  0, 64],
			[  0,  0,  0,  0,  0,  0,  0, 62],
			[  0,  0,  0,  0,  0,  0,  0, 61],
			[  0,  0,  0,  0,  0,  0,  0, 59],
			[  0,  0,  0,  0,  0,  0,  0, 57],
			[  0,  0,  0,  0,  0,  0,  0, 56],
			[  0,  0,  0,  0,  0,  0,  0, 54],
			[  0,  0,  0,  0,  0,  0,  0, 53],
			[  0,  0,  0,  0,  0,  0,  0, 51],
			[  0,  0,  0,  0,  0,  0,  0, 49],
			[  0,  0,  0,  0,  0,  0,  0, 48],
			[  0,  0,  0,  0,  0,  0,  0, 46],
			[  0,  0,  0,  0,  0,  0,  0, 45],
			[  0,  0,  0,  0,  0,  0,  0, 43],
			[  0,  0,  0,  0,  0,  0,  0, 42],
			[  0,  0,  0,  0,  0,  0,  0, 40],
			[  0,  0,  0,  0,  0,  0,  0,  0]
		]);//70 rows
		
		var femaleMUFScores = ([
			[100,100,100,100,100,100,100,100],
			[100,100, 99,100,100,100,100,100],
			[100,100, 99,100,100,100,100,100],
			[100,100, 98,100,100,100,100,100],
			[100, 99, 98,100,100,100,100,100],
			[100, 99, 97,100,100,100,100,100],
			[100, 98, 97,100,100,100,100,100],
			[100, 98, 96,100,100,100,100,100],
			[100, 97, 96, 99,100,100,100,100],
			[100, 97, 95, 99,100,100,100,100],
			[100, 96, 95, 98,100,100,100,100],
			[100, 96, 94, 98,100,100,100,100],
			[100, 95, 94, 97,100,100,100,100],
			[100, 94, 93, 97, 99,100,100,100],
			[ 99, 94, 93, 96, 99,100,100,100],
			[ 99, 93, 92, 96, 98,100,100,100],
			[ 98, 93, 92, 95, 98,100,100,100],
			[ 98, 92, 91, 95, 97, 99,100,100],
			[ 97, 92, 91, 94, 97, 99,100,100],
			[ 97, 91, 90, 94, 96, 98,100,100],
			[ 96, 91, 90, 93, 96, 98,100,100],
			[ 96, 90, 89, 93, 95, 97,100,100],
			[ 95, 90, 89, 92, 95, 97,100,100],
			[ 95, 89, 88, 92, 94, 96,100,100],
			[ 94, 88, 88, 91, 94, 96,100,100],
			[ 94, 88, 87, 91, 93, 95,100,100],
			[ 93, 87, 87, 90, 93, 95,100,100],
			[ 93, 87, 86, 90, 92, 94,100,100],
			[ 92, 86, 86, 89, 92, 94,100,100],
			[ 92, 86, 85, 89, 91, 93,100,100],
			[ 91, 85, 85, 88, 91, 93,100,100],//3:12
			[ 91, 85, 84, 87, 90, 92,100,100],
			[ 90, 84, 84, 87, 90, 92,100,100],
			[ 90, 83, 83, 86, 89, 91,100,100],
			[ 89, 83, 83, 86, 89, 91,100,100],
			[ 89, 82, 82, 85, 88, 90,100,100],
			[ 88, 82, 82, 85, 88, 90,100,100],
			[ 88, 81, 81, 84, 87, 89,100,100],
			[ 87, 81, 81, 84, 87, 89,100,100],
			[ 87, 80, 80, 83, 86, 88,100,100],
			[ 86, 80, 80, 83, 86, 88,100,100],
			[ 86, 79, 79, 82, 85, 87,100,100],
			[ 85, 79, 79, 82, 85, 87,100,100],
			[ 85, 78, 78, 81, 84, 86,100,100],
			[ 84, 77, 78, 81, 84, 86,100,100],
			[ 84, 77, 77, 80, 83, 85,100,100],
			[ 83, 76, 77, 80, 83, 85,100,100],
			[ 83, 76, 76, 79, 82, 85,100,100],
			[ 82, 75, 76, 79, 82, 84,100,100],
			[ 82, 75, 75, 78, 81, 84,100,100],
			[ 81, 74, 75, 78, 81, 83,100,100],
			[ 81, 74, 74, 77, 80, 83,100,100],
			[ 80, 73, 74, 77, 80, 82,100,100],
			[ 80, 72, 73, 76, 80, 82,100,100],
			[ 79, 72, 73, 75, 79, 81, 99,100],
			[ 79, 71, 72, 75, 79, 81, 99,100],
			[ 78, 71, 72, 74, 78, 80, 98,100],
			[ 78, 70, 71, 74, 78, 80, 97,100],
			[ 77, 70, 71, 73, 77, 79, 97,100],
			[ 77, 69, 70, 73, 77, 79, 96,100],
			[ 76, 69, 69, 72, 76, 78, 95,100],
			[ 76, 68, 69, 72, 76, 78, 95,100],
			[ 75, 68, 68, 71, 75, 77, 94,100],
			[ 75, 67, 68, 71, 75, 77, 93, 99],
			[ 74, 66, 67, 70, 74, 76, 93, 99],
			[ 74, 66, 67, 70, 74, 76, 92, 99],
			[ 73, 65, 66, 69, 73, 75, 91, 98],
			[ 73, 65, 66, 69, 73, 75, 91, 98],
			[ 72, 64, 65, 68, 72, 74, 90, 98],
			[ 72, 64, 65, 68, 72, 74, 89, 97],
			[ 71, 63, 64, 67, 71, 73, 89, 97],
			[ 71, 63, 64, 67, 71, 73, 88, 96],
			[ 70, 62, 63, 66, 70, 72, 87, 96],
			[ 69, 61, 63, 66, 70, 72, 87, 96],
			[ 69, 61, 62, 65, 69, 71, 86, 95],
			[ 68, 60, 62, 65, 69, 71, 85, 95],
			[ 68, 60, 61, 64, 68, 70, 85, 95],
			[ 67, 59, 61, 63, 68, 70, 84, 94],
			[ 67, 59, 60, 63, 67, 70, 84, 94],
			[ 66, 58, 60, 62, 67, 69, 83, 94],
			[ 66, 58, 59, 62, 66, 69, 82, 93],
			[ 65, 57, 59, 61, 66, 68, 82, 93],
			[ 65, 57, 58, 61, 65, 68, 81, 93],
			[ 64, 56, 58, 60, 65, 67, 80, 92],
			[ 64, 55, 57, 60, 64, 67, 80, 92],
			[ 63, 55, 57, 59, 64, 66, 79, 92],
			[ 63, 54, 56, 59, 63, 66, 78, 91],
			[ 62, 54, 56, 58, 63, 65, 78, 91],
			[ 62, 53, 55, 58, 62, 65, 77, 91],
			[ 61, 53, 55, 57, 62, 64, 76, 90],//4:11
			[ 61, 52, 54, 57, 61, 64, 76, 90],
			[ 60, 52, 54, 56, 61, 63, 75, 89],
			[ 60, 51, 53, 56, 60, 63, 74, 89],
			[ 59, 50, 53, 55, 60, 62, 74, 89],
			[ 59, 50, 52, 55, 60, 62, 73, 88],
			[ 58, 49, 52, 54, 59, 61, 72, 88],
			[ 58, 49, 51, 54, 59, 61, 72, 88],
			[ 57, 48, 51, 53, 58, 60, 71, 87],
			[ 57, 48, 50, 53, 58, 60, 70, 87],
			[ 56, 47, 50, 52, 57, 59, 70, 87],
			[ 56, 47, 49, 51, 57, 59, 69, 86],
			[ 55, 46, 49, 51, 56, 58, 68, 86],
			[ 55, 46, 48, 50, 56, 58, 68, 86],
			[ 54, 45, 48, 50, 55, 57, 67, 85],
			[ 54, 44, 47, 49, 55, 57, 66, 85],
			[ 53, 44, 47, 49, 54, 56, 66, 85],
			[ 53, 43, 46, 48, 54, 56, 65, 84],
			[ 52, 43, 46, 48, 53, 55, 64, 84],
			[ 52, 42, 45, 47, 53, 55, 64, 84],
			[ 51, 42, 45, 47, 52, 55, 63, 83],
			[ 51, 41, 44, 46, 52, 54, 62, 83],
			[ 50, 41, 44, 46, 51, 54, 62, 82],
			[ 50, 40, 43, 45, 51, 53, 61, 82],//4:34
			[ 49,  0, 43, 45, 50, 53, 60, 82],
			[ 49,  0, 42, 44, 50, 52, 60, 81],
			[ 48,  0, 42, 44, 49, 52, 59, 81],
			[ 48,  0, 41, 43, 49, 51, 58, 81],
			[ 47,  0, 41, 43, 48, 51, 58, 80],
			[ 47,  0, 40, 42, 48, 50, 57, 80],
			[ 46,  0,  0, 42, 47, 50, 56, 80], 
			[ 46,  0,  0, 41, 47, 49, 56, 79],
			[ 45,  0,  0, 41, 46, 49, 55, 79],
			[ 45,  0,  0, 40, 46, 48, 55, 79],
			[ 44,  0,  0,  0, 45, 48, 54, 78],
			[ 44,  0,  0,  0, 45, 47, 53, 78],
			[ 43,  0,  0,  0, 44, 47, 53, 78],
			[ 43,  0,  0,  0, 44, 46, 52, 77],
			[ 42,  0,  0,  0, 43, 46, 51, 77],
			[ 42,  0,  0,  0, 43, 45, 51, 76], 
			[ 41,  0,  0,  0, 42, 45, 50, 76],
			[ 41,  0,  0,  0, 42, 44, 49, 76],
			[ 40,  0,  0,  0, 41, 44, 49, 75],
			[  0,  0,  0,  0, 41, 43, 48, 75],
			[  0,  0,  0,  0, 40, 43, 47, 75],
			[  0,  0,  0,  0, 40, 42, 47, 74],
			[  0,  0,  0,  0,  0, 42, 46, 74],
			[  0,  0,  0,  0,  0, 41, 45, 74],
			[  0,  0,  0,  0,  0, 41, 45, 73],
			[  0,  0,  0,  0,  0, 40, 44, 73],
			[  0,  0,  0,  0,  0, 40, 43, 73],
			[  0,  0,  0,  0,  0,  0, 43, 72],
			[  0,  0,  0,  0,  0,  0, 42, 72],
			[  0,  0,  0,  0,  0,  0, 41, 72],
			[  0,  0,  0,  0,  0,  0, 41, 71],
			[  0,  0,  0,  0,  0,  0, 40, 71],
			[  0,  0,  0,  0,  0,  0,  0, 71],
			[  0,  0,  0,  0,  0, 0, 0, 70],
			[  0,  0,  0,  0,  0, 0, 0, 70],
			[  0,  0,  0,  0,  0, 0,  0, 69],
			[  0,  0,  0,  0,  0, 0,  0, 69],
			[  0,  0,  0,  0,  0, 0,  0, 69],
			[  0,  0,  0,  0,  0, 0,  0, 68],
			[  0,  0,  0,  0,  0, 0,  0, 68],
			[  0,  0,  0,  0,  0, 0,  0, 68],
			[  0,  0,  0,  0,  0, 0,  0, 67],
			[  0,  0,  0,  0,  0, 0,  0, 67],
			[  0,  0,  0,  0,  0, 0,  0, 67],
			[  0,  0,  0,  0,  0, 0,  0, 66],
			[  0,  0,  0,  0,  0, 0,  0, 66],
			[  0,  0,  0,  0,  0, 0,  0, 66],
			[  0,  0,  0,  0,  0, 0,  0, 65],
			[  0,  0,  0,  0,  0, 0,  0, 65],
			[  0,  0,  0,  0,  0, 0,  0, 65],
			[  0,  0,  0,  0,  0, 0,  0, 64],
			[  0,  0,  0,  0,  0, 0,  0, 64],
			[  0,  0,  0,  0,  0, 0,  0, 64],
			[  0,  0,  0,  0,  0, 0,  0, 63],
			[  0,  0,  0,  0,  0, 0,  0, 63],
			[  0,  0,  0,  0,  0, 0,  0, 62],
			[  0,  0,  0,  0,  0, 0,  0, 62],
			[  0,  0,  0,  0,  0, 0, 0, 62],
			[  0,  0,  0,  0,  0, 0, 0, 61],
			[  0,  0,  0,  0,  0, 0, 0, 61],
			[  0,  0,  0,  0,  0, 0, 0, 61],
			[  0,  0,  0,  0,  0, 0, 0, 60],
			[  0,  0,  0,  0,  0, 0, 0, 60],
			[  0,  0,  0,  0,  0, 0, 0, 60],
			[  0,  0,  0,  0,  0, 0, 0, 59],
			[  0,  0,  0,  0,  0, 0, 0, 59],
			[  0,  0,  0,  0,  0, 0, 0, 59],
			[  0,  0,  0,  0,  0, 0, 0, 58],
			[  0,  0,  0,  0,  0, 0, 0, 58],
			[  0,  0,  0,  0,  0, 0, 0, 58],
			[  0,  0,  0,  0,  0, 0, 0, 57],
			[  0,  0,  0,  0,  0, 0, 0, 57],
			[  0,  0,  0,  0,  0, 0, 0, 56],
			[  0,  0,  0,  0,  0, 0, 0, 56],
			[  0,  0,  0,  0,  0, 0, 0, 56],
			[  0,  0,  0,  0,  0, 0, 0, 55],
			[  0,  0,  0,  0,  0, 0, 0, 55],
			[  0,  0,  0,  0,  0, 0, 0, 55],
			[  0,  0,  0,  0,  0, 0, 0, 54],
			[  0,  0,  0,  0,  0, 0, 0, 54],
			[  0,  0,  0,  0,  0, 0, 0, 54],
			[  0,  0,  0,  0,  0, 0, 0, 53],
			[  0,  0,  0,  0,  0, 0, 0, 53],
			[  0,  0,  0,  0,  0, 0, 0, 53],
			[  0,  0,  0,  0,  0, 0, 0, 52],
			[  0,  0,  0,  0,  0, 0, 0, 52],
			[  0,  0,  0,  0,  0, 0, 0, 52],
			[  0,  0,  0,  0,  0, 0, 0, 51],
			[  0,  0,  0,  0,  0, 0, 0, 51],
			[  0,  0,  0,  0,  0, 0, 0, 51],
			[  0,  0,  0,  0,  0, 0, 0, 50],
			[  0,  0,  0,  0,  0, 0, 0, 50],
			[  0,  0,  0,  0,  0, 0, 0, 49],
			[  0,  0,  0,  0,  0, 0, 0, 49],
			[  0,  0,  0,  0,  0, 0, 0, 49],
			[  0,  0,  0,  0,  0, 0, 0, 48],
			[  0,  0,  0,  0,  0, 0, 0, 48],
			[  0,  0,  0,  0,  0, 0, 0, 48],
			[  0,  0,  0,  0,  0, 0, 0, 47],
			[  0,  0,  0,  0,  0, 0, 0, 47],
			[  0,  0,  0,  0,  0, 0, 0, 47],
			[  0,  0,  0,  0,  0, 0, 0, 46],
			[  0,  0,  0,  0,  0, 0, 0, 46],
			[  0,  0,  0,  0,  0, 0, 0, 46],
			[  0,  0,  0,  0,  0, 0, 0, 45],
			[  0,  0,  0,  0,  0, 0, 0, 45],
			[  0,  0,  0,  0,  0, 0, 0, 45],
			[  0,  0,  0,  0,  0, 0, 0, 44],
			[  0,  0,  0,  0,  0, 0, 0, 44],
			[  0,  0,  0,  0,  0, 0, 0, 44],
			[  0,  0,  0,  0,  0, 0, 0, 43],
			[  0,  0,  0,  0,  0, 0, 0, 43],
			[  0,  0,  0,  0,  0, 0, 0, 42],
			[  0,  0,  0,  0,  0, 0, 0, 42],
			[  0,  0,  0,  0,  0, 0, 0, 42],
			[  0,  0,  0,  0,  0, 0, 0, 41],
			[  0,  0,  0,  0,  0, 0, 0, 41],
			[  0,  0,  0,  0,  0, 0, 0, 41],
			[  0,  0,  0,  0,  0, 0, 0, 40],
			[  0,  0,  0,  0,  0, 0, 0, 0]
		]); //232 rows
		
		//get column number based on time
		var MTCColumn = 0;
		
		if (Results.MTCMin == 0)
			MTCColumn = 163;
		else if (Results.MTCMin<3)
			MTCColumn = 0;
		else if (Results.MTCMin==3)
		{
			MTCColumn = Results.MTCSec-10;
			if(MTCColumn < 0)
				MTCColumn = 0;
		}
		else 
		{
			MTCColumn = Results.MTCMin-4;
			MTCColumn = MTCColumn * 60;
			MTCColumn = MTCColumn + 50;	
			MTCColumn = +MTCColumn + +Results.MTCSec;
		}
		if (MTCColumn > 163)
			MTCColumn = 163;
		
		
		
		var ACLColumn = 0;
		if (Results.ACL > 75)
			ACLColumn = 0;
		else
		{
			ACLColumn = Math.abs(Results.ACL-75);
			if(ACLColumn >70)
				ACLColumn = 70;
		}
		
		
		var MUFColumn = 0;
		if (Results.MUF == 0)
		{
			MUFColumn = 232;
		}
		else if (Results.MUFMin < 2)
		{
			MUFColumn = 0;
		}
		else if (Results.MUFMin == 2)
		{
			
			MUFColumn = Results.MUFSec - 42;
			if(MUFColumn < 0)
				MUFColumn = 0;
		}
		else 
		{
			
			MUFColumn = Results.MUFMin - 3;
			MUFColumn = MUFColumn * 60;
			MUFColumn = MUFColumn + 18;
			MUFColumn = +MUFColumn + +Results.MUFSec;
		}
		if (MUFColumn > 232)
			MUFColumn = 232;
		
		switch (Results.CFTAgeGroup) {
				case "17-20":
					MTCScore = femaleMTCScores[MTCColumn][0];
					ACLScore = femaleACLScores[ACLColumn][0];	
					MUFScore = femaleMUFScores[MUFColumn][0];
				break;
				case "21-25":
					MTCScore = femaleMTCScores[MTCColumn][1];
					ACLScore = femaleACLScores[ACLColumn][1];
					MUFScore = femaleMUFScores[MUFColumn][1];
				break;
				case"26-30":
					MTCScore = femaleMTCScores[MTCColumn][2];
					ACLScore = femaleACLScores[ACLColumn][2];
					MUFScore = femaleMUFScores[MUFColumn][2];
				break;
				case"31-35":
					MTCScore = femaleMTCScores[MTCColumn][3];
					ACLScore = femaleACLScores[ACLColumn][3];
					MUFScore = femaleMUFScores[MUFColumn][3];
				break;
				case"36-40":
					MTCScore = femaleMTCScores[MTCColumn][4];
					ACLScore = femaleACLScores[ACLColumn][4];
					MUFScore = femaleMUFScores[MUFColumn][4];
				break;
				case"41-45":
					MTCScore = femaleMTCScores[MTCColumn][5];
					ACLScore = femaleACLScores[ACLColumn][5];
					MUFScore = femaleMUFScores[MUFColumn][5];
				break;
				case "46-50":
					MTCScore = femaleMTCScores[MTCColumn][6];
					ACLScore = femaleACLScores[ACLColumn][6];
					MUFScore = femaleMUFScores[MUFColumn][6];
				break;
				
				case"51+":
					MTCScore = femaleMTCScores[MTCColumn][7];
					ACLScore = femaleACLScores[ACLColumn][7];
					MUFScore = femaleMUFScores[MUFColumn][7];
				break;
			}
		
		break;
	}
	
	var TotalScore = MTCScore + ACLScore + MUFScore;
	var CFTClass = "";
	if (TotalScore < 120)
		CFTClass = "You Failed";
	else if(TotalScore < 200)
		CFTClass = "Third Class";
	else if(TotalScore < 235)
		CFTClass = "Second Class";
	else
		CFTClass = "First Class";
	
	var CFTdata = {CFTid:Results.CFTid,MTCScore:MTCScore,ACLScore:ACLScore,MUFScore:MUFScore,TotalScore:TotalScore, CFTClass:CFTClass};
	
	CFTScores.push(CFTdata);
	
	CFTsaveScores(CFTScores);
	
	Results.MTCSec = tempMTCSec;
	Results.MTCMin = tempMTCMin;
	Results.MUFSec = tempMUFSec;
	Results.MUFMin = tempMUFMin;
	
	return CFTdata;			
	
}

function CalculateScore(Results)
{	//Requires Score Array. Calculates the scores, returns object of PFT scores.
	//results = {id, elevation, Pull, Push, Crunch, RunMin, RunSec, PFTDateRan, Gender, AgeGroup};
	var PullScore = 0;
	var PushScore = 0;
	var CrunchScore = 0;
	var RunScore = 0;
	
	switch( Results.Gender ){
		case "Male":
			switch( Results.AgeGroup ){
				case "17-20":  //****************17-20*************************
					var PullTable = [0,40,44,48,51,55,59,63,66,70,74,78,81,85,89,93,96,100];
					var PushTable = [0,40,41,42,42,43,44,45,45,46,47,48,48,49,50,51,51,52,53,54,54,55,56,57,57,58,59,60,60,61,62,63,63,64,65,66,66,67,68,69,69,70];
					var CrunchTable = [0,40,42,43,45,47,49,50,52,54,55,57,59,61,62,64,66,67,69,71,73,74,76,78,79,81,83,85,86,88,90,91,93,95,97,98,100];
					var RunTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
					
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,4,20,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,42,81,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,70,104,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 18,0, RunTable.length, Results.elevation)];
					
					break;
				
				case "21-25":
					var PullTable = [0,40,43,47,50,53,57,60,63,67,70,73,77,80,83,87,90,93,97,100];
					var PushTable = [0,40,41,41,42,43,43,44,44,45,46,46,47,48,48,49,50,50,51,51,52,53,53,54,55,55,56,57,57,58,59,59,60,60,61,62,62,63,64,64,65,66,66,67,67,68,69,69,70];
					var CrunchTable = [0,40,42,43,45,46,48,49,51,52,54,55,57,58,60,61,63,64,66,67,69,70,72,73,75,76,78,79,81,82,84,85,87,88,90,91,93,94,96,97,99,100];
					var RunTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
					
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,5,22,PullTable.length)];

					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,40,86,PushTable.length)];
					}
					else PushScore=0;
					
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,70,109,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 18,0,RunTable.length, Results.elevation)];
				
					break;
					
				case "26-30":
					var PullTable = [0,40,43,47,50,53,57,60,63,67,70,73,77,80,83,87,90,93,97,100];
					var PushTable = [0,40,41,41,42,43,43,44,45,45,46,47,47,48,49,49,50,51,51,52,53,53,54,55,55,56,57,57,58,59,59,60,61,61,62,63,63,64,65,65,66,67,67,68,69,69,70];
					var CrunchTable = [0,40,41,43,44,45,47,48,49,51,52,53,55,56,57,59,60,61,63,64,65,67,68,69,71,72,73,75,76,77,79,80,81,83,84,85,87,88,89,91,92,93,95,96,97,99,100];
					var RunTable = [0, 40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
				
					//CALCULATE PULLUPS SCORE
					PullScore=PullTable[getPullIndex(Results.Pull,5,22,PullTable.length)];					
					
					//CALCULATE PUSHUPS SCORE
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,39,83,PushTable.length)];
					}
					else PushScore=0;
					
					//CALCULATE CRUNCHES
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,70,115,CrunchTable.length)];
					
					//CALCULATE RUN TIME
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 18,0,RunTable.length, Results.elevation)];
				
					break;
				
				case "31-35":
	
					var PullTable = [0,40,43,47,50,53,57,60,63,67,70,73,77,80,83,87,90,93,97,100];
					var PushTable = [0,40,41,41,42,43,43,44,45,45,46,47,48,48,49,50,50,51,52,52,53,54,54,55,56,56,57,58,58,59,60,60,61,62,63,63,64,65,65,66,67,67,68,69,69,70];
					var CrunchTable = [0,40,41,43,44,45,47,48,49,51,52,53,55,56,57,59,60,61,63,64,65,67,68,69,71,72,73,75,76,77,79,80,81,83,84,85,87,88,89,91,92,93,95,96,97,99,100];	
					var RunTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
					
					//calculate pullups
					PullScore=PullTable[getPullIndex(Results.Pull,5,22,PullTable.length)];

					//CALCULATE PUSHUPS SCORE
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,36,79,PushTable.length)];
					}
					else PushScore=0;

					//CALCULATE CRUNCHES
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,70,115,CrunchTable.length)];
					
					//calculate run
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 18,0,RunTable.length, Results.elevation)];
					
					break;
				case "36-40":
					var PullTable = [0,40,44,48,51,55,59,63,66,70,74,78,81,85,89,93,96,100];
					var PushTable = [0,40,41,41,42,43,44,44,45,46,46,47,48,49,49,50,51,51,52,53,54,54,55,56,56,57,58,59,59,60,61,61,62,63,64,64,65,66,66,67,68,69,69,70];
					var CrunchTable = [0,40,42,43,45,46,48,49,51,52,54,55,57,58,60,61,63,64,66,67,69,70,72,73,75,76,78,79,81,82,84,85,87,88,90,91,93,94,96,97,99,100];	
					var RunTable = [0,40,41,42,43,44,45,46,47,48,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,93,94,95,96,97,98,99,100];

					//calculate pullups
					PullScore=PullTable[getPullIndex(Results.Pull,5,20,PullTable.length)];
					

					//CALCULATE PUSHUPS SCORE
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,34,75,PushTable.length)];
					}
					else PushScore=0;
					
					//CALCULATE CRUNCHES
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,70,109,CrunchTable.length)];
					
					//calculate run
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 18,0,RunTable.length, Results.elevation)];
				
					break;
					
				
				case "41-45":
					//FILL ARRAYS
					var PullTable = [0,40,44,48,52,56,60,64,68,72,76,80,84,88,92,96,100];
					var PushTable = [0,40,41,41,42,43,44,44,45,46,46,47,48,49,49,50,51,51,52,53,54,54,55,56,56,57,58,59,59,60,61,61,62,63,64,64,65,66,66,67,68,69,69,70];
					var CrunchTable = [0,40,42,43,45,46,48,49,51,52,54,55,57,58,60,61,63,64,66,67,69,70,72,73,75,76,78,79,81,82,84,85,87,88,90,91,93,94,96,97,99,100];	
					var RunTable = [0,40,41,42,43,44,45,46,46,47,48,49,50,51,52,53,54,55,56,57,58,58,59,60,61,62,63,64,65,66,67,68,69,70,70,71,72,73,74,75,76,77,78,79,80,81,82,82,83,84,85,86,87,88,89,90,91,92,93,94,94,95,96,97,98,99,100];
					
					//calculate pullups
					PullScore=PullTable[getPullIndex(Results.Pull,5,19,PullTable.length)];
					

					//CALCULATE PUSHUPS SCORE
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,30,71,PushTable.length)];
					}
					else PushScore=0;
					
					//CALCULATE CRUNCHES
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,65,104,CrunchTable.length)];
					
					//calculate run
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 18,30,RunTable.length, Results.elevation)];
								
					break;
					
				case "46-50":  
					//FILL ARRAYS
					var PullTable = [0,40,44,48,52,56,60,64,68,72,76,80,84,88,92,96,100];
					var PushTable = [0,40,41,41,42,43,43,44,45,46,46,47,48,48,49,50,50,51,52,53,53,54,55,55,56,57,57,58,59,60,60,61,62,62,63,64,64,65,66,67,67,68,69,69,70];
					var CrunchTable = [0,40,41,42,44,45,46,47,48,50,51,52,53,54,56,57,58,59,60,62,63,64,65,66,68,69,70,71,72,74,75,76,77,78,80,81,82,83,84,86,87,88,89,90,92,93,94,95,96,98,99,100];	
					var RunTable = [0,40,41,42,43,44,45,45,46,47,48,49,50,51,52,53,54,55,55,56,57,58,59,60,61,62,63,64,65,65,66,67,68,69,70,71,72,73,74,75,75,76,77,78,79,80,81,82,83,84,85,85,86,87,88,89,90,91,92,93,94,95,95,96,97,98,99,100];
			
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,4,18,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,25,67,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,50,99,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 19,0, RunTable.length, Results.elevation)];				
					break;
				
				case "51+":
					//FILL ARRAYS
					var PullTable = [0,40,44,48,52,56,60,64,68,72,76,80,84,88,92,96];
					var PushTable = [0,40,41,41,42,43,43,44,45,45,46,47,48,48,49,50,50,51,52,52,53,54,54,55,56,56,57,58,58,59,60,60,61,62,63,63,64,65,65,66,67,67,68,69,69,70];
					var CrunchTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];	
					var RunTable = [0,40,41,41,42,43,44,44,45,46,47,47,48,49,50,50,51,52,53,53,54,55,56,56,57,58,59,59,60,61,61,62,63,64,64,65,66,67,67,68,69,70,70,71,72,73,73,74,75,76,76,77,78,79,79,80,81,81,82,83,84,84,85,86,87,87,88,89,90,90,91,92,93,93,94,95,96,96,97,98,99,99,100];
			
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,3,17,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,20,63,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,40,99,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 19,30, RunTable.length, Results.elevation)];				
					break;
			}
			
			break;
		case "Female":
					switch( Results.AgeGroup ){
				case "17-20":  //****************17-20*************************
					var PullTable = [0,60,67,73,80,87,93,100];
					var PushTable = [0,40,41,43,44,45,47,48,49,50,52,53,54,56,57,58,60,61,62,63,65,66,67,69,70];
					var CrunchTable = [0,40,41,42,44,45,46,47,48,50,51,52,53,54,56,57,58,59,60,62,63,64,65,66,68,69,70,71,72,74,75,76,77,78,80,81,82,83,84,86,87,88,89,90,92,93,94,95,96,98,99,100];
					var RunTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
					
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,1,7,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,19,42,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,50,100,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 21,0, RunTable.length, Results.elevation)];
					
					
					break;
				case "21-25":
					//FILL ARRAYS
					var PullTable = [0,60,65,70,75,80,85,90,95,100];
					var PushTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70];
					var CrunchTable = [0,40,41,42,44,45,46,47,48,50,51,52,53,54,56,57,58,59,60,62,63,64,65,66,68,69,70,71,72,74,75,76,77,78,80,81,82,83,84,86,87,88,89,90,92,93,94,95,96,98,99,100];	
					var RunTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
			
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,1,9,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,18,48,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,55,105,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 21,0, RunTable.length, Results.elevation)];
					break;
					
				case "26-30": 
					//FILL ARRAYS
					var PullTable = [0,60,64,69,73,78,82,87,91,96,100];
					var PushTable = [0,40,41,42,43,44,45,46,47,48,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,63,64,65,66,67,68,69,70];
					var CrunchTable = [0,40,41,42,44,45,46,47,48,50,51,52,53,54,56,57,58,59,60,62,63,64,65,66,68,69,70,71,72,74,75,76,77,78,80,81,82,83,84,86,87,88,89,90,92,93,94,95,96,98,99,100];	
					var RunTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
			
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,1,10,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,18,50,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,60,110,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 21,0, RunTable.length, Results.elevation)];				
				
					break;
				
				case "31-35":
					//FILL ARRAYS
					var PullTable = [0,60,65,70,75,80,85,90,95,100];
					var PushTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70];
					var CrunchTable = [0,40,41,43,44,45,47,48,49,51,52,53,55,56,57,59,60,61,63,64,65,67,68,69,71,72,73,75,76,77,79,80,81,83,84,85,87,88,89,91,92,93,95,96,97,99,100];	
					var RunTable = [0,40,41,42,43,44,45,46,47,48,49,50,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,90,91,92,93,94,95,96,97,98,99,100];
			
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,1,9,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,16,46,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,60,105,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 21,0, RunTable.length, Results.elevation)];
					break;
				
				case "36-40":
				//FILL ARRAYS
					var PullTable = [0,60, 66,71,77,83,89,94,100];
					var PushTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70];
					var CrunchTable = [0,40,41,43,44,45,47,48,49,51,52,53,55,56,57,59,60,61,63,64,65,67,68,69,71,72,73,75,76,77,79,80,81,83,84,85,87,88,89,91,92,93,95,96,97,99,100];		
					var RunTable = [0,40,41,42,43,44,45,46,46,47,48,49,50,51,52,53,54,55,56,57,58,58,59,60,61,62,63,64,65,66,67,68,69,70,70,71,72,73,74,75,76,77,78,79,80,81,82,82,83,84,85,86,87,88,89,90,91,92,93,94,94,95,96,97,98,99,100];
			
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,1,8,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,14,43,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,60,105,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 21,0, RunTable.length, Results.elevation)];				
					break;
					break;
				case "41-45":
					//FILL ARRAYS
					var PullTable = [0,60,68,76,84,92,100];
					var PushTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70];
					var CrunchTable = [0,40,41,43,44,45,47,48,49,51,52,53,55,56,57,59,60,61,63,64,65,67,68,69,71,72,73,75,76,77,79,80,81,83,84,85,87,88,89,91,92,93,95,96,97,99,100];	
					var RunTable = [0,41,42,43,44,45,45,46,47,48,49,50,51,52,53,54,55,55,56,57,58,59,60,61,62,63,64,65,65,66,67,68,69,70,71,72,73,74,75,75,76,77,78,79,8,81,82,83,84,85,85,86,87,88,89,90,91,92,93,94,95,95,96,97,98,99,100];
			
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,1,6,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,12,41,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,55,100,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 21,30, RunTable.length, Results.elevation)];				
					break;
					
				case "46-50":
					//FILL ARRAYS
					var PullTable = [0,60,73,87,100];
					var PushTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70];
					var CrunchTable = [0,40,41,42,44,45,46,47,48,50,51,52,53,54,56,57,58,59,60,62,63,64,65,66,68,69,70,71,72,74,75,76,77,78,80,81,82,83,84,86,87,88,89,90,92,93,94,95,96,98,99,100];	
					var RunTable = [0,40,41,42,43,43,44,45,46,47,48,49,50,50,51,52,53,54,55,56,57,57,58,59,60,61,62,63,63,64,65,66,67,68,69,70,70,71,72,73,74,75,76,77,77,78,79,80,81,82,83,83,84,85,86,87,88,89,90,90,91,92,93,94,95,96,97,97,98,99,100];
			
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,1,4,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,11,40,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,50,100,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 22,0, RunTable.length, Results.elevation)];				
					break;
				
				case "51+":
					//FILL ARRAYS
					var PullTable = [0,60,80,100];
					var PushTable = [0,40,41,42,43,44,45,46,48,49,50,51,52,53,54,55,56,57,58,59,60,61,63,64,65,66,67,68,69,70];
					var CrunchTable = [0,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];	
					var RunTable = [0,40,41,41,42,43,44,44,45,46,47,47,48,49,50,50,51,52,53,53,54,55,56,56,57,58,59,59,60,61,61,62,63,64,64,65,66,67,67,68,69,70,70,71,72,73,73,74,75,76,76,77,78,79,79,80,81,81,82,83,84,84,85,86,87,87,88,89,90,90,91,92,93,93,94,95,96,96,97,98,99,99,100];
			
					//CALCULATE PULLUPS Score
					PullScore=PullTable[getPullIndex(Results.Pull,1,3,PullTable.length)];
					
					//CALCULATE PUSHUPS Score
					if(Results.Push>0)
					{
						PullScore=0;
						PushScore=PushTable[getPushIndex(Results.Push,10,38,PushTable.length)];
					}
					else PushScore=0;
										
					//CALCULATE CRUNCHES Score
					CrunchScore = CrunchTable[getCrunchIndex(Results.Crunch,40,100,CrunchTable.length)];
					
					//CALCULATE RUN Score
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 22,30, RunTable.length, Results.elevation)];				
					break;
					}
			break;
	}
	
	var TotalScore = PullScore+PushScore+CrunchScore+RunScore;
	var PFTClass = "";
	if (TotalScore < 120)
		PFTClass = "You Failed";
	else if(TotalScore < 200)
		PFTClass = "Third Class";
	else if(TotalScore < 235)
		PFTClass = "Second Class";
	else
		PFTClass = "First Class";
		
	var PFTdata = {id:Results.id,PullScore:PullScore,PushScore:PushScore,CrunchScore:CrunchScore,RunScore:RunScore,TotalScore:TotalScore, PFTClass:PFTClass};
		PFTScores.push(PFTdata);
	saveScores(PFTScores);
	return PFTdata;
}

function saveitems(record1) {
	//Saves record log to LocalStorage.
	localStorage.setItem('record', JSON.stringify(record1));	
	
}

function CFTsaveitems(record1) {
	//Saves record log to LocalStorage.
	localStorage.setItem('CFTrecord', JSON.stringify(record1));	
	
}

function CFTsaveScores(CFTscores1)
{	//Saves PFT scores to LocalStorage
	localStorage.setItem('CFTscores', JSON.stringify(CFTscores1));		
	
}

function saveScores(scores1)
{	//Saves PFT scores to LocalStorage
	localStorage.setItem('scores', JSON.stringify(scores1));		
	
}

function saveWeighin(weighin1)
{ 	//Saves weight to LocalStorage
	localStorage.setItem('weight', JSON.stringify(weighin1));
}

$(function(){
  
  function handletab(tabname) {
    return function(){
      $("div.content").hide()
      $("#content_"+tabname).show()
    }
  }
  $("#save").tap(handletab('PFTLog'))
  $("#CFTsave").tap(handletab('CFTLog'))
  $("#tab_NewCFT").tap(handletab('NewCFT'))
  $("#saveWeight").tap(handletab('WeightLog'))
  $("#GoNewPFT").tap(handletab('NewPFT'))
  $("#GoNewCFT").tap(handletab('NewCFT'))
  $("#GoBodyFat").tap(handletab('BodyFat'))
  $("#HeaderNewPFT").tap(handletab('NewPFT'))
  $("#HeaderNewCFT").tap(handletab('NewCFT'))
  $("#tab_NewPFT").tap(handletab('NewPFT')).tap()
  $("#tab_PFTLog").tap(handletab('PFTLog'))
  $("#tab_BodyFat").tap(handletab('BodyFat'))
  $("#HeaderPFTLog").tap(handletab('PFTLog'))
  $("#HeaderCFTLog").tap(handletab('CFTLog'))
  $("#tab_WeightLog").tap(handletab('WeightLog'))
})


window.applicationCache.addEventListener('updateready',function(){
	window.applicationCache.swapCache();
	location.reload();
});