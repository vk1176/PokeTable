/* EVERYTHING HERE SHOULD ONLY BE RUN ONCE, IF AND ONLY IF THERE IS NO DATABASE DATA*/
/* Just to clarify if you don't it's no big deal, as it will just fail */

//Requirements
const sqlite3 = require("sqlite3").verbose()
const axios = require("axios")

//String formatter
//Strong formatter
function format(s, name){
	if(s==null){
		return null
	}
	if(s=="ho-oh" || s.indexOf("jangmo")>=0 || s.indexOf("kommo")>=0 || s.indexOf("hakamo")>=0){
		return s[0].toUpperCase()+s.substring(1)
	}
	if(s.indexOf("tapu")>=0 || s.indexOf("mime")>=0 || s.indexOf("rime")>=0){
		name=false
	}
	s = s.split('-').join(' ');	
	const words = s.split(" ")

	for(let i=0; i<words.length; i++){
		words[i] = words[i][0].toUpperCase()+words[i].substring(1)
		if(name){
			if(i==1){
				words[i]=`\n(${words[i]}`
			}
			if(i==words.length-1 && i>0){
				words[i]=`${words[i]})`
			}
		}
	}
	return words.join(" ")
}

//Function to populate Pokemon data
async function populatePokemon(){

	//Scan poorly designed evolution chain
	function dfsearch(node, target, depth){	
		//Success check, includes brench and leaf node success
		if(node.species.url==target){
			return depth
		}

		//Leaf node failure
		if(node.evolves_to.length==0){
			return 0
		}
		
		let d = 0
		for(var j=0; j<node.evolves_to.length; j++){
			d += dfsearch(node.evolves_to[j], target, depth+1)
		}
		return d
		
	}

	//Add every single Pokemon
	let iter = 1
	let i = 1	

	while(i<10195){

		//Skip these for now
		const x = i-10000
		if(x==13 || x==14 || x==15 || x==16 || x==17 || x==18 || x==24 || x==26 || x==61
			 || (x>=80 && x<=85) || (x>=158 && x<=160) 
			 || (x>=93 && x<=99) || (x>=128 && x<=135) || (x>=137 && x<=151)
			 || (x==159) || (x>=181 && x<=183) || x==116 || x==117
			  || x==121 || x==122 || x==153 || x==154 || x==178 || x==185 || x==187 || x==192
			  || x==119 || x==127 || x==157 || x==177){
			i++
			continue
		}

		//Why is this API designed like this. Why
		const response1 = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`)
		const data = await response1.data
		const response2 = await axios.get(data.species.url)
		const species = await response2.data
		const response3 = await axios.get(species.evolution_chain.url)	
		const evo = await response3.data

		//Data that needs extraction
		let type2 = null
		if(data.types.length>1){
			type2 = data.types[1].type.name
		}
		let a1 = data.abilities[0].ability.name
		let a2 = null
		let ha = null
		switch(data.abilities.length){
			case(2):
				 ha = data.abilities[1].ability.name
				 break;
			case(3):
				a2 = data.abilities[1].ability.name
				ha = data.abilities[2].ability.name
		}

		let stats = []
		let sum = 0
		for(var j=0; j<data.stats.length; j++){
			stats.push(data.stats[j].base_stat)
			sum+=data.stats[j].base_stat
		}
		stats.push(sum)

		const gen = species.generation.url.substring(37, species.generation.url.length-1)

		//0: single stage 1: first stage, 2: middle stage, 3: final stage 
		let stage = await dfsearch(evo.chain, data.species.url, 1)
		if(stage==1 && evo.chain.evolves_to.length==0){
			stage=0
		}
		if(stage==2 && evo.chain.evolves_to[0].evolves_to.length==0){
			stage=3
		}	

		//Special cases to account for this API being garbage
		if(i==264 || i==122){
			stage=3
		}
		if(i==83 || i==222 || i==211){
			stage=0
		}			

		let mega=0
		let regional=0
		let pseudo=0
		if(data.name.indexOf("mega")>=0 &&(iter!=154 && iter!=469)){
			mega=1
		}
		if(data.name.indexOf("primal")>=0){
			mega=2
		}
		if(data.name.indexOf("alola")>=0){
			data.name = data.name.replace("alola", "alolan")
			regional=1
		}
		else if(data.name.indexOf("galar")>=0){
			data.name = data.name.replace("galar", "galarian")
			regional=2
		}
		else if(data.name.indexOf("hisui")>=0){
			data.name = data.name.replace("hisui", "hisuian")
			regional=3
		}
		if(species.id==149 || species.id==248 || species.id==373 || species.id==376 || species.id==445 || species.id==635 || species.id==706 || species.id==784 || species.id==887){
			pseudo=1
		}

		//Last minute name edits
		if(data.name.indexOf("power-construct")>=0){
			data.name = data.name.replace("-power-construct", "")
		}


		if(i==778){
			data.name="mimikyu"
		}
		if(i==774){
			data.name="minior-meteor"
		}
		if(x==136){
			data.name="minior-core"
		}
		if(x==155){
			data.name="necrozma-dusk-mane"
		}
		if(x==156){
			data.name="necrozma-dawn-wings"
		}
		if(x==193){
			data.name="calyrex-ice-rider"
		}
		if(x==194){
			data.name="calyrex-shadow-rider"
		}

		await db.run(
			`INSERT INTO pokemon VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[iter, species.id, `https://img.pokemondb.net/sprites/home/normal/${data.name}.png`, 
			`https://img.pokemondb.net/sprites/home/shiny/${data.name}.png`, format(data.name, true),
			format(data.types[0].type.name, false), format(type2, false), format(a1, false), format(a2, false), format(ha, false), stats[0], stats[1], stats[2], stats[3], 
			stats[4], stats[5], stats[6], data.height, data.weight, gen, stage, format(species.color.name),
			!data.is_default, mega, regional, species.is_baby,
			species.is_legendary, species.is_mythical, pseudo]
			)

		iter++
		i++
		if(i==899){
			i=10001
		}
	}
}

//Make move table
async function populateMoves(){
	for (var i=1; i<827; i++){
		const response = await axios.get(`https://pokeapi.co/api/v2/move/${i}`)
		const r = response.data
		await db.run(
			`INSERT INTO moves VALUES(?, ?, ?, ?, ?, ?)`,
			[r.id, format(r.name, false), format(r.type.name, false), format(r.damage_class.name, false), r.power, r.accuracy]
			)
	}
}

//Get Pokemon-Move Relationships
async function makePools(){
	let i = 1
	let iter = 1
	while(i<10195){
		const x = i-10000
		if(x==13 || x==14 || x==15 || x==16 || x==17 || x==18 || x==24 || x==26 || x==61
			 || (x>=80 && x<=85) || (x>=158 && x<=160) 
			 || (x>=93 && x<=99) || (x>=128 && x<=135) || (x>=137 && x<=151)
			 || (x==159) || (x>=181 && x<=183) || x==116 || x==117
			  || x==121 || x==122 || x==153 || x==154 || x==178 || x==185 || x==187 || x==192
			  || x==119 || x==127 || x==157 || x==177){
			i++
			continue
		}

		const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`)
		const moves = response.data.moves
		for(var j=0; j<moves.length; j++){
			const m_id = parseInt(moves[j].move.url.substring(31, moves[j].move.url.length-1))
			await db.run(`INSERT INTO movepools VALUES (?, ?)`, [iter, m_id])
		}
		iter++
		i++
		if(i==899){
			i=10001
		}

	}
}


/////////// Actual Database Inserts Begin Here /////////////////////////////

//Create Database
let db = new sqlite3.Database("./db/Pokedex.db", (err)=>{
	if(err){
		console.log(`Error creating Pokedex Database: ${err}`)
	}
});

//Create tables
db.serialize(()=>{
	db.run(`CREATE TABLE IF NOT EXISTS pokemon(
			id INTEGER PRIMARY KEY,
			species INTEGER,
			sprite TEXT,
			shiny TEXT,
			name TEXT,
			type1 TEXT,
			type2 TEXT,
			ability1 TEXT,
			ability2 TEXT,
			hidden_ability TEXT,
			hp INTEGER,
			atk INTEGER,
			def INTEGER,
			spatk INTEGER,
			spdef INTEGER,
			speed INTEGER,
			bst INTEGER,
			height REAL,
			weight REAL,
			generation INTEGER,
			evolution_stage INTEGER,
			color TEXT,			
			form INTEGER,
			mega INTEGER,
			regional INTEGER,
			baby TEXT,
			legendary TEXT,
			mythical TEXT,
			pseudo TEXT
			)`, err => {
				if(err){console.log(err)}
			})

	db.run(`CREATE TABLE IF NOT EXISTS moves(
			id INTEGER PRIMARY KEY,
			name TEXT,
			type TEXT,
			damage_class TEXT,
			power INTEGER,
			accuracy INTEGER		
			)`, err => {
				if(err){console.log(err)}
			})

	db.run(`CREATE TABLE IF NOT EXISTS movepools(
			pokemon_id INTEGER,
			move_id INTEGER,
			PRIMARY KEY (pokemon_id, move_id),
			FOREIGN KEY (pokemon_id)
				REFERENCES pokemon (id)
				ON DELETE CASCADE
			FOREIGN KEY (move_id)
				REFERENCES moves (id)
				ON DELETE CASCADE
			)`, err => {
				if(err){console.log(err)}
			})	

	populatePokemon().then(populateMoves()).then(makePools())
	.catch(err=>{console.log(`Error populating tables: ${err}`)})
})





