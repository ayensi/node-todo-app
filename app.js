const { render } = require("ejs");
const { response } = require("express");
const express = require("express")
const mysql = require("mysql")
const session = require('express-session');
const { restart } = require("nodemon");
const con = mysql.createConnection({
    host:"localhost",
    port:"3306",
    user:"okan1234",
    password:"okan1234",
    database:"todolist"
})

const app = express()
const PORT = process.env.PORT || 3000;
app.use(session({
    secret: 'aminuumar',
    resave: false,
    saveUninitialized: true
  }));
  app.use("/assets", express.static(__dirname + '/assets'));
app.set("view engine","ejs")

app.use(express.urlencoded({extended:false}))

app.get("/",(req,res)=>{
    res.render("index")
})
app.get("/kayit",(req,res)=>{
    res.render("kayit")
})
app.get("/giris",(req,res)=>{
    if(req.session.username){
        let isim = req.session.username
        console.log(req.session.username)
        return res.redirect(`/gorev`)
    }
    res.render("giris")
})

//GİRİŞ FONKSİYONU
app.post("/giris",(req,res)=>{
        const username = req.body.username
        const password = req.body.password
        con.query(`SELECT * FROM todo_user WHERE username ="${req.body.username}" AND password="${req.body.password}"`,(err,result,fields)=>{
            if(err) throw err
            if(result.length>0){
            s_username = result[0].username
            s_password = result[0].password
        }
        else{
            s_username=""
            s_password=""
        }
        console.log(req.session)
            if(s_username === username && s_password === password){
                req.session.username = s_username
                console.log(req.session)
                return res.redirect("/gorev")
            }
            else{
                console.log(username)
                console.log(password)
                console.log(s_username)
                console.log(s_password)
                res.send("Kullanıcı adı veya şifre yanlış...")
            }
        })

})
app.post("/kayit",(req,res)=>{
    con.query(`SELECT * FROM todo_user WHERE username ="${req.body.username}"`,(err,result,fields)=>{
        if(result.length>0){
            res.send("Böyle bir kullanıcı zaten var")
            
        }
        else{
            con.query(`INSERT INTO todo_user (username,password) VALUES ("${req.body.username}","${req.body.password}")`,(err,result,fields)=>{
                if(err) throw err
        
                console.log(result)
        
                return res.redirect("giris")
        })
        }
    })
    
})
app.post("/gorev",(req,res)=>{
    con.query(`INSERT INTO todo_list (gorev,username) VALUES ("${req.body.gorev}","${req.session.username}")`,(err,result,fields)=>{
        if(err) throw err

        console.log(result)

        return res.redirect("gorev")
})
})
app.post("/cikis",(req,res)=>{
    req.session.destroy()
    return res.redirect("giris")
})
app.get("/gorev",(req,res)=>{
    if(!req.session.username){
        return res.redirect(`/giris`)
    }
    
    con.query(`SELECT * FROM todo_list WHERE username ="${req.session.username}"`,(err,result,fields)=>{
        if(err) throw err

        console.log(result)
        
    res.render("gorev",{data: result})
})
})
app.get("*",(req,res)=>{
    return res.redirect("/")
})
app.listen(PORT,()=> console.log(`Server ${PORT} portunda çalışıyor.`))