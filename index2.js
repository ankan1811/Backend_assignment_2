const express = require("express");
const app = express();
const axios = require("axios");
const bodyParser = require("body-parser");
const dotenv=require("dotenv");
dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

class Pokeapi {
    constructor() {
        this.url = "https://pokeapi.co/api/v2/";
    }

    async getpokemon(name) {
        try {
            const res = await axios.get(`${this.url}pokemon/${name}`);
            const pokeData = {
                id: res.data.id,
                name: res.data.name,
                sprite: res.data.sprites.front_default,
                types: res.data.types.map(type => type.type.name),
                evolutionChainURL: res.data.species.url
            };

            return pokeData;
        } catch (error) {
            console.log(error);
            throw error; // Add this line to propagate the error to the caller
        }
    }

    async getlocations(name) {
        try {
            const locationResponse = await axios.get(`${this.url}pokemon/${name}/encounters`);
            return locationResponse.data.map(encounter => encounter.location_area.name);
        } catch (error) {
            console.log(error);
            throw error; // Add this line to propagate the error to the caller
        }
    }
    async getEvolutionChain(id) {
        try {
            const evolutionChainResponse = await axios.get(`${this.url}/evolution-chain/${id}`);
           // console.log(evolutionChainResponse.data);
           const evolutions = [evolutionChainResponse.data.chain.species.name];
           let currentEvolution = evolutionChainResponse.data.chain.evolves_to[0];

           while (currentEvolution) {
               evolutions.push(currentEvolution.species.name);
               currentEvolution = currentEvolution.evolves_to[0];
           }

           return evolutions;
           // return evolutionChainResponse.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

const pokeApi = new Pokeapi();

app.get("/api/pokemon/:name", async (req, res) => {
    const name = req.params.name;
    try {
        const pokemondata = await pokeApi.getpokemon(name);
        pokemondata.locations = await pokeApi.getlocations(name);
        const evolutions = await pokeApi.getEvolutionChain(pokemondata.id);
        pokemondata.evolutions = evolutions;
        res.send(pokemondata);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
