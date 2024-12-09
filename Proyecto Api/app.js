
document.addEventListener("DOMContentLoaded", () => {
    const URL = "https://pokeapi.co/api/v2/pokemon/";
    const pokemonList = document.querySelector("#pokemonList");
    const searchInput = document.querySelector("#searchInput");
    const typeFilter = document.querySelector("#typeFilter");

    // Cargar todos los Pokémon inicialmente cuando se abre la pagina 
    for (let i = 1; i <= 151; i++) {
        loadPokemon(i);
    }

    // Función para cargar los Pokémon
    function loadPokemon(idOrName) {
        fetch(`${URL}${idOrName}`)
            .then(response => response.json())
            .then(data => {
                const card = createPokemonCard(data);//Crea una tarjeta para mostrar información básica.
                pokemonList.appendChild(card);

                loadEvolutionChain(data.species.url, card);//Carga y muestra las evoluciones del Pokémon 
            })
            .catch(error => console.error("Error al cargar Pokémon:", error));
    }

    // Función para crear la tarjeta de Pokémon
    function createPokemonCard(data) {
        const div = document.createElement("div");
        div.classList.add("card");

        // Aquí solo mostramos nombre y la imagen inicialmente
        div.innerHTML = `
            <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
            <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
            <button class="btn-show-info">Ver más</button>
            <div class="info">
                <p>ID: ${data.id}</p>
                <p>Tipo: ${data.types.map(type => type.type.name).join(", ")}</p>
                <p>Altura: ${data.height} decímetros</p>
                <p>Peso: ${data.weight} hectogramos</p>
                <ul class="stats-list">
                    <li>Hp: ${data.stats[0].base_stat}</li>
                    <li>Attack: ${data.stats[1].base_stat}</li>
                    <li>Defense: ${data.stats[2].base_stat}</li>
                    <li>Special-attack: ${data.stats[3].base_stat}</li>
                    <li>Special-defense: ${data.stats[4].base_stat}</li>
                    <li>Speed: ${data.stats[5].base_stat}</li>
                </ul>
                 <div class="evolutions">
                    <h4>Evoluciones:</h4>
                    <ul class="evolution-list">
                        <!-- Aquí se agregan las evoluciones -->
                    </ul>
                </div>
            </div>
        `;

        // Evento para mostrar la información completa al hacer clic
        const btnShowInfo = div.querySelector(".btn-show-info");
        btnShowInfo.addEventListener("click", () => {
            const info = div.querySelector(".info");
            info.style.display = info.style.display === "none" || !info.style.display ? "block" : "none";
        });

        return div;
    }

    // Función para obtener la cadena de evolución
    function loadEvolutionChain(speciesUrl, card) {
        fetch(speciesUrl)
            .then(response => response.json())
            .then(data => {
                const evolutionUrl = data.evolution_chain.url;//Se usa el URL de la especie del Pokémon para obtener la URL de su cadena de evolución.
                fetch(evolutionUrl)
                    .then(response => response.json())
                    .then(evolutionData => {
                        const evolutions = evolutionData.chain;
                        displayEvolutions(evolutions, card);//Se solicita la cadena de evolución y se muestra mediante la función displayEvolutions.
                    });
            });
    }

     // Función para mostrar las evoluciones con imágenes
     function displayEvolutions(evolutionData, card) {
        const evolutionList = card.querySelector(".evolution-list");

        let currentEvolution = evolutionData;
        while (currentEvolution) {
            const pokemonName = currentEvolution.species.name;
            
            // Obtener imagen del Pokémon en la cadena de evolución
            fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
                .then(response => response.json())
                .then(pokemonData => {
                    const evolutionItem = document.createElement("li");

                    // Crear el HTML para mostrar la imagen y nombre del Pokémon de la evolución
                    evolutionItem.innerHTML = `
                        <img src="${pokemonData.sprites.other['official-artwork'].front_default}" alt="${pokemonName}" style="width: 50px; height: auto;">
                        <span>${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)}</span>
                    `;
                    evolutionList.appendChild(evolutionItem);
                })
                .catch(error => console.error("Error al obtener imagen de la evolución:", error));

            // Pasar a la siguiente evolución (si existe)
            currentEvolution = currentEvolution.evolves_to ? currentEvolution.evolves_to[0] : null;
        }
    }

    // Evento para filtrar por ID 
    searchInput.addEventListener("input", () => {
        const searchValue = searchInput.value.trim().toLowerCase();
        pokemonList.innerHTML = ""; //Limpia antes de colocar otro numero o nombre 
        if (searchValue) {
            if (isNaN(searchValue)) {
                loadPokemon(searchValue);//Busqueda por Nombre
            } else {
                loadPokemon(parseInt(searchValue));//Si no por numero
            }
        }
    });

    // Evento para filtrar por tipo
    typeFilter.addEventListener("change", () => {
        const type = typeFilter.value;
        pokemonList.innerHTML = ""; // Limpiar la lista antes de cargar
        if (type) {
            // Si hay un tipo seleccionado, cargar los Pokémon de ese tipo
            for (let i = 1; i <= 151; i++) {
                fetch(`${URL}${i}`)
                    .then(response => response.json())
                    .then(data => {
                        const types = data.types.map(type => type.type.name);
                        if (types.includes(type)) {
                            const card = createPokemonCard(data);
                            pokemonList.appendChild(card);
                        }
                    });
            }
        } else {
            // Si no hay tipo seleccionado, cargar todos los Pokémon
            for (let i = 1; i <= 151; i++) {
                loadPokemon(i);
            }
        }
    }); 

})
