'use strict';

/**
 * @ngdoc function
 * @name DogFinderApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the DogFinderApp
 */
app.controller('mainCtrl', ['mainService', '$window', function (mainService, $window) {

  var vm = this;
  var url_server = 'http://127.1.1.1:5000/AgroVision/rest/';

  vm.mainService = mainService;

  // Prevent issues about browser opening file by dropping it.
  $window.addEventListener("dragover", function(e) {
    e = e || event;
    e.preventDefault();
  }, false);
  $window.addEventListener("drop", function(e) {
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
  angular.element.prototype.imageuploadify = function(opts) {

      // Override default option with user's if exist.
    const settings = angular.extend( {}, angular.element.prototype.imageuploadify.defaults, opts);

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
          <p><h6>Estamos procesando la imagen</h6>
          <h6>En su primer uso, esto puede tardar unos minutos...</h6></p>
          <img src="img/2.gif" id="loading" />
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

      const readingFile = (id, file) => {

          const fReader = new FileReader();

         if (file.type && file.type.search(/image/) != -1) {
          // Associated function to a ending load
         fReader.onloadend = function (e) {
            // Create the image tag for preview.

           var formdata;
           formdata = new FormData();

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
                    	var plaga;
                    	var divPlaga;
                    	if (xhr.responseText == "" ){
                    		divPlaga = "<img src='img/not_found.png' height='150' width='150'>";
                        	divPlaga += "<p><h3>No hemos encontrado resultados</h3></p>";
                        	divPlaga += "<b>Posibles causas:</b>";
                        	divPlaga += "<ul style='list-style-type:disc'>";
                        	divPlaga += "<li>La plaga no ha sido detectada por API Google Vision.</li>";
                        	divPlaga += "<li>No tenemos información sobre esa plaga en nuestra base de datos.</li>";
                        	divPlaga += "<li>La foto no corresponde a una plaga.</li></ul>";
                        	divPlaga += "<a href='#download' class='btn btn-default' role='button' onClick='passToInput(`cultivo`)'>< Volver atrás</a>"
                    	}
                    	else {
                    		plaga = JSON.parse(xhr.responseText);
                        	divPlaga = "<img src='"+plaga.imagen+"' height='150' width='150'><br>";
                        	divPlaga += "<br><h3 id='nombrePlaga'> "+plaga.nombre + "</h3>";
                        	divPlaga += "<h5><b>Coincidencia: </b>"+plaga.coincidencia+"%</h5>";
                        	divPlaga += "<p><h6> "+plaga.descripcion +"</h6></p>";
                        	divPlaga += "<p><h6> <b>Causa: </b> "+plaga.causa+" </h6></p>";
                        	divPlaga += "<div class='row'> <div class='col-xs-6 col-md-4'>";
                        	divPlaga += "<a href='#download' class='btn btn-default' role='button' onClick='passToInput(`cultivo`)'>< Volver atrás</a></div>";
                        	divPlaga += "<div class='col-xs-6 col-md-4'></div>";
                        	divPlaga += "<div class='col-xs-6 col-md-4'>";
                        	divPlaga += "<a href='#download' class='btn btn-default' role='button' onClick='tratamientos(`"+plaga.nombre+"`);'>Ver tratamientos ></a></div>";
                    	}
                    	document.getElementById("app").innerHTML = divPlaga;
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
  angular.element.prototype.imageuploadify.defaults = {
  };


}]);
