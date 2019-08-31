var breed;

var divBreedInfo;
var divBreedMain;

var url_server = 'http://127.0.0.1:5000/';

function passToInput(){
	var input = '<form><input type="file" accept="image/*"></form>';
	document.getElementById("dog_breeds").innerHTML = input;
	$('input[type="file"]').imageuploadify();
}

function dogBreedInfo(breedChoiced, divBreed){
	divBreedMain = divBreed;

	divBreedInfo = "<img src='" + breedChoiced.image + "' height='150' width='150'><br>";
	divBreedInfo += "<h3 id='nombrePlaga'> " + breedChoiced.name + "</h3>";
	divBreedInfo += "<h6> " + breedChoiced.description + "</h6>";
	divBreedInfo += "<h5 style='color: #222222'><b>Origen:</b> " + breedChoiced.origin +"</h5>";
	divBreedInfo += "<h5 style='color: #222222'><b> Esperanza de vida:</b> " + breedChoiced.life_expectancy_max + " años - "+ breedChoiced.life_expectancy_min +" años</h5>";
	divBreedInfo += '<a class="btn btn-primary" data-toggle="collapse" href="#collapsePeso" role="button" aria-expanded="false" aria-controls="collapsePeso">Peso <i class="fas fa-chevron-down"></i> </a>'
	divBreedInfo += '<div class="collapse" id="collapsePeso">';
	divBreedInfo += '<div class="card card-body"> <h6><b>Macho:</b> '+breedChoiced.max_weight_male+' kg - '+breedChoiced.min_weight_male+' kg </h6> <h6><b>Hembra:</b> '+breedChoiced.max_weight_female+' kg - '+breedChoiced.min_weight_female+' kg </h6> </div>';
	divBreedInfo += "</div><br>";
	divBreedInfo += '<a class="btn btn-primary" data-toggle="collapse" href="#collapseAltura" role="button" aria-expanded="false" aria-controls="collapseAltura">Altura <i class="fas fa-chevron-down"></i> </a>'
	divBreedInfo += '<div class="collapse" id="collapseAltura">';
	divBreedInfo += '<div class="card card-body"> <h6><b>Macho:</b> '+breedChoiced.max_height_male+' cm - '+breedChoiced.min_height_male+' cm </h6> <h6><b>Hembra:</b> '+breedChoiced.max_height_female+' cm - '+breedChoiced.min_height_female+' cm </h6> </div>';
	divBreedInfo += "</div><br>";
	divBreedInfo += "<div class='row'> <div class='col-xs-6 col-md-4'>";
	divBreedInfo += "<a href='#cta' class='btn btn-primary' role='button' onClick='returnResult()'><i class='fas fa-chevron-left'></i> Volver atrás</a></div>";
	divBreedInfo += "<div class='col-xs-6 col-md-4'></div>";
	divBreedInfo += "<div class='col-xs-6 col-md-4'>";
	divBreedInfo += "<a href='"+breedChoiced.more_information+"' target='_blank' class='btn btn-primary' role='button'>Ver ficha <i class='fas fa-chevron-right'></i></a></div></div><hr>";

	document.getElementById("dog_breeds").innerHTML = divBreedInfo;

}

function requestBreedInfo(breed, divBreed) {

	const formData = new FormData();
	formData.append("breed",breed);

	var xhr = new XMLHttpRequest();
    xhr.open('GET', url_server + 'breed/'+breed);

    xhr.onload = function () {
    	var breedChoicedArray = JSON.parse(xhr.responseText);
    	var breedChoiced = createBreedObject(breedChoicedArray[0]);
    	dogBreedInfo(breedChoiced,divBreed);
    };

    xhr.send();

}

function returnResult(){
		google.charts.setOnLoadCallback(drawFirst);
		google.charts.setOnLoadCallback(drawSecond);
		document.getElementById("dog_breeds").innerHTML = divBreedMain;
}
