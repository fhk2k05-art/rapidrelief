const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "rapidrelief_secret",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(__dirname));

/* =========================
   FILE SETUP
========================= */

function ensureFile(file){
  if(!fs.existsSync(file)){
    fs.writeFileSync(file, "[]");
  }
}

["users.json","sos.json","track.json","category.json"].forEach(ensureFile);

function load(file){
  return JSON.parse(fs.readFileSync(file));
}

function save(file,data){
  fs.writeFileSync(file, JSON.stringify(data,null,2));
}

/* =========================
   ROUTES
========================= */

app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname,"login.html"));
});

app.get("/dashboard",(req,res)=>{
  if(!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname,"rr.html"));
});

app.get("/admin",(req,res)=>{
  if(req.session.user==="admin"){
    res.sendFile(path.join(__dirname,"admin.html"));
  } else {
    res.send("❌ Access Denied");
  }
});

/* =========================
   AUTH
========================= */

/* REGISTER */
app.post("/register",(req,res)=>{

  let users = load("users.json");

  const { username, password } = req.body;

  if(!username || !password){
    return res.json({status:"error", message:"Missing fields"});
  }

  const exists = users.find(u => u.username === username);
  if(exists) return res.json({status:"exists"});

  const user = {
    username,
    password,
    face: null,
    time:new Date().toLocaleString()
  };

  users.push(user);
  save("users.json",users);

  console.log("✅ Registered:", username);

  res.json({status:"registered"});
});

/* LOGIN */
app.post("/login",(req,res)=>{

  let users = load("users.json");

  const { username, password } = req.body;

  const user = users.find(u =>
    u.username === username && u.password === password
  );

  if(user){
    req.session.user = user.username;

    console.log("✅ Login:", user.username);

    if(user.username==="admin"){
      return res.json({status:"admin"});
    } else {
      return res.json({status:"user"});
    }
  }

  res.json({status:"fail"});
});

/* FACE LOGIN */
app.post("/face-login",(req,res)=>{
  const { username } = req.body;

  let users = load("users.json");

  const user = users.find(u => u.username === username && u.face !== null);

  if(user){
    req.session.user = user.username;
    return res.json({status:"success"});
  }

  res.json({status:"fail"});
});

/* LOGOUT */
app.get("/logout",(req,res)=>{
  req.session.destroy(()=>res.redirect("/"));
});

/* =========================
   CATEGORY
========================= */
app.post("/category",(req,res)=>{

  let dataArr = load("category.json");

  const data = {
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  };

  dataArr.push(data);
  save("category.json",dataArr);

  res.json({ok:true});
});

/* =========================
   SOS
========================= */
app.post("/sos",(req,res)=>{

  let dataArr = load("sos.json");

  const data = {
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  };

  dataArr.push(data);
  save("sos.json",dataArr);

  console.log("🚨 SOS Sent");

  res.json({ok:true});
});

/* =========================
   TRACK
========================= */
app.post("/track",(req,res)=>{

  let dataArr = load("track.json");

  const data = {
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  };

  dataArr.push(data);
  save("track.json",dataArr);

  res.json({ok:true});
});

/* =========================
   ADMIN SECURITY
========================= */

function isAdmin(req,res,next){
  if(req.session.user==="admin"){
    next();
  } else {
    res.status(403).send("❌ Unauthorized");
  }
}

/* ADMIN APIs */
app.get("/admin/users", isAdmin, (req,res)=>{
  res.json(load("users.json"));
});

app.get("/admin/sos", isAdmin, (req,res)=>{
  res.json(load("sos.json"));
});

app.get("/admin/track", isAdmin, (req,res)=>{
  res.json(load("track.json"));
});

app.get("/admin/category", isAdmin, (req,res)=>{
  res.json(load("category.json"));
});
app.get("/readme",(req,res)=>{
  res.sendFile(path.join(__dirname,"readme.html"));
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, ()=>{
  console.log("🚀 Server running on http://localhost:"+PORT);
});
