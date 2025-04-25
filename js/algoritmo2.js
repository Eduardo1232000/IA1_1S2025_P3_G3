// Clase Nodo para representar un vértice visitado con su anterior
class NodoBFS {
    constructor(vertice, anterior) {
        this.siguiente = null;
        this.anterior = anterior;
        this.vertice = vertice;
    }
}

// Clase principal BFS
class BFS {
    constructor() {
        this.raiz = null;
        this.ultimo = null;
    }

    insertar(vertice, anterior) {
        const nuevo = new NodoBFS(vertice, anterior);
        if (this.ultimo === null) {
            this.raiz = nuevo;
            this.ultimo = nuevo;
        } else {
            this.ultimo.siguiente = nuevo;
            this.ultimo = nuevo;
        }
    }

    // Retorna el camino en forma de texto
    encontrarOrigen(vertice) {
        if (vertice !== "INICIO") {
            let actual = this.raiz;
            while (actual !== null) {
                if (JSON.stringify(actual.vertice) === JSON.stringify(vertice)) {
                    return this.encontrarOrigen(actual.anterior) + " -> " + vertice;
                }
                actual = actual.siguiente;
            }
            return "ERROR";
        } else {
            return "";
        }
    }

    // Lista de nodos del camino final
    crear_lista_nodos_recorrer(vertice) {
        let camino = [];
        if (vertice !== "INICIO") {
            let actual = this.raiz;
            while (actual !== null) {
                if (JSON.stringify(actual.vertice) === JSON.stringify(vertice)) {
                    camino.push(actual.vertice);
                    if (actual.anterior) {
                        camino = camino.concat(this.crear_lista_nodos_recorrer(actual.anterior));
                    }
                    break;
                }
                actual = actual.siguiente;
            }
        }
        return camino;
    }
}

// Utilidad: convierte [x,y] a string "x,y"
function posToStr(pos) {
    return `${pos[0]},${pos[1]}`;
}

// BFS con debug
async function resolverCaminoBFS(inicio, fin) {
    const cola = [inicio];
    const anteriores = {};
    const visitados = new Set();

    anteriores[posToStr(inicio)] = "INICIO";
    visitados.add(posToStr(inicio));

    const estructura = new BFS();
    estructura.insertar(inicio, "INICIO");

    let camino_temp = [];
    let encontrado = false;

    while (cola.length > 0 && !encontrado) {
        const actual = cola.shift();
        const claveActual = posToStr(actual);

        if (claveActual === posToStr(fin)) {
            encontrado = true;
            break;
        }

        const sucesores = encontrar_sucesores(actual[0], actual[1]);

        for (let vecino of sucesores) {
            const claveVecino = posToStr(vecino);
            if (!visitados.has(claveVecino)) {
                anteriores[claveVecino] = actual;
                visitados.add(claveVecino);
                cola.push(vecino);
                estructura.insertar(vecino, actual);

                if (saltar_animacion === false) {
                    camino_temp = estructura.crear_lista_nodos_recorrer(vecino);
                    await mover_desde_comun_hasta_nodo(camino_temp.reverse());

                    // Detener animación si se llega al nodo final
                    if (claveVecino === posToStr(fin)) {
                        encontrado = true;
                        break;
                    }
                }
            }
        }
    }

    // Obtener y animar el camino final
    let camino = estructura.crear_lista_nodos_recorrer(fin);
    await mover_desde_comun_hasta_nodo(camino.reverse());

    abrir_emergente();
    mover_personaje_inicio(personajeContenedor, info_laberinto.inicio[0], info_laberinto.inicio[1]);
    eliminar_bloques_recorridos();
    document.getElementById("navbar_seleccion").style.display = "block";
    saltar_animacion = false;

    return camino.reverse();
}