/*!
 * Imageuploadify - jQuery plugin
 * Allow to change input file to a box allowing drag'n drop and preview images before
 * updloading them.
 */


// Semi-colon to protect against concatened scripts, etc...
// Ensure that $ is referencing to jQuery.
// window and document to slightly quicken the process.
// To be sure that undefined is truly undefined (For ES3)

var url_server = 'http://127.0.0.1:5000/';


var dog_breed;
var dog_mix_breed;
var all_breeds;
var divBreed;
var data;

var breed_1;
var breed_2;

function passToBreedInfo(breed) {
  if (breed === undefined) {
    console.log("Pass without breed "+breed);
    return dogBreedInfo(dog_breed, divBreed);
  } else {
    console.log("Pass to breed info " + breed);
    return requestBreedInfo(breed, divBreed);
  }
}

function drawFirst() {
        var data = google.visualization.arrayToDataTable([
          ['Breed', 'Percentage'],
          [breed_1[1],     breed_1[2]],
          ['Otros',     100-breed_1[2]]
        ]);

        var options = {
          title: breed_1[1],
          'width':180,
          'height':180,
          'titleFontSize':16,
           pieSliceTextStyle: {color: '#222222'},
          'backgroundColor': 'transparent',
          'legend': 'none',
           colors: ['#2986B2', '#e9ecef']
        };

        var chart = new google.visualization.PieChart(document.getElementById('FirstBreedChart'));

        chart.draw(data, options);
      }

function drawSecond() {

        var data = google.visualization.arrayToDataTable([
          ['Breed', 'Percentage'],
          [breed_2[1],     breed_2[2]],
          ['Otros',     100-breed_2[2]]
        ]);

        var options = {
          title: breed_2[1],
          'width':180,
          'height':180,
          'titleFontSize':16,
          'backgroundColor': 'transparent',
           pieSliceTextStyle: {color: '#222222'},
          'legend': 'none',
           colors: ['#2986B2', '#e9ecef']
        };

        var chart = new google.visualization.PieChart(document.getElementById('SecondBreedChart'));

        chart.draw(data, options);
      }

function createBreedObject(arrayBreed){
        var breedObject = new Object();

        breedObject.name = arrayBreed[0];
        breedObject.description = arrayBreed[10];
        breedObject.max_weight_male = arrayBreed[8];
        breedObject.min_weight_male = arrayBreed[9];
        breedObject.max_weight_female = arrayBreed[6];
        breedObject.min_weight_female = arrayBreed[7];
        breedObject.max_height_male = arrayBreed[4];
        breedObject.min_height_male = arrayBreed[5];
        breedObject.max_height_female = arrayBreed[2];
        breedObject.min_height_female = arrayBreed[3];
        breedObject.life_expectancy_max = arrayBreed[12];
        breedObject.life_expectancy_min = arrayBreed[13];
        breedObject.image = arrayBreed[1];
        breedObject.origin = arrayBreed[11];
        breedObject.more_information = arrayBreed[14];

        return breedObject;
      }

;(function($, window, document, undefined) {

  // Prevent issues about browser opening file by dropping it.
  window.addEventListener("dragover", function(e) {
    e = e || event;
    e.preventDefault();
  }, false);
  window.addEventListener("drop", function(e) {
    e = e || event;
    e.preventDefault();
  }, false);

  const compareMimeType = (mimeTypes, fileType, formatFile) => {

    // If accept is defined as *.
    if (mimeTypes.length < 2 && mimeTypes[0] === "*") {
      return true;
    }

    // Checking all types written in accept.
    for (let index = 1; index < mimeTypes.length; index+=3) {

      // image/*, audio/*, video/*
      if (mimeTypes[index + 1] === "*" &&
        fileType.search(new RegExp(mimeTypes[index])) != -1) {
        return true;
      }
      // application/vnd.ms-excel, application/vnd.ms-powerpoint
      else if (mimeTypes[index + 1] && mimeTypes[index + 1] != "*" &&
        fileType.search(new RegExp("\\*" + mimeTypes[index + 1] + "\\*")) != -1) {
        return true;
      }
      // application/pdf, image/jpg
      else if (mimeTypes[index + 1] && mimeTypes[index + 1] != "*" &&
        fileType.search(new RegExp(mimeTypes[index + 1])) != -1) {
        return true;
      }
      // .jpg, .pdf .png
      else if (mimeTypes[index + 1] === "" &&
        (fileType.search(new RegExp(mimeTypes[index])) != -1 || formatFile.search(new RegExp(mimeTypes[index])) != -1)) {
        return true;
      }
    }
    return false;
  }

  // Define the plugin imageuploadify.
  $.fn.imageuploadify = function(opts) {

      // Override default option with user's if exist.
    const settings = $.extend( {}, $.fn.imageuploadify.defaults, opts);

    // Initialize every element.
    this.each(function() {

      // Save the current element to self to avoid conflict.
      const self = this;

      // Save accept files
      let accept = $(self).attr("accept") ? $(self).attr("accept").replace(/\s/g, "").split(",") : null;
      let result = [];

      // Loop the array of accept files to split all part of mimetype or format.
      accept.forEach((item) => {
        let regexp;
        // Select the regexp according to the result (mimetype or format)
        if (item.search(/\//) != -1) {
          regexp = new RegExp("([A-Za-z-.]*)\/([A-Za-z-*.]*)", "g");
        }
        else {
          regexp = new RegExp("\.([A-Za-z-]*)()", "g");
        }
        // Exec the regexp and then 
        const r = regexp.exec(item);
        result = result.concat(r);
      });

      // Array containing all files add by dialog box or drag'n drop.
      let totalFiles = [];
      // Count the number of time a "dragenter" enter the box.
      let counter = 0;

      var textsRandom = ["Buscando la raza más parecida...", "Analizando su comportamiento...", "Viendo su color de pelo...", "Estudiando si es una mezcla...", "Comparando con nuestra base de datos...", "Descubriendo si es una persona o un perro...", "Examinando el color de ojos...", "Investigando el tamaño del perro...", "Analizando si es un adulto o un cachorro..."];
      var textsSequential = ["Conectando con el servidor...", "Detectando humano o perro...", "Analizando si es un adulto o un cachorro...", "Buscando la raza más parecida...", "Preparando el resultado..."];
      var textsNumber = 0;
      function changeText() {
          $("#loadingText").text(textsRandom[textsNumber]);
          textsNumber = Math.floor(Math.random() * 8);
      }
      setInterval(changeText, 3654);

      // Define the dragbox layout.
      let dragbox = $(`
      <div class="imageuploadify well">
        <div class="imageuploadify-overlay">
        <i class="far fa-image"></i>
        </div>
        <div id="drag" class="imageuploadify-images-list text-center" >
          <i class="fas fa-cloud-upload-alt"></i>
          <span class='imageuploadify-message'><b>Arrastra tu imagen aquí...</b></span>
          <br>
          <button type="button" class="btn btn-default">O selecciónala</button>
        </div>
        
        <div id="div_load" class="imageuploadify-loading text-center" >
          <p><h4>Estamos procesando la imagen</h4>
          <img src="../static/images/loading.svg" id="loading" alt="Cargando..."/>
          <h5 id="loadingText" style="color: #222222">Conectando con el servidor...</h5>
        </div>

      </div>
      `);
      
      // Save all elements of the dragbox.
      let overlay = dragbox.find(".imageuploadify-overlay");
      let uploadIcon = dragbox.find(".imageuploadify-overlay i");
      let imagesList = dragbox.find(".imageuploadify-images-list");
      let addIcon = dragbox.find(".imageuploadify-images-list i");
      let addMsg = dragbox.find(".imageuploadify-images-list span");
      let button = dragbox.find(".imageuploadify-images-list button");
      let loading = dragbox.find(".imageuploadify-loading");
      
      loading.css({"display": "none"});
      
      /** FUNCTIONS  **/

      // Function to read and store files. 
      const retrieveFiles = (files) => {
        let index = 0;
          if (!accept || compareMimeType(result, files[index].type, /(?:\.([^.]+))?$/.exec(files[index].name)[1])) {
            // Unique number to save the image.
            const id = Math.random().toString(36).substr(2, 9);

            readingFile(id, files[index]);
            totalFiles.push({
              id:   id,
              file: files[index]
            });
          }
      }


      function selectDivBreed(data_type){
        google.charts.load('current', {'packages':['corechart']});

        if(data_type===1) {
          if (all_breeds[0][2] > 85) {
            divBreed = "<img src='" + dog_breed.image + "' height='150' width='150'><br>";
            divBreed += "<h3 id='nombrePlaga'> " + dog_breed.name + "</h3>";
            divBreed += "<h5>Coincidencia: <b>" + all_breeds[0][2] + "%</b></h5>";
            divBreed += "<h6> " + dog_breed.description + "</h6>";
            divBreed += "<div class='row'> <div class='col-xs-6 col-md-4'>";
            divBreed += "<a href='#cta' class='btn btn-primary' role='button' onClick='passToInput()'><i class='fas fa-chevron-left'></i> Volver atrás</a></div>";
            divBreed += "<div class='col-xs-6 col-md-4'></div>";
            divBreed += "<div class='col-xs-6 col-md-4'>";
            divBreed += "<a href='#cta' class='btn btn-primary' role='button' onClick='passToBreedInfo()'>Saber más <i class='fas fa-chevron-right'></i></a></div></div><hr>";
            divBreed += '<a class="btn btn-primary" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">Resultado completo <i class="fas fa-chevron-down"></i> </a><hr>'
            divBreed += '<div class="collapse" id="collapseExample">';
            var i;
            for (i = 0; i < 3; i++) {
              divBreed += "<div class='row'><div class='col'><div class='progress' style='height:30px; color:#222222'><div class='progress-bar-breed' style='width:" + all_breeds[i][2] + "%;height:30px'>" + all_breeds[i][1] + " - " + all_breeds[i][2] + "%</div></div></div><div class = 'col col-xs-6 col-md-4'><a href='#cta' class='btn btn-primary' role='button' onClick='passToBreedInfo(`"+all_breeds[i][0]+"`)'>Saber más <i class='fas fa-chevron-right'></i></a></div></div>"
            }
            divBreed += "</div><br>"
          } else if ((85 > all_breeds[0][2]) && (all_breeds[0][2] > 30)) {
            dog_mix_breed = createBreedObject(data[3][0]);
            divBreed = "<br>";
            divBreed += "<h4> Creemos que es una mezcla entre...</h4>";
            divBreed += "<div class='container'><div class='row'><div class='col'>"
            divBreed += "<img src='" + dog_breed.image + "' height='150' width='150'></div><div class='col'><img src='" + dog_mix_breed.image + "' height='150' width='150'></div></div>";
            breed_1 = all_breeds[0];
            google.charts.setOnLoadCallback(drawFirst);
            divBreed += "<div class='container'><div class='row'><div class='col'>"
            divBreed += '<div id="FirstBreedChart"  style="width: 180px; height: 180px; margin: 0 auto"></div></div>';
            breed_2 = all_breeds[1];
            google.charts.setOnLoadCallback(drawSecond);
            divBreed += '<div class="col"><div id="SecondBreedChart" style="width: 180px; height: 180px; margin: 0 auto"></div></div></div>';
            divBreed += "<div class='row'> <div class='col-xs-6 col-md-4'>";
            divBreed += "<a href='#cta' class='btn btn-primary' role='button' onClick='passToInput()'><i class='fas fa-chevron-left'></i> Volver atrás</a></div>";
            divBreed += "<div class='col-xs-6 col-md-4'></div>";
            divBreed += "<div class='col-xs-6 col-md-4'>";
            divBreed += "<a href='#cta' class='btn btn-primary' role='button' onClick='passToBreedInfo()'>Saber más <i class='fas fa-chevron-right'></i></a></div></div><hr>";
            divBreed += '<a class="btn btn-primary" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">Resultado completo <i class="fas fa-chevron-down"></i> </a><hr>'
            divBreed += '<div class="collapse" id="collapseExample">';
            var i;
            for (i = 0; i < 3; i++) {
              divBreed += "<div class='row'><div class='col'><div class='progress' style='height:30px; color:#222222'><div class='progress-bar-breed' style='width:" + all_breeds[i][2] + "%;height:30px'>" + all_breeds[i][1] + " - " + all_breeds[i][2] + "%</div></div></div><div class = 'col col-xs-6 col-md-4'><a href='#cta' class='btn btn-primary' role='button' onClick='passToBreedInfo(`"+all_breeds[i][0]+"`)'>Saber más <i class='fas fa-chevron-right'></i></a></div></div>"
            }
            divBreed += "</div><br>"
          } else if (all_breeds[0][2] < 30) {
            divBreed = "<br>"
            divBreed += "<h4> Estamos bastante confusos, pero puede ser...</h4>";
            divBreed += "<h3 id='nombrePlaga'> " + dog_breed.name + "</h3>";
            divBreed += "<h5>Coincidencia: <b>" + all_breeds[0][2] + "%</b></h5>";
            divBreed += "<h6> " + dog_breed.description + "</h6>";
            divBreed += "<div class='row'> <div class='col-xs-6 col-md-4'>";
            divBreed += "<a href='#cta' class='btn btn-primary' role='button' onClick='passToInput()'><i class='fas fa-chevron-left'></i> Volver atrás</a></div>";
            divBreed += "<div class='col-xs-6 col-md-4'></div>";
            divBreed += "<div class='col-xs-6 col-md-4'>";
            divBreed += "<a href='#cta' class='btn btn-primary' role='button' onClick='passToBreedInfo()'>Saber más <i class='fas fa-chevron-right'></i></a></div></div><hr>";
            divBreed += '<a class="btn btn-primary" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">Resultado completo <i class="fas fa-chevron-down"></i> </a><hr>'
            divBreed += '<div class="collapse" id="collapseExample">';
            var i;
            for (i = 0; i < 3; i++) {
              divBreed += "<div class='row'><div class='col'><div class='progress' style='height:30px; color:#222222'><div class='progress-bar-breed' style='width:" + all_breeds[i][2] + "%;height:30px'>" + all_breeds[i][1] + " - " + all_breeds[i][2] + "%</div></div></div><div class = 'col col-xs-6 col-md-4'><a href='#cta' class='btn btn-primary' role='button' onClick='passToBreedInfo(`"+all_breeds[i][0]+"`)'>Saber más <i class='fas fa-chevron-right'></i></a></div></div>"
            }
            divBreed += "</div><br>"
          }
        } else if (data_type===2){
            divBreed = "<br>"
            divBreed += "<h4> Hemos detectado un humano, que creemos que se parece a...</h4>";
            divBreed += "<img src='" + dog_breed.image + "' height='150' width='150'><br>";
            divBreed += "<h3 id='nombrePlaga'> " + dog_breed.name + "</h3>";
            divBreed += "<h5>Coincidencia: <b>" + all_breeds[0][2] + "%</b></h5>";
            divBreed += "<h6> " + dog_breed.description + "</h6>";
            divBreed += "<div class='row'> <div class='col-xs-6 col-md-4'>";
            divBreed += "<a href='#cta' class='btn btn-primary' role='button' onClick='passToInput()'><i class='fas fa-chevron-left'></i> Volver atrás</a></div>";
            divBreed += "<div class='col-xs-6 col-md-4'></div>";
            divBreed += "<div class='col-xs-6 col-md-4'>";
            divBreed += "<a href='#cta' class='btn btn-primary' role='button' onClick='passToBreedInfo()'>Saber más <i class='fas fa-chevron-right'></i></a></div></div><hr>";
            divBreed += '<a class="btn btn-primary" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">Resultado completo <i class="fas fa-chevron-down"></i> </a><hr>'
            divBreed += '<div class="collapse" id="collapseExample">';
            var i;
            for (i = 0; i < 3; i++) {
              divBreed += "<div class='row'><div class='col'><div class='progress' style='height:30px; color:#222222'><div class='progress-bar-breed' style='width:" + all_breeds[i][2] + "%;height:30px'>" + all_breeds[i][1] + " - " + all_breeds[i][2] + "%</div></div></div><div class = 'col col-xs-6 col-md-4'><a href='#cta' class='btn btn-primary' role='button' onClick='passToBreedInfo(`"+all_breeds[i][0]+"`)'>Saber más <i class='fas fa-chevron-right'></i></a></div></div>"
            }
            divBreed += "</div><br>"
        } else {
            divBreed = "<img src='../static/images/not_found.svg' height='150' width='150'><br>";
            divBreed += "<h3> No hemos encontrado ningún perro en tu foto</h3>";
            divBreed += "<h5>Por favor, vuelve a intentarlo</h5><br>";
            divBreed += "<div class='row'> <div class='col-xs-6 col-md-4'></div>";
            divBreed += "<div class='col-xs-6 col-md-4'><a href='#cta' class='btn btn-primary' role='button' onClick='passToInput()'><i class='fas fa-chevron-left'></i> Volver atrás</a></div>";
            divBreed += "<div class='col-xs-6 col-md-4'></div></div>";
        }

        return divBreed;
      }

      const readingFile = (id, file) => {
          const fReader = new FileReader();

         if (file.type && file.type.search(/image/) != -1) {
          // Associated function to a ending load
         fReader.onloadend = function (e) {
            // Create the image tag for preview.

            formdata = new FormData();

            console.log(totalFiles)

            formdata.append("name",totalFiles[0].file.name);
            formdata.append("file",totalFiles[0].file);

            // Serialize the form data

            	if (formdata){
            		// Borramos los botones
            		imagesList.css({"display": "none"});   
            		
            		// Mostramos la carga
            		loading.css({"display": "block"});
            		
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', url_server + 'upload');
                    xhr.onload = function () {
                    	console.log("Imagen subida.")
                    	console.log(xhr.status);
                    	console.log(xhr.responseText);

                    	data = JSON.parse(xhr.responseText);
                    	var data_type = data[0];
                    	console.log(data_type);
                    	if (data_type > 0) {
                    	    all_breeds = data[1];
                    	    dog_breed = createBreedObject(data[2][0]);
                    	}
                    	divBreed = selectDivBreed(data_type);

                    	document.getElementById("dog_breeds").innerHTML = divBreed;
                    };

                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                    		loading.css({"display": "none"});
                        }
                    };

                    xhr.upload.onprogress = function (event) {
                    	console.log("Imagen en progreso...");
                    };

                    xhr.send(formdata);  
                    }
            }

          };

          fReader.readAsDataURL(file);
        }

      const disableMouseEvents = () => {
        // Display the overlay and change the dragbox border color.
        overlay.css("display", "flex");
        dragbox.css("border-color", "#3AA0FF");

        // Disable pointer events to avoid miscapture dragexit children's events.
        button.css("pointer-events", "none");
        addMsg.css("pointer-events", "none");
        addIcon.css("pointer-events", "none");
        imagesList.css("pointer-events", "none");
      }

      const enableMouseEvents = () => {
          // Hide the overlay and put back the dragbox border color.
          overlay.css("display", "none");
          dragbox.css("border-color", "rgb(210, 210, 210)");

        // Enable back pointer events to capture click, hover... 
          button.css("pointer-events", "initial");
          addMsg.css("pointer-events", "initial");
          addIcon.css("pointer-events", "initial");
          imagesList.css("pointer-events", "initial");
      }

      /** EVENTS  */


      // Change the color background of the button according to the mouse.
      button.mouseenter(function onMouseEnter(event) {
        button.css("background", "#fffff").css("color", "2986B2");
      }).mouseleave(function onMouseLeave() {
        button.css("background", "#2986B2").css("color", "#fffff");
      });


      // When click on the button, simulate click on the original input.
      button.on("click", function onClick(event) {
        event.stopPropagation();
        event.preventDefault();
        $(self).click();
      });

      // Manage events to display an overlay when dragover files.
      dragbox.on("dragenter", function onDragenter(event) {
        event.stopPropagation();
        event.preventDefault();

        // Increment the counter.
        counter++;
        disableMouseEvents();
      });

      // Manage events to hide the overlay when dragout files.
      dragbox.on("dragleave", function onDragLeave(event) {
        event.stopPropagation();
        event.preventDefault();

        // Decrease the counter.
        counter--;

        // If the counter is equal to 0 (means that the files are entirely out
        // of the dragbox).
        if (counter === 0) {
          enableMouseEvents();
        }
      });

      // Manage events when dropping files.
      dragbox.on("drop", function onDrop(event) {
        event.stopPropagation();
        event.preventDefault();

        enableMouseEvents();
        // Retrieve the dragged files.
        const files = event.originalEvent.dataTransfer.files;

        // Read all files (to add them to the preview and push them to the files
        // list to submit).
        retrieveFiles(files);
      });


      // Detect when adding files through the dialog box to preview those files
      // and add them to the array.
      $(self).on("change", function onChange() {
        const files = this.files;
        retrieveFiles(files);
      });

      
      // When submitting the form.
      $(self).closest("form").on("submit", function(event) {
        // Stop the original submit.
        event.stopPropagation();
        event.preventDefault(event);
        // Retrieve all form inputs.
        const inputs = this.querySelectorAll("input, textarea, select, button");
        // Create a form.
        const formData = new FormData();

        let index = 0;
        // Add all data to the form (selected options, checked inputs, etc...).
          if (inputs[index].tagName === "SELECT" && inputs[index].hasAttribute("multiple") && counter<1) {
            const options = inputs[index].options;
            for (let i = 0; options.length > i; ++i) {
              if (options[i].selected) {
                formData.append(inputs[index].getAttribute("name"), options[i].value);
              }
            }
          }

          else if (!inputs[index].getAttribute("type") || ((inputs[index].getAttribute("type").toLowerCase()) !== "checkbox" && (inputs[index].getAttribute("type").toLowerCase()) !== "radio") || inputs[index].checked) {
            formData.append(inputs[index].name, inputs[index].value);
          }
          else if ($(inputs[index]).getAttribute("type") != "file") {
            formData.append(inputs[index].name, inputs[index].value);  
          }
        

        // Add all files get from the dialog box or drag'n drop,
          formData.append(self.name, totalFiles[0].file);

          if(formData){
                $.ajax({
                   url : url_server + 'upload',
                   type : 'POST',
                   data : formData,
                   processData : false, 
                   contentType : false
                });
            }
        
        // Create an request and post all data.
        var xhr = new XMLHttpRequest();

        // When the request has been successfully submitted, redirect to the
        // location of the form.
        xhr.onreadystatechange = function(e) {
          if (xhr.status == 200 && xhr.readyState === XMLHttpRequest.DONE) {
            window.location.replace(xhr.responseURL);
          }
        }

        xhr.open("POST", $(this).attr("action"), true);
        xhr.send(formData);

        return false;
      });
    

      // Hide the original input.
      $(self).hide();
      // Insert the dragbox after the original hidden input.
      dragbox.insertAfter(this);
    });
    
    
    
    // Return "this" to ensure that chaining methods can be called.
    return this;
  };


  // Default configuraiton of the plugin.
  $.fn.imageuploadify.defaults = {
  };


}(jQuery, window, document));
