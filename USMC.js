/*
	Daniel Hackenberger	
	20170202
	This app calculates, stores, and loads PFT scores for Male Marines between 26-30 years of age.
*/

document.ontouchmove = function(e){ e.preventDefault(); }
var PFTRecord = []; //Initialize Record Log
var PFTScores = []; //Initialize Score Log

$('#testinput').val('Beginning');//*************************************
	
$(document).ready(function(){
	$('#testinput').val('a');//*************************************
	
	if(localStorage.getItem('record')){
		PFTRecord = JSON.parse(localStorage.getItem('record')); //Load Event Records
	}
	if(localStorage.getItem('scores')){
		PFTScores = JSON.parse(localStorage.getItem('scores')); //Load Scores
	} 
	document.getElementById("Date").valueAsDate = new Date(); // Initialize date in as today's date for new PFT
	$('#testinput').val('b');//*************************************
	
	for( var i = 0; i < PFTRecord.length; i++ ) { //add records to PFTLog screen
		initialadditem(PFTRecord[i], PFTScores[i]);		
	}
	
	$('#clear').tap(function(){ 
		//Listens for tap on the "clear" button.  Calls to Clear the entries in new PFT
		clearPFT();		
	});

	$('#save').tap(function(){
		//Listens for save button to be pushed - Save the entries as a new entry in the log, update global records, save items to local storage
		var Pull = $('#PullUps').val();
		var Push = $('#PushUps').val();
		var Crunch = $('#Crunches').val();
		var RunMin = $('#RunTimeMinutes').val();
		var RunSec = $('#RunTimeSeconds').val();
		var PFTDateRan = $('#Date').val();
		$('#testinput').val('Save1');//*************************************
		clearPFT();
	$('#testinput').val('Save2');//*************************************
		
		var id = new Date().getTime();
		var recorddata = {id:id, Pull:Pull,Push:Push,Crunch:Crunch,RunMin:RunMin,RunSec:RunSec,PFTDateRan:PFTDateRan };
		$('#testinput').val('Save3');//*************************************
	
		PFTRecord.push(recorddata);
		var PFTData = CalculateScore(recorddata);
		$('#testinput').val('Save4');//*************************************
	
		additem(recorddata, PFTData);		
		saveitems(PFTRecord);
		$('#testinput').val('Endofsave reached');//*************************************

	});
});

function clearPFT() {
	//Clears the new PFT log entries and reinitializes the Date as today's date
	$('#PullUps').val('');
	$('#PushUps').val('');
	$('#Crunches').val('');
	$('#RunTimeMinutes').val('');
	$('#RunTimeSeconds').val('');
	$('#testinput').val('clearPFT');//*************************************

	document.getElementById("Date").valueAsDate = new Date();
}
function initialadditem(itemdata, PFTData1) {
	//Requires Results object, and PFT score object.  Adds the loaded items into the log. Need this because listview.('refresh') will not work unless the log is initialized. 
	var item = $('#score_entry').clone(); 
	item.attr({id:itemdata.id});
	
	var displayPFT = "Date: \n" + JSON.stringify(itemdata.PFTDateRan) +
	    " Pull Ups: " + itemdata.Pull + " Score: \n" + PFTData1.PullScore +
		" Push Ups: " + itemdata.Push + " Score: \n" + PFTData1.PushScore +
		" Crunches: " + itemdata.Crunch + " Score: \n" + PFTData1.CrunchScore + 
		" Run Time: " + itemdata.RunMin + ":" + itemdata.RunSec + " Score: \n" + PFTData1.RunScore +
		" TOTAL SCORE: " + PFTData1.TotalScore + " PFT CLASS: " + PFTData1.PFTClass;
		
	item.find('span.text').text(displayPFT);
	
	var delbutton = $('#delete_entry').clone().show();
	
	item.append(delbutton);
	$('#testinput').val('initialadditem');//*************************************
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

function CalculateScore(Results)
{	//Requires Score Array. Calculates the scores, returns object of PFT scores.
		var PullTable = [0,40,43,47,50,53,57,60,63,67,70,73,77,80,83,87,90,93,97,100];
		var PushTable = [0,40,41,41,42,43,43,44,45,45,46,47,47,48,49,49,50,51,51,52,53,53,54,55,55,56,57,57,58,59,59,60,61,61,62,63,63,64,65,65,66,67,67,68,69,69,70];
		var CrunchTable = [0,40,41,43,44,45,47,48,49,51,52,53,55,56,57,59,60,61,63,64,65,67,68,69,71,72,73,75,76,77,79,80,81,83,84,85,87,88,89,91,92,93,95,96,97,99,100];
		
		var PullScore = 0;
		var PushScore = 0;
		var CrunchScore = 0;
		var RunScore = 0;
		
		//CALCULATE PULLUPS SCORE
		if(Results.Pull < 5){PullScore = 0;	}
		else if(Results.Pull > 22){PullScore=100;}
		else{PullScore=PullTable[Results.Pull-4];}
		
		//CALCULATE PUSHUPS SCORE
		if(Results.Push==0) {
			PushScore=0;
		}
		else if(Results.Push<39) {
			PullScore=0;
			PushScore=0;
		}
		else if(Results.Push>83) {
			PullScore=0;
			PushScore=70;
		}
		else {
			PullScore=0;
			PushScore=PushTable[Results.Push-38];
		}
		
		//CALCULATE CRUNCHES
		if(Results.Crunch<70){CrunchScore=0;}
		else if(Results.Crunch>115){CrunchScore=100;}
		else {CrunchScore=CrunchTable[Results.Crunch-69];}
		
		//CALCULATE RUN TIME
		var RunCalc=0;
		
		if(Results.RunMin == 0){
			RunScore=0;
		}
		else if(Results.RunMin < 18 ){
			RunScore=100;
			$('#PullScoreHere').val('Too Fast');
		}
		else if(Results.RunMin > 27 && Results.RunSec > 0) {
			RunScore = 0;
			$('#PullScoreHere').val('Too Slow');
		}
		else{
			RunCalc = (Results.RunMin-18)*6;
			RunCalc = RunCalc + (Math.floor(Results.RunSec/10));
			if(Results.RunSec%10 != 0){
				RunCalc=RunCalc+1;
			}
			RunScore=Math.abs(RunCalc-100);			
			
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

window.applicationCache.addEventListener('updateready',function(){
	window.applicationCache.swapCache();
	location.reload();
});