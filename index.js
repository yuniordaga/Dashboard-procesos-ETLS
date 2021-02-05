//***********************Script que utiliza el formato , permite la carga y manipulacion de datos 
//para su visualizacion en el TimeLine-Chart**************************************

const urlapi='http://localhost:3000/api/datagrafico'  //almacenamos la url de la api que tienen los datos en json

fetch(urlapi)                                         //usamos fetch para leer los datos en json 
.then(response=>response.json())
.then(
  data=>{                                             //Los datos se alamacenan en la variable data
   console.log(data);                                 //se verifica en consola la recepcion de los datos


//-----------------------------inicio de la funcion para obtener la estructura de la data en el grafico TimeLine-Chart--- https://github.com/vasturiano/timelines-chart  
function getData_to_chart() {                 

const Regiones=['CUS','APU','AYA','HCA'];              //se define las Regiones en un arreglo
long_array_Regiones=Regiones.length;                   //se obtiene la longitud del array Regiones 

//Se define un frame que va a contener el origen y destino de los datos de los procesos ETLs
const longdatos=data.length;            //se obtiene la longitud de la data
var frame= new Array(20);              //se crea el array llamado frame
var f=0                               //se inicializa un indice en cero
var longframe=0                     //se inicializa la longitud del frame en cero   
  for(k=0;k<longdatos;k++){      
        if(frame.includes("From: "+data[k].datosingreso +" <br>"+ "To: "+ data[k].tabdestino + "<br>")) //si ya esta incluido en el array frame no hacer nada
        {}       
        else{
          frame[f]="From: "+data[k].datosingreso +" <br>"+ "To: "+ data[k].tabdestino + "<br>"; //almacenalo si no esta aún dentro del array frame
          f++;
          longframe++;
        }   
  }

//Se almacena la estrucutura o formato definido por el TimeLine-Chart --- https://github.com/vasturiano/timelines-chart
formato_data_timelinechart=regiones();   //invocamos a la funcion regiones() 

//esta funcion va estar almacenando los datos por regiones
function regiones(){
 
  return [...Array(long_array_Regiones).keys()].map(r => ({ 
              group:Regiones[r],      
              data:procesos_Etls(r)  //se invoca al proceso ETL y le enviamos el indice de la Region actual --> r
              }));            
}
//esta función va estar almacenando los datos por procesos ETLs
function procesos_Etls(r){  
  var ETLs_by_Region= new Array(5);        //se crea un array para los ETLs por Region
  var etl_reg=0;                           //se declara el indice del array y se inicializa en cero
  var contador_etl_reg=0                  //se declara una variable contador en cero 
  for(m=0;m<longdatos;m++){      
             if(data[m].Region===Regiones[r])
                { 
                    if(ETLs_by_Region.includes(data[m].ETLprg)) //si algun proceso por region de la data ya esta incliudo en el array no hacer nada
                          {     
                          }
                     else {
                      ETLs_by_Region[etl_reg]=data[m].ETLprg; //si algun proceso por region de la data aún no esta incluido entonces incluirlo en el array ETLs_by_Region
                      etl_reg++;
                      contador_etl_reg++;
                          }

                }
      }     
      //usando lo obtenido en el paso anterior se recorrerá un array de longitud del array ETLs_by_Region -->contador_etl_reg
            return [...Array(contador_etl_reg).keys()].map(z => ({ 
                        label:ETLs_by_Region[z],                          
                        data:segmento(z,ETLs_by_Region[z],r)    //invocamos la funcion segmento y le enviamos el indice del array z , el proceso de indice z , y el indice de la region actual.
                        }));          
  }
//esta función va estar almacenando los datos por segemento ---- segemento hace referencia a una porcion de informacion según lo solicitado por cada evento contenido en la data 
  function segmento(z,etl_by_region,r){ //generando los segmentos                   
                return [...Array(longdatos).keys()].map(i => {                              
                      if(data[i].ETLprg===etl_by_region && data[i].Region===Regiones[r]){       //Se hace validacion por proceso ETL y Region              
                                  k=i;  
                                  var start = new Date(data[k].tinicio*1000);                   //se define y almacena el tiempo de inicio por evento
                                  var end = new Date(data[k].tfin*1000);                        //se define y almacena el tiempo de fin  por evento
                                  carga=data[k].QtyRows;                                        //se obtiene informacion especifica de carga de data por evento   
                                  w=z;                                                          //indice del proceso ETL
                                  vid=k+1;                                                      //indice del ID por envento en la data
                                  indiceframe=frame.indexOf("From: "+data[k].datosingreso +" <br>"+ "To: "+ data[k].tabdestino + "<br>");    //se obtiene el indice del array frame definido en lineas arriba       
                      }
                  
                  return {
                          timeRange:[start, end],           //se usa para el incio y fin del segmento en la grafica
                          val: frame[indiceframe],          //se usa para definir el tipo de frame en la gráfica 
                          labelVal:frame[indiceframe]+"Carga: "+carga+"<br>"+data[k].ETLprg+"<br>"+"indice de la data: "+k+"<br>"+" indice del ProcesoETL:"+w+"<br>"+"ID en la data: "+vid      //permite la visualizacion de la informacion solicitada por evento en la gráfica                 
                        };
                        
                   });
                
               }

return formato_data_timelinechart;  

}
//-----------------------------Fin de la funcion para obtener la estructura que va a tener la data en el grafico  TimeLine-Chart


//-----------------------------Incio del invocando para la muestra de la data en el TimeLine-Chart y uso de las APIs --- https://github.com/vasturiano/timelines-chart

var startDate=new Date();                               //vaariable incio de fecha
var endDate=new Date();                                 //variable fin de fecha
startDate =startDate.setDate(startDate.getDate() -7);   //Obtiene la fecha de incio hace 7 dias en segundos
startDate=new Date(startDate); //se lo convierte en fecha 

const myData = getData_to_chart();                      //se invoca a la funcion y lo retornado se alamacena en la variable myData
const myChart = TimelinesChart()(document.body);        //se instancia el TimeLine-Chart  ------ https://github.com/vasturiano/timelines-chart

//uso de las APIs del TimeLineChart
 myChart.zScaleLabel('My Scale Units')
      .zQualitative(true).data(myData);

//-----------------------------Fin del invocando para la muestra de la data en el TimeLine-Chart y uso de las APIs --- https://github.com/vasturiano/timelines-chart


//-----------------------------Inicio de manipulacion de las fechas usando formulario de fechas

//Funcion que le da un formato especifico para las fechas de incio
function completarHoraInicio(f){
        var fecha = f; //Fecha actual
        var mes = fecha.getMonth()+1; //obteniendo mes
        var dia = fecha.getDate(); //obteniendo dia
        var ano = fecha.getFullYear(); //obteniendo año
        var hora = fecha.getHours(); //obteniendo hora
        var minutos = fecha.getMinutes(); //obteniendo minuto

        var nuevo_formato_fecha_inicio=ano+"-"+minTwoDigits(mes)+"-"+minTwoDigits(dia)+"T"+minTwoDigits(hora)+":"+minTwoDigits(minutos);
        return nuevo_formato_fecha_inicio;
      }    
//funcion que valida cantidad de digitos usados ,se debe obtner 2 digitos.
function minTwoDigits(n) {
        return (n < 10 ? '0' : '') + n;
}

//-----------------------------Inicio de Creacion de formulario Fechas 
const juntarfechas=document.createElement("form");
juntarfechas.id="juntarfechas";         
juntarfechas.className ="fechajunta";
document.body.appendChild(juntarfechas);

//inicio de fecha inicio
const label=document.createElement("label");
label.textContent="Start date : "
document.body.insertAdjacentHTML("beforeend","<br>");
juntarfechas.appendChild(label);
const input=document.createElement("input");
input.type="datetime-local";
input.id="start";
input.value=completarHoraInicio(startDate);
input.className="iniciofecha";
juntarfechas.appendChild(input);
//fin de fecha inicio

//inicio de fecha fin
const label2=document.createElement("label");
label2.textContent=" End date : "
juntarfechas.appendChild(label2);
const input2=document.createElement("input");
input2.type="datetime-local";
input2.id="end";
input2.value=completarHoraInicio(endDate);
input2.className="finfecha";
juntarfechas.appendChild(input2);
//fin de fecha fin 

//------------Inicio Onclick para la ejecucion de la fechas ingresadas con anterioridad 
const button=document.createElement("button");
button.type="button";
button.innerText = 'Click here!'; 
button.className="botonfecha";
juntarfechas.insertAdjacentHTML("beforeend","<br>");
juntarfechas.appendChild(button);
button.onclick = function() {
//Obtencion de valor inicio
var valori = document.getElementById("start").value;
//Obtencion de valor final
var valorf = document.getElementById("end").value;

//Conversion de string a fecha
//fecha inicial
ms = Date.parse(valori);
fechainicial = new Date(ms);
//fecha final
msf = Date.parse(valorf);
fechafinal = new Date(msf);
//uso de las APIs de TimeLine-Chart para lo nuevos valores

      myChart.zoomX([fechainicial, fechafinal]);  // muestra el rango usando lo selecionado para los segmentos (grafico)
      myChart.overviewDomain([fechainicial, fechafinal]); // muestra el rango usando lo selecionado para el overview(debajo del grafico)

}
//------------Fin Onclick para la ejecucion de la fechas ingresadas con anterioridad 

//------------inicio de x dias ,para la visualizacion del grafico hace x dias
juntarfechas.insertAdjacentHTML("beforeend","<br>");
const label3=document.createElement("label");
label3.textContent="Or days ago:"

juntarfechas.appendChild(label3);
const input3=document.createElement("input");
input3.type="number";
input3.id="xdias";
input3.name="tentacles";
input3.value="1";
input3.min="1";
input3.max="360";
input3.className="fechaxdias";
juntarfechas.appendChild(input3);
//------------fin de x dias ,para la visualizacion del grafico hace x dias


//--------------------------------------Inicio el Onclick para los nuevas fechas
const done=document.createElement("button");
done.type="button";
done.innerText = 'done!'; 
done.className="botondia";
juntarfechas.insertAdjacentHTML("beforeend","<br>");
juntarfechas.appendChild(done);
done.onclick = function() {
//Obtener valor de la fecha hace x dias
var vxdias = document.getElementById("xdias").value;

//---------------------Inicio de conversion de string a fecha

//Fecha inicial -- conversion de string a numero
var numeroxdias=parseInt(vxdias, 10);
//proceso para la obtencion de la fecha incio y fecha fin
var inicio=new Date();  
var fin=new Date();
inicio =inicio.setDate(inicio.getDate() -numeroxdias); //se obtiene 7 dias atrás en segundos
inicio=new Date(inicio); //fecha de inicio convertido a fecha

//---------------------fin de conversion de string a fecha

// -------------------inicio del uso de las APIs de TimeLine-Chart para lo nuevos valores hace x dias

      myChart.zoomX([inicio, fin]);           // muestra el rango usando lo selecionado para los segmentos (grafico)
      myChart.overviewDomain([inicio, fin]);  // muestra el rango usando lo selecionado para el overview(debajo del grafico)

// -------------------fin del uso de las APIs de TimeLine-Chart para lo nuevos valores hace x dias

}
//--------------------------------------fin de Uso del Onclick para los nuevas fechas

//-----------------------------Fin de manipulacion de las fechas usando formulario de fechas

//------------Asignacion de ID al SVG[0]
elsvgn=document.getElementsByTagName('svg')[0];
elsvgn.id="svgPrincipal";


})
.catch(err=>console.log(err));

