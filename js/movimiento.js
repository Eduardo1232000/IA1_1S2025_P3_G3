let camino_nodo_anterior = []

function caminarHacia(xFinal, zFinal, velocidad = 2) {
    //console.log(xFinal, zFinal)
    const xmapa = xFinal
    const zmapa = zFinal
    xFinal = xFinal - valor_centradox
    zFinal = zFinal - valor_centradoz
    //console.log("FIN\n")
    const xInicio = personajeContenedor.position.x;
    const zInicio = personajeContenedor.position.z;
    //console.log("POS INICIAL: ", xInicio, "POS FINAL: ", zInicio)
    const distancia = Math.hypot(xFinal - xInicio, zFinal - zInicio);
    const tiempoTotal = distancia / velocidad;

    personajeContenedor.rotation.y = Math.atan2(xFinal - xInicio, zFinal - zInicio);      //NO FUNCIONA, TENGO QUE CORREGIR LA ROTACION
    moverse?.reset().play();

    moviendo = true;
    movimientoData = {
        tiempo: 0,
        tiempoTotal,
        xInicio,
        zInicio,
        xFinal,
        zFinal
    };


    // CAMBIAR TEXTURA DEL BLOQUE CAMINADO
    //console.log("ANTES", xFinal, zFinal)
    cambiar_marcado(xFinal, zFinal)
    return encontrar_sucesores(xmapa, zmapa)
}

function encontrar_sucesores(posx, posz) {
    //console.log("SUCESORES DE: ",posx, posz, "ALTO: ",info_laberinto.ancho, "ANCHO:", info_laberinto.alto)
    let sucesores = []
    if (celda_valida(posx - 1, posz)) {
        sucesores.push([posx - 1, posz])
    }
    if (celda_valida(posx + 1, posz)) {
        sucesores.push([posx + 1, posz])
    }
    if (celda_valida(posx, posz - 1)) {
        sucesores.push([posx, posz - 1])
    }
    if (celda_valida(posx, posz + 1)) {
        sucesores.push([posx, posz + 1])
    }
    //console.log(sucesores)
    return sucesores
}

function celda_valida(valx, valz) {
    const estaDentro = valx >= 0 && valx < info_laberinto.ancho && valz >= 0 && valz < info_laberinto.alto;
    const esPared = info_laberinto.paredes.some(p => p[0] === valx && p[1] === valz);
    return estaDentro && !esPared;
}

function mover_personaje_inicio(personaje, inicio, fin) {
    personaje.position.x = (inicio - valor_centradox)
    personaje.position.z = (fin - valor_centradoz)
}

function caminar() {
    moverse.play();
}

function detenerse() {
    moverse.stop();
}

async function mover_desde_inicio_hasta_nodo(camino) {
    for (let i = 1; i < camino.length; i++) {
        let nodo = camino[i];                           //NODO QUE LE TOCA
        caminarHacia(nodo[0], nodo[1]);                 // CAMINA HACIA EL NODO QUE LE TOCA
        await new Promise(resolve => setTimeout(resolve, 500)); // ESPERAR 1 SEGUNDO
    }
}

async function mover_desde_comun_hasta_nodo(camino) {
    if (camino_nodo_anterior.length === 0) { //SI ESTA VACIA, ES PRIMER MOVIMIENTO
        camino_nodo_anterior = camino                           // GUARDA LA LISTA PARA COMPARAR CON LA SIGUIENTE (SIEMPRE SERA POS INICIAL)
    } else {
        let nodo_comun = encontrarUltimoNodoComun(camino_nodo_anterior, camino) 
        if(nodo_comun == null){     //SI ES NULL, ES PORQUE TODA LA LISTA ANTERIOR ESTA EN LA ACTUAL (SE MUEVE SOLO 1)
            caminarHacia(camino[camino.length-1][0], camino[camino.length-1][1]);           //MOVERSE AL ULTIMO       
            await new Promise(resolve => setTimeout(resolve, 500));
        }else{
            //ES UN CAMINO DIFERENTE, HAY QUE MOVERSE AL NODO EN COMUN
            for (let i = camino_nodo_anterior.length-1; i >= nodo_comun; i--) {
                let nodo = camino_nodo_anterior[i];                           //NODO QUE LE TOCA
                console.log("REGRESANDO ", nodo)
                caminarHacia(nodo[0], nodo[1]);                 // CAMINA HACIA EL NODO QUE LE TOCA
                await new Promise(resolve => setTimeout(resolve, 500)); // ESPERAR 1 SEGUNDO
            }

            //DESDE EL NODO EN COMUN, MOVERSE AL NUEVO
            for (let i = nodo_comun; i < camino.length; i++) {
                let nodo = camino[i];                           //NODO QUE LE TOCA
                console.log("CAMINANDO ", nodo)
                caminarHacia(nodo[0], nodo[1]);                 // CAMINA HACIA EL NODO QUE LE TOCA
                await new Promise(resolve => setTimeout(resolve, 500)); // ESPERAR 1 SEGUNDO
            }
        }
        camino_nodo_anterior = camino
    }
}

function encontrarUltimoNodoComun(anterior, actual) {
    let comun = null;
    //ENCONTRAR EL ULTIMO EN COMUN
    for (let i = 0; i < anterior.length; i++) {
        let a = anterior[i];
        let b = actual[i];

        if (a[0] === b[0] && a[1] === b[1]) {
            //comun = a;    //NODO
            comun = i       //POSICION
        } 
        
        else {
            break;
        }
    }
    // SI ANTERIOR ESTA EN ACTUAL, NO HACER NADA (NO DEBE REGRESAR)
    if (anterior.every((nodo, i) =>
            nodo[0] === actual[i][0] && nodo[1] === actual[i][1])
    ) {
        return null;
    }

    return comun;
}


