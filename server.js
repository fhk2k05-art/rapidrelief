const express = require("express");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");

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
   MONGODB CONNECTION
========================= */
mongoose.connect("mongodb+srv://fadil:1234@cluster0.8jfo8j3.mongodb.net/rapid")
.then(()=>console.log("✅ MongoDB Connected"))
.catch(err=>console.log("❌ DB ERROR:", err));

/* =========================
   MODELS
========================= */

const User = mongoose.model("User", {
  username: String,
  password: String,
  face: String,
  time: String
});

const SOS = mongoose.model("SOS", {
  user: String,
  lat: Number,
  lon: Number,
  type: String,
  time: String
});

const Track = mongoose.model("Track", {
  user: String,
  lat: Number,
  lon: Number,
  time: String
});

const Category = mongoose.model("Category", {
  user: String,
  type: String,
  lat: Number,
  lon: Number,
  time: String
});

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
   AUTH
========================= */

/* REGISTER */
app.post("/register", async (req,res)=>{
  try{
    const { username, password, face } = req.body;

    const exists = await User.findOne({ username });
    if(exists) return res.json({status:"exists"});

    const user = new User({
      username,
      password,
      face: face || null,
      time:new Date().toLocaleString()
    });

    await user.save();

    console.log("✅ User Registered:", username);

    res.json({status:"registered"});
  }catch(err){
    console.log(err);
    res.json({status:"error"});
  }
});

/* LOGIN */
app.post("/login", async (req,res)=>{
  try{
    const { username, password, face } = req.body;

    let user = null;

    // normal login
    if(username && password){
      user = await User.findOne({ username, password });
    }

    // face login
    if(!user && username && face){
      user = await User.findOne({
        username,
        face: { $ne: null }
      });
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

    res.json({status:"fail"});

  }catch(err){
    console.log(err);
    res.json({status:"error"});
  }
});

/* LOGOUT */
app.get("/logout",(req,res)=>{
  req.session.destroy(()=>res.redirect("/"));
});

/* =========================
   CATEGORY
========================= */
app.post("/category", async (req,res)=>{
  const data = new Category({
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  });

  await data.save();
  res.json({ok:true});
});

/* =========================
   SOS
========================= */
app.post("/sos", async (req,res)=>{
  const data = new SOS({
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  });

  await data.save();

  console.log("🚨 SOS Saved");

  res.json({ok:true});
});

/* =========================
   TRACK
========================= */
app.post("/track", async (req,res)=>{
  const data = new Track({
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  });

  await data.save();

  res.json({ok:true});
});

/* =========================
   ADMIN SECURITY
========================= */
function isAdmin(req,res,next){
  if(req.session.user === "admin"){
    next();
  } else {
    res.status(403).send("❌ Unauthorized");
  }
}

/* ADMIN APIs */
app.get("/admin/users", isAdmin, async (req,res)=>{
  const data = await User.find();
  res.json(data);
});

app.get("/admin/sos", isAdmin, async (req,res)=>{
  const data = await SOS.find();
  res.json(data);
});

app.get("/admin/track", isAdmin, async (req,res)=>{
  const data = await Track.find();
  res.json(data);
});

app.get("/admin/category", isAdmin, async (req,res)=>{
  const data = await Category.find();
  res.json(data);
});

/* =========================
   START SERVER
========================= */
app.listen(PORT,()=>{
  console.log("🚀 Server running on port " + PORT);
});
