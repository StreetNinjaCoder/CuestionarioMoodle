"use strict";
// GLOBAL
////
var divPreguntas = document.querySelector("#divPreguntas"); //Esta es la variable global correspondiente al div donde iran las preguntas
var divErrores = document.querySelector("#divErrores"); //Esta es la variable global donde se mostraran los errores
var contadorIDs = 0; //Contador encargado de ir asignandole ids a las preguntas cuando se van generando

//////////
//MAIN //
////////
arranque(); // Cada vez que carga la aplicacion web se ejecutara este metodo

//EVENT LISTENERS
/////

/*Estos Event listener controlan los eventos onclick de los 4 botones situados en el formulario */
let btnGuardarPregunta = document.querySelector("#guardarPregunta");
btnGuardarPregunta.addEventListener("click", guardarPregunta);

let btnSavePreguntas = document.querySelector("#savePreguntas");
btnSavePreguntas.addEventListener("click", savePreguntas);

let btnDelPreguntas = document.querySelector("#delPreguntas");
btnDelPreguntas.addEventListener("click", delPreguntas);

let btnGenArchivo = document.querySelector("#genArchivo");
btnGenArchivo.addEventListener("click", generarArchivo);
//////////////
//FUNCTION //
////////////

function arranque() {
  /*Cuando carga la pagina web  */
  if (!localStorage.getItem("Cuestionario") == "") { //Si no existe el localStorage, se crea y se muestra una alerta
    let preguntas = localStorage.getItem("Cuestionario");
    /*Se parsea del localStorage el array de Preguntas el objeto cuestionario, sin metodos por ser un JSON*/
    preguntas = JSON.parse(preguntas);
    preguntas.forEach((p) => {
      /*Este bucle recorre el array recuperado y le introduce a cada pregunta su metodo otra vez */
      p.toHTMLUL = function () {
        let elementoUL = `<ul>`;
        elementoUL += `<li>${this.texto}</li>`;
        elementoUL += `<li>${this.rC}</li>`;

        this.rI.forEach((inc) => {
          elementoUL += `<li>${inc}</li>`;
        });

        elementoUL += `</ul>`;
        return elementoUL;
      };
    });
    Cuestionario.preguntas = preguntas; //Finalmente se introduce de nuevo en el Cuestionario

    contadorIDs = localStorage.getItem('contadorSav'); //Se recupera tambien el contador para poder seguir generando preguntas
    mostrarPreguntas();
  } else {
    alert("Todavía no hay preguntas creada");
    localStorage.setItem("Cuestionario", "");
    //Se crea el Cuestionario en objetos.js
  }
}

function generarArchivo() {
  divErrores.innerHTML = "";
  if (!localStorage.getItem("Cuestionario") == "") {
    let arrPreguntas = localStorage.getItem("Cuestionario");
    arrPreguntas = JSON.parse(arrPreguntas);

    let arrContenido = [];

    arrPreguntas.forEach((p) => {
      arrContenido.push(`${p.texto} \n`);
      arrContenido.push(`{\n`);
      arrContenido.push(`"=... ${p.rC}\n`);
      arrContenido.push(`~%-25%${p.rI[0]}\n`);
      arrContenido.push(`~%-25%${p.rI[1]}\n`);
      arrContenido.push(`~%-25%${p.rI[2]}\n`);
      arrContenido.push(`}\n`);
    });

    let fichero = new File(arrContenido, { type: "text/plain; charset=UTF-8" });
    var url = window.URL.createObjectURL(fichero);
    let divURL = document.querySelector("#urlFichero");

    divURL.innerHTML =
      '<a download="preguntas.txt" href="' +
      url +
      '">Descargar fichero (📄)</a>';
  } else {
    divErrores.innerHTML = "<h1>No has guardado ninguna pregunta</h1>";
  }
}

function savePreguntas() {
  localStorage.setItem("Cuestionario", JSON.stringify(Cuestionario.preguntas));
}

function delPreguntas() {
  localStorage.setItem("Cuestionario", "");
  Cuestionario.preguntas = [];
  mostrarPreguntas();
}

function guardarPregunta() {

  //Se recuperan los datos de los inputs y se borran los espacios para que no haya accidentes con espacios

  let texto = String(document.querySelector("#texto").value).trim();

  let rC = String(document.querySelector("#rC").value).trim();

  let rI1 = String(document.querySelector("#rI1").value).trim();

  let rI2 = String(document.querySelector("#rI2").value).trim();

  let rI3 = String(document.querySelector("#rI3").value).trim();

  if (validateInputs(texto, rC, rI1, rI2, rI3)) {
    // Si la validacion es correcta se descapea
    texto = escapear(texto);
    rC = escapear(rC);
    rI1 = escapear(rI1);
    rI2 = escapear(rI2);
    rI3 = escapear(rI3);

    let rI = [rI1, rI2, rI3]; // Aqui estaria el array de respuestas incorrectas

    let id = contadorIDs; // Aqui se asignaria un id nuevo
    contadorIDs++; // Se prepara un nuevo id

    let oPregunta = new Pregunta(id, texto, rC, rI); //Se crea la pregunta

    Cuestionario.addPregunta(oPregunta); // Se añade al cuestionario

    mostrarPreguntas();
  }
}

function recuperarPregunta(id) {
  //Se obtiene el indice de la pregunta con el id introducido y se recupera
  const index = Cuestionario.preguntas.findIndex((p) => p.id === id);
  let pRecuperada = Cuestionario.getPregunta(index); //Se utiliza el metodo getPregunta para poder recuperar la pregunta

  //Se devulve el contenido de la pregunta a los inputs pero descapeado
  document.querySelector("#texto").value = descapear(pRecuperada.texto);
  document.querySelector("#rC").value = descapear(pRecuperada.rC);
  document.querySelector("#rI1").value = descapear(pRecuperada.rI[0]);
  document.querySelector("#rI2").value = descapear(pRecuperada.rI[1]);
  document.querySelector("#rI3").value = descapear(pRecuperada.rI[2]);
}

//AUXILIAR FUNCTIONS
//////

function mostrarPreguntas() {
  divPreguntas.innerHTML = "";
  Cuestionario.preguntas.forEach((p) => {
    divPreguntas.innerHTML += Cuestionario.preguntaToHTMLDiv(p.id);
  });
}

function validateInputs(texto, rC, rI1, rI2, rI3) {
  /*Esta funcion auxiliar se encarga de comprobar que todos los campos del formulario estan rellenos*/
  // Valida inputs y muestra errores//


  /*Se hace la comprobacion, edemas es aprueba de poner un solo espacio en el input  */
  if (
    texto.length == 0 ||
    rC.length == 0 ||
    rI1.length == 0 ||
    rI2.length == 0 ||
    rI3.length == 0
  ) {
    divErrores.innerHTML = `<h1>Rellene todos los campos</h1>`;
    return false;
  } else {
    divErrores.innerHTML = "";
    return true;
  }
}

function escapear(String) {
  /* Este metodo simplemente escapea el String que le pases*/
  return String
    .replaceAll("~", "/\~")
    .replaceAll("#", "/\#")
    .replaceAll("=", "/\=")
    .replaceAll("}", "/\}")
    .replaceAll("{", "/\{")
    .replaceAll(":", "/\:");
}

function descapear(String) {
  /* Este metodo recibe un string escapeado y lo restaura*/
  return String 
    .replaceAll("/\~", "~")
    .replaceAll("/\#", "#")
    .replaceAll("/\=", "=")
    .replaceAll("/\}", "}")
    .replaceAll("/\{", "{")
    .replaceAll("/\:", ":");
}
