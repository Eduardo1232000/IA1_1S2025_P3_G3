/**************  A*  (A‑Star)  **************/

/* ── Heurística Manhattan ────────────────── */
function heuristica([x1, y1], [x2, y2]) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

/* ── Nodo para A* ─────────────────────────── */
class NodoAStar {
    constructor(vertice, g, h, anterior = null) {
        this.vertice  = vertice          // [fila, col]
        this.g        = g                // coste real desde el inicio
        this.h        = h                // heurística al destino
        this.f        = g + h             // f = g + h
        this.anterior = anterior          // puntero al nodo anterior
        this.siguiente = null             // para lista enlazada
    }
}

/* ── Clase principal A* (como Dijkstra) ───── */
class AStarEstructura {
    constructor() {
        this.raiz = null
        this.ultimo = null
    }

    insertar(vertice, g, h, anterior) {
        const nuevo = new NodoAStar(vertice, g, h, anterior)
        if (this.ultimo === null) {
            this.raiz = nuevo
            this.ultimo = nuevo
        } else {
            this.ultimo.siguiente = nuevo
            this.ultimo = nuevo
        }
    }

    modificar(vertice, g, h, anterior) {
        let actual = this.raiz
        while (actual !== null) {
            if (JSON.stringify(actual.vertice) === JSON.stringify(vertice)) {
                actual.g = g
                actual.h = h
                actual.f = g + h
                actual.anterior = anterior
                return
            }
            actual = actual.siguiente
        }
        console.error("ERROR AL MODIFICAR. No existe el vértice:", vertice)
    }

    valorVertice(vertice) {
        let actual = this.raiz
        while (actual !== null) {
            if (JSON.stringify(actual.vertice) === JSON.stringify(vertice)) {
                return actual.g
            }
            actual = actual.siguiente
        }
        return "ERROR"
    }

    crear_lista_nodos_recorrer(vertice) {
        let camino = []
        if (vertice !== "INICIO") {
            let actual = this.raiz
            while (actual !== null) {
                if (JSON.stringify(actual.vertice) === JSON.stringify(vertice)) {
                    camino.push(actual.vertice)
                    if (actual.anterior) {
                        camino = camino.concat(this.crear_lista_nodos_recorrer(actual.anterior))
                    }
                    break
                }
                actual = actual.siguiente
            }
        }
        return camino
    }
}

/* ── Cola de prioridad min‑heap por f(n) ──── */
class MinHeap {
    constructor() { this.data = [] }

    size() { return this.data.length }

    push(node) {
        this.data.push(node)
        this.#burbujaArriba(this.data.length - 1)
    }

    pop() {
        if (this.data.length === 0) return null
        const min = this.data[0]
        const fin = this.data.pop()
        if (this.data.length > 0) {
            this.data[0] = fin
            this.#burbujaAbajo(0)
        }
        return min
    }

    #burbujaArriba(i) {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2)
            if (this.data[i].f >= this.data[p].f) break
            [this.data[i], this.data[p]] = [this.data[p], this.data[i]]
            i = p
        }
    }
    #burbujaAbajo(i) {
        const n = this.data.length
        while (true) {
            let izq = 2 * i + 1,
                der = 2 * i + 2,
                min = i
            if (izq < n && this.data[izq].f < this.data[min].f) min = izq
            if (der < n && this.data[der].f < this.data[min].f) min = der
            if (min === i) break
            [this.data[i], this.data[min]] = [this.data[min], this.data[i]]
            i = min
        }
    }
}

/* ── Funciones de ayuda ───────────────────── */
function posToStr([x, y]) { return `${x},${y}` }




/* ── ALGORTIMO PRINCIPAL A* COMPLETO ───────── */
async function resolverCaminoAStar(inicio, fin) {
    console.log("INICIO A*")

    const abierto = new MinHeap();
    const cerrado = new Set();
    const estructura = new AStarEstructura();
    const nodos = {};

    const h0 = heuristica(inicio, fin);
    const nodoIni = new NodoAStar(inicio, 0, h0, "INICIO")

    abierto.push(nodoIni);
    nodos[posToStr(inicio)] = nodoIni;
    estructura.insertar(inicio, 0, h0, "INICIO");

    while (abierto.size() > 0) {
        const actual = abierto.pop();
        const clave = posToStr(actual.vertice)

        if (clave === posToStr(fin)) {
            const caminoFinal = estructura.crear_lista_nodos_recorrer(fin).reverse();
            await recorrer_laberinto(caminoFinal);
            abrir_emergente();
            mover_personaje_inicio(personajeContenedor, info_laberinto.inicio[0], info_laberinto.inicio[1]);
            eliminar_bloques_recorridos();
            document.getElementById("navbar_seleccion").style.display = "block";
            saltar_animacion = false;
            return caminoFinal;
        }

        cerrado.add(clave);

        const sucesores = encontrar_sucesores(actual.vertice[0], actual.vertice[1]);
        for (const vecino of sucesores) {
            const claveVec = posToStr(vecino);
            if (cerrado.has(claveVec)) continue;

            const gTentativo = actual.g + 1;

            if (!(claveVec in nodos) || gTentativo < nodos[claveVec].g) {
                const h = heuristica(vecino, fin);
                const nuevoNodo = new NodoAStar(vecino, gTentativo, h, actual.vertice);
                nodos[claveVec] = nuevoNodo;
                abierto.push(nuevoNodo);

                if (estructura.valorVertice(vecino) === "ERROR") {
                    estructura.insertar(vecino, gTentativo, h, actual.vertice);
                } else {
                    estructura.modificar(vecino, gTentativo, h, actual.vertice);
                }
            }
        }

        if (!saltar_animacion) {
            const camino_temp = estructura.crear_lista_nodos_recorrer(actual.vertice).reverse();
            await mover_desde_comun_hasta_nodo(camino_temp);
        }
    }

    // 🚨 Si terminó o interrumpiste, usar posición actual
    console.warn("No se encontró ruta completa o se saltó a final.");

    // 🛑 Obtener coordenadas reales del personaje
    const filaActual = Math.round(personajeContenedor.position.x);
    const columnaActual = Math.round(personajeContenedor.position.z);

    const posicionActual = [filaActual, columnaActual];
    console.log("Posición actual en celda:", posicionActual);

    // 🚀 Buscar el nodo explorado más cercano
    let nodoComun = buscarNodoMasCercano(posicionActual, estructura);

    if (!nodoComun) {
        console.error("No se encontró nodo común cercano válido.");
        return [];
    }

    console.log("Nodo común encontrado:", nodoComun);

    // 🚀 Reconstruir camino desde el nodo encontrado hasta el fin
    const caminoHastaFin = estructura.crear_lista_nodos_recorrer(fin).reverse();
    const indiceComun = caminoHastaFin.findIndex(pos => JSON.stringify(pos) === JSON.stringify(nodoComun));

    if (indiceComun !== -1) {
        const caminoRestante = caminoHastaFin.slice(indiceComun);

        await recorrer_laberinto(caminoRestante);
        abrir_emergente();
        mover_personaje_inicio(personajeContenedor, info_laberinto.inicio[0], info_laberinto.inicio[1]);
        eliminar_bloques_recorridos();
        document.getElementById("navbar_seleccion").style.display = "block";
        saltar_animacion = false;
        return caminoRestante;
    } else {
        console.error("No se encontró camino válido desde el nodo actual.");
        return [];
    }
}
