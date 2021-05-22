'use strict';

const express = require('express');
const server = express();
const pg = require('pg');
require('dotenv').config();
const cors = require('cors');
const methodOverride = require('method-override');
const superagent = require('superagent');
server.use(cors());
server.set('view engine', 'ejs');
server.use(express.urlencoded({ extended: true }));
server.use(express.static('./public'));
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const PORT = process.env.PORT || 5555;
server.use(methodOverride('_method'));

server.get('/',handleHomePage);
server.post('/addToFavorite',handleAddToFavorite);
server.get('/favorites',handleFavorites);
server.delete('/delete/:id',handleDeleteFavorite);
server.put('/update/:id',handleUpdateFavorite);
server.get('/showdetails/:id',handleShowDetails);
server.get('/random',handleRandom);

function handleHomePage(req,res){
  let url=`https://official-joke-api.appspot.com/jokes/programming/ten`;
  superagent(url).then(result=>{
    let jokesarr=result.body.map(item=>{
      return new Jokes(item);
    });
    res.render('home',{jokes:jokesarr});
  });
}

function handleAddToFavorite(req,res){
  let {number,type,setup,punchline}=req.body;
  let sql=`INSERT INTO jokes (number,type,setup,punchline) VALUES ($1,$2,$3,$4);`;
  let safevalues=[number,type,setup,punchline];
  client.query(sql,safevalues).then(()=>{
    res.redirect('/favorites');
  });
}

function handleFavorites(req,res){
  let sql=`SELECT * FROM jokes;`;
  client.query(sql).then(result=>{
    res.render('favorites',{favorites:result.rows});
  });
}

function handleDeleteFavorite(req,res){
  let id=req.params.id;
  let sql=`DELETE FROM jokes WHERE id=${id};`;
  client.query(sql).then(()=>{
    res.redirect('/favorites');
  });
}

function handleUpdateFavorite(req,res){
  let id=req.params.id;
  let {number,type,setup,punchline}=req.body;
  let sql=`UPDATE jokes SET number=$1,type=$2,setup=$3,punchline=$4 WHERE id=${id};`;
  let safevalues=[number,type,setup,punchline];
  client.query(sql,safevalues).then(()=>{
    res.redirect('/favorites');
  });
}

function handleShowDetails(req,res){
  let id=req.params.id;
  let sql=`SELECT * FROM jokes WHERE id=${id};`;
  client.query(sql).then(result=>{
    res.render('details',{details:result.rows});
  });
}

function handleRandom(req,res){
  let url =`https://official-joke-api.appspot.com/jokes/programming/random`;
  superagent(url).then(result=>{
    let randomarr=result.body.map(item=>{
      return new Jokes(item);
    });
    res.render('random',{random:randomarr});
  });
}

function Jokes (data){
  this.number=data.id;
  this.type=data.type;
  this.setup=data.setup;
  this.punchline=data.punchline;
}
client.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}`);
    });
  });
