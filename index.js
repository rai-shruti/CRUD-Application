require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const session=require('express-session');


const app=express();
const PORT=process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('Connected to the database!'))
  .catch((error) => console.error('Database connection error:', error));

  //middlewares
  app.use(express.urlencoded({extended:false}));
  app.use(express.json());
  app.use(session({
    secret:'Shruti',
    saveUninitialized:true,
    resave:false,
 } 
))

app.use((req,res,next)=>{
res.locals.message=req.session.message;
delete req.session.message;
next();

}
)


app.use(express.static('uploads'));

app.set('view engine','ejs');
//routes prefix;
app.use("",require("./routes/routes"));


app.listen(PORT,()=>{
    console.log(`Server started at:${PORT}`);
})