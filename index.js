const express=require("express");
const app=express();
const mongoose=require("mongoose");
const dotEnv=require("dotenv");
dotEnv.config();
const axios=require("axios");

class Pokeapi
{
 constructor()
 {
    this.url="https://pokeapi.co/api/v2/";
 }

async getpokemon(name)
{
    try{
        const res=await axios.get(`${this.url}pokemon/${name}`);
        const pokeData={
            id:res.data.id,
            name: res.data.name,
            sprite:res.data.sprites.front_default,
            types:res.data.types.map(type=>type.type.name)
        };

        return pokeData;
    }
    catch(error){
        console.log(error);
    }
}

}


const bodyparser=require("body-parser");

app.use(bodyparser.json());

app.use(bodyparser.urlencoded({
    extended:true
}));

const pokeApi=new Pokeapi();
app.get("/api/pokemon/:name",async(req,res)=>{

    const name=req.params.name;
    const pokemondata= await pokeApi.getpokemon(name);
    try{
        const locationResponse = await axios.get(
            `${pokeApi.url}pokemon/${name}/encounters`
            );
            pokemondata.locations = locationResponse.data.map(
            encounter => encounter.location_area.name
            );
            const evolutionResponse = await axios.get(
                `${pokeApi.url}pokemon-species/${name}`
                );
                pokemondata.evolution_chain = [];
                let currentEvolution = evolutionResponse.data.evolution_chain.url;
                while (currentEvolution) {
                const evolutionData = await axios.get(currentEvolution);
                const evolutionDetails = {
                name: evolutionData.data.species.name,
                details: evolutionData.data.evolution_details[0]
                };
                pokemondata.evolution_chain.push(evolutionDetails);
                currentEvolution = evolutionData.data.evolves_to[0]
                ? evolutionData.data.evolves_to[0].species.url
                : null;
                }
    }
    catch(error){
        console.log(error);
    }
    res.send(pokemondata);

});




app.listen(process.env.PORT,()=> console.log("Server up and running"));