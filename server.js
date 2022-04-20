const sqlite3 = require("sqlite3").verbose()
const axios = require("axios")
const express = require("express")
const app = express()

//Serve static files
app.use(express.static("public"))

//Route to obtain all Pokemon data
app.get("/pokemon", async function(req, res){
	let db = await new sqlite3.Database("./db/Pokedex.db", sqlite3.OPEN_READONLY)
	let sql = `SELECT * FROM pokemon 
			   WHERE NOT id = 1024
			   ORDER BY id`;
	db.all(sql, [], (err, row)=>{
		return res.json(row)
	})
	db.close()
})

app.get("/moves", async function(req, res){
	let db = await new sqlite3.Database("./db/Pokedex.db", sqlite3.OPEN_READONLY)
	let sql = `SELECT name, id FROM moves 
			   ORDER BY id`;
	db.all(sql, [], (err, row)=>{
		return res.json(row)
	})
	db.close()
})

//Route to return a movepool
app.get("/movepools", async function(req, res){
	let db = await new sqlite3.Database("./db/Pokedex.db", sqlite3.OPEN_READONLY)
	let sql = `SELECT moves.id, moves.name, movepools.pokemon_id FROM moves 
			   INNER JOIN movepools 
			   ON moves.id = movepools.move_id
			   ORDER BY movepools.pokemon_id`;
	db.all(sql, [], (err, rows)=>{
		return res.json(rows)
	})
	db.close()
})

app.listen(5000, ()=>{console.log("Server working.")})

