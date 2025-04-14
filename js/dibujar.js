
let bloques_laberinto = [];
let valor_centradox = 0
let valor_centradoz = 0
function armar_laberinto(scene, cantidad_x, cantidad_z, paredes) {
    //console.log(cantidad_x, cantidad_z, paredes)
    
    const textura = new THREE.TextureLoader().load('./img/cuarzo.png'); //IMAGEN MATERIAL
    const material = new THREE.MeshBasicMaterial({ map: textura });
    const textura2 = new THREE.TextureLoader().load('./img/ladrillonegro.jpg'); //IMAGEN MATERIAL
    const material2 = new THREE.MeshBasicMaterial({ map: textura2 });

    const ancho = 1;        // DEL BLOQUE
    const alto = 1;         // DEL BLOQUE
    const Profundidad = 1;  // DEL BLOQUE
    const separacion = 0;   // DEL BLOQUE

    valor_centradox = (cantidad_x * (ancho + separacion)) / 2;     // DISTANCIA PARA QUE QUEDE TODO CENTRADO EN X
    valor_centradoz = (cantidad_z * (Profundidad + separacion)) / 2;      // DISTANCIA PARA QUE QUEDE TODO CENTRADO EN Z
    
    //console.log(valor_centradox, valor_centradoz)
    paredes.forEach(coordenada => {
        const geometry = new THREE.BoxGeometry(ancho, alto, Profundidad);       // GEOMETRIA CAJA
        const block = new THREE.Mesh(geometry, material);                       // TEXTURA
        block.position.set((coordenada[0]) * (ancho + separacion) - valor_centradox, 0.5, (coordenada[1]) * (alto + separacion) - valor_centradoz);                // POSICION
        scene.add(block);                                                       // AGREGAR A ESCENA
        bloques_laberinto.push(block);                                          // GUARDAR LOS BLOQUES EN LA LISTA (PARA BORRARLOS DESPUES)
    mostrarEjes(scene, cantidad_x, cantidad_z, valor_centradox, valor_centradoz);
    });

    //ARMAR PARED EXTERIOR
    function crearBloque(x, z) {
        const geometry = new THREE.BoxGeometry(ancho, alto, Profundidad);
        const block = new THREE.Mesh(geometry, material2);
        block.position.set(
            x * (ancho + separacion) - valor_centradox,
            0.5,
            z * (alto + separacion) - valor_centradoz
        );
        scene.add(block);
        bloques_laberinto.push(block);
    }

    for (let x = -1; x <= cantidad_x; x++) {
        crearBloque(x, -1);               // Borde superior
        crearBloque(x, cantidad_z);       // Borde inferior
    }

    for (let z = 0; z < cantidad_z; z++) {
        crearBloque(-1, z);               // Borde izquierdo
        crearBloque(cantidad_x, z);       // Borde derecho
    }

}

function crearTextoSprite(texto) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.font = '35px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    sprite.scale.set(0.8, 0.4, 1); // Ajustá el tamaño si querés
    bloques_laberinto.push(sprite);  
    return sprite;
}


function mostrarEjes(scene, cantidad_x, cantidad_z, centradox, centradoz) {
    for (let x = 0; x < cantidad_x; x++) {
        const textoX = crearTextoSprite(`${x}`);
        textoX.position.set(
            x - centradox,
            1.1,
            -centradoz -1
        );
        scene.add(textoX);
    }

    for (let z = 0; z < cantidad_z; z++) {
        const textoZ = crearTextoSprite(`${z}`);
        textoZ.position.set(
            -centradox -1,
            1.1,
            z - centradoz 
        );
        scene.add(textoZ);
    }
}

function limpiar_laberinto(scene) {
    bloques_laberinto.forEach(bloque => {
        scene.remove(bloque);                   // QUITAR DE LA ESCENA
        bloque.geometry.dispose();              // QUITAR LA GEOMETRIA
        if (bloque.material.map) bloque.material.map.dispose();
        bloque.material.dispose();              // QUITAR MATERIAL
    });
    bloques_laberinto = [];
}