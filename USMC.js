/*
	Daniel Hackenberger	
	ROUND THE HEIGHT UP FOR HALF VALUES WHEN GETTING MIN AND MAX WEIGHTS!
	test test test
   	Change tap to add PFT
	*/

document.ontouchmove = function(e){ e.preventDefault(); }
var PFTRecord = []; //Initialize Record Log
var PFTScores = []; //Initialize Score Log	
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
	document.getElementById("Date").valueAsDate = new Date(); // Initialize date in as today's date for new PFT
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
	
	$('#clear').tap(function(){ 
		//Listens for tap on the "clear" button.  Calls to Clear the entries in new PFT
		clearPFT();		
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
					RunScore = RunTable[getRunIndex(Results.RunMin, Results.RunSec, 18,0,RunTable.length)];
				
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
  $("#saveWeight").tap(handletab('WeightLog'))
  $("#GoNewPFT").tap(handletab('NewPFT'))
  $("#GoBodyFat").tap(handletab('BodyFat'))
  $("#tab_NewPFT").tap(handletab('NewPFT')).tap()
  $("#tab_PFTLog").tap(handletab('PFTLog'))
  $("#tab_BodyFat").tap(handletab('BodyFat'))
  $("#tab_WeightLog").tap(handletab('WeightLog'))
})


window.applicationCache.addEventListener('updateready',function(){
	window.applicationCache.swapCache();
	location.reload();
});