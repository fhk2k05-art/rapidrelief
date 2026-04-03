const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

/* ========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "rapid_secret",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(__dirname));

/* ========================= */
/* FILE SYSTEM */
function ensure(file){
  if(!fs.existsSync(file)){
    fs.writeFileSync(file,"[]");
  }
}

["users.json","sos.json","track.json","category.json"].forEach(ensure);

function load(file){
  return JSON.parse(fs.readFileSync(file));
}

function save(file,data){
  fs.writeFileSync(file, JSON.stringify(data,null,2));
}

/* ========================= */
/* ROUTES */

app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,"login.html"));
});

/* DASHBOARD */
app.get("/dashboard",(req,res)=>{
  if(!req.session.user){
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname,"rr.html"));
});

/* ADMIN */
app.get("/admin",(req,res)=>{
  if(req.session.user === "admin"){
    res.sendFile(path.join(__dirname,"admin.html"));
  } else {
    res.redirect("/dashboard");
  }
});

/* ========================= */
/* AUTH */

/* REGISTER */
app.post("/register",(req,res)=>{

  let users = load("users.json");

  const { username, password, face } = req.body;

  if(users.find(u=>u.username===username)){
    return res.json({status:"exists"});
  }

  users.push({
    username,
    password,
    face: face || null,
    time: new Date().toLocaleString()
  });

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

    if(user.username === "admin"){
      return res.json({status:"admin"});
    } else {
      return res.json({status:"user"});
    }
  }

  res.json({status:"fail"});
});

/* LOGOUT */
app.get("/logout",(req,res)=>{
  req.session.destroy(()=>{
    res.redirect("/");
  });
});

/* ========================= */
/* SOS */
app.post("/sos",(req,res)=>{

  let dataArr = load("sos.json");

  const data = {
    user:req.session.user || "guest",
    ...req.body,
    time:new Date().toLocaleString()
  };

  dataArr.push(data);
  save("sos.json",dataArr);

  console.log("🚨 SOS:", data);

  res.json({ok:true});
});

/* ========================= */
/* CATEGORY */
app.post("/category",(req,res)=>{

  let dataArr = load("category.json");

  const data = {
    user:req.session.user || "guest",
    ...req.body,
    time:new Date().toLocaleString()
  };

  dataArr.push(data);
  save("category.json",dataArr);

  res.json({ok:true});
});

/* ========================= */
/* TRACK */
app.post("/track",(req,res)=>{

  let dataArr = load("track.json");

  const data = {
    user:req.session.user || "guest",
    ...req.body,
    time:new Date().toLocaleString()
  };

  dataArr.push(data);
  save("track.json",dataArr);

  res.json({ok:true});
});

/* ========================= */
/* ADMIN DATA */
app.get("/admin/data",(req,res)=>{
  res.json({
    users:load("users.json"),
    sos:load("sos.json"),
    track:load("track.json"),
    category:load("category.json")
  });
});

/* ========================= */
app.listen(PORT,()=>{
  console.log("🚀 Server running on port " + PORT);
});
