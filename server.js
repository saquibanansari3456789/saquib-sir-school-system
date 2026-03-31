const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Initialize database
const db = new sqlite3.Database('./database.db', (err) => {
  if(err) console.log(err);
  else console.log("Database connected");
});

// Create tables if not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS admins(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS students(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    class TEXT,
    section TEXT,
    gender TEXT,
    english INTEGER,
    science INTEGER,
    marathi INTEGER,
    social_science INTEGER,
    physical_edu TEXT,
    computer TEXT,
    deeniyat TEXT,
    photo TEXT
  )`);

  // Default admin
  db.get("SELECT * FROM admins WHERE username='saquib sir'", (err, row) => {
    if(!row){
      db.run("INSERT INTO admins(username,password) VALUES(?,?)", ['saquib sir','12345']);
      console.log("Default admin created");
    }
  });
});

// Admin login
app.post('/login', (req,res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM admins WHERE username=? AND password=?", [username,password], (err,row)=>{
    if(err) res.send({status:"error"});
    else if(row) res.send({status:"success"});
    else res.send({status:"fail"});
  });
});

// Add student
app.post('/add-student', upload.single('photo'), (req,res)=>{
  const { name,className,section,gender,english,science,marathi,social_edu,physical_edu,computer,deeniyat } = req.body;
  const photo = req.file ? req.file.filename : '';
  db.run(`INSERT INTO students(name,class,section,gender,english,science,marathi,social_science,physical_edu,computer,deeniyat,photo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
  [name,className,section,gender,english,science,marathi,social_edu,physical_edu,computer,deeniyat,photo],
  (err)=> {
    if(err) res.send("Error adding student");
    else res.send("Student added successfully");
  });
});

// Get all students
app.get('/students', (req,res)=>{
  db.all("SELECT * FROM students", [], (err,rows)=>{
    if(err) res.send([]);
    else res.send(rows);
  });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));