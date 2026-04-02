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
  secret: "secure_key",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(__dirname));

/* =========================
   FILE SYSTEM FIX (IMPORTANT)
========================= */

// ensure file exists
function ensureFile(file){
  if(!fs.existsSync(file)){
    fs.writeFileSync(file, "[]");
  }
}

// initialize files
["users.json","sos.json","track.json","category.json"].forEach(ensureFile);

// load data
function loadData(file){
  try{
    return JSON.parse(fs.readFileSync(file));
  }catch{
    return [];
  }
}

// save data
function saveData(file,data){
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
  if(req.session.user === "admin"){
    res.sendFile(path.join(__dirname,"admin.html"));
  } else {
    res.send("❌ Access Denied");
  }
});

/* =========================
   REGISTER (FIXED SAVE)
========================= */
app.post("/register",(req,res)=>{

  let users = loadData("users.json");

  const { username, password, face } = req.body;

  const exists = users.find(u => u.username === username);
  if(exists) return res.json({status:"exists"});

  const user = {
    username,
    password,
    face: face || null,
    time: new Date().toLocaleString()
  };

  users.push(user);
  saveData("users.json",users);

  console.log("✅ Saved user:", user);

  res.json({status:"registered"});
});

/* =========================
   LOGIN (FIXED)
========================= */
app.post("/login",(req,res)=>{

  let users = loadData("users.json");

  const { username, password, face } = req.body;

  let user = null;

  // normal login
  if(username && password){
    user = users.find(u =>
      u.username === username && u.password === password
    );
  }

  // face login
  if(!user && username && face){
    user = users.find(u =>
      u.username === username && u.face
    );
  }

  if(user){
    req.session.user = user.username;

    console.log("✅ Login:", user.username);

    if(user.username === "admin"){
      return res.json({status:"admin"});
    } else {
      return res.json({status:"user"});
    }
  }

  console.log("❌ Login failed");
  res.json({status:"fail"});
});

/* =========================
   LOGOUT
========================= */
app.get("/logout",(req,res)=>{
  req.session.destroy(()=>res.redirect("/"));
});

/* =========================
   CATEGORY
========================= */
app.post("/category",(req,res)=>{

  let dataArr = loadData("category.json");

  const data = {
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  };

  dataArr.push(data);
  saveData("category.json",dataArr);

  res.json({ok:true});
});

/* =========================
   SOS
========================= */
app.post("/sos",(req,res)=>{

  let dataArr = loadData("sos.json");

  const data = {
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  };

  dataArr.push(data);
  saveData("sos.json",dataArr);

  console.log("🚨 SOS:", data);

  res.json({ok:true});
});

/* =========================
   TRACK
========================= */
app.post("/track",(req,res)=>{

  let dataArr = loadData("track.json");

  const data = {
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  };

  dataArr.push(data);
  saveData("track.json",dataArr);

  res.json({ok:true});
});

/* =========================
   ADMIN PROTECTION
========================= */
function isAdmin(req,res,next){
  if(req.session.user === "admin"){
    next();
  } else {
    res.status(403).send("❌ Unauthorized");
  }
}

app.get("/admin/sos",isAdmin,(req,res)=>res.json(loadData("sos.json")));
app.get("/admin/track",isAdmin,(req,res)=>res.json(loadData("track.json")));
app.get("/admin/users",isAdmin,(req,res)=>res.json(loadData("users.json")));
app.get("/admin/category",isAdmin,(req,res)=>res.json(loadData("category.json")));

/* =========================
   START SERVER
========================= */
app.listen(PORT,()=>{
  console.log("🚀 Server running on port " + PORT);
});
