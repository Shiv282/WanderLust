const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const { response } = require('express');
const { count, info } = require('console');
const { kStringMaxLength } = require('buffer');
const DB_url = "mongodb+srv://shiv:shiv8055@cluster0.eucdfaf.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(DB_url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("DATABASE CONNECTION Successful")
    })
    .catch(err => {
        console.log("error")
        console.log(err)
    })

const userSchema = new mongoose.Schema({

      name: {
            type: String
        },
        email: {
            type: String
        },
        username: {
            type: String
        },
        password: {
            type: String
        },
        hosted:[[String]],
        joined:[[String]]
    })
    
    const Account = mongoose.model('Account', userSchema);

    const eventSchema = new mongoose.Schema({

        title: {
              type: String
          },
          type: {
              type: String
          },
          max: {
              type: String
          },
          startDate: {
              type: String
          },
          endDate: {
            type: String
        },
        startPoint: {
            type: String
        },
        destination: {
            type: String
        },
        description: {
            type: String
        },
        username:{
            type: String
        },
        joined:[[String]]
      })
      
      const Event = mongoose.model('Event', eventSchema);
  
    app.use(express.static(path.join(__dirname, 'public')))
    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, 'views'))
    app.use(express.urlencoded({extended: true}))
    
    app.get('/', async (req, res) => {
        //res.send(list2)
        console.log("Entered /")
        let flag=1;
        res.render('login',{flag});
    })

    app.get('/signup', async (req, res) => {
        let flag=1;
        console.log("Entered /signup")
        res.render('signup',{flag});
    })

    app.get("/register", function (req, res) {
        console.log("Entered /register")
        res.render("register");
    });

    app.post('/signup',async(req,res)=>{
        console.log("Entered /signupPOST")
        const {name,email,username,password} = req.body;
        let flag=1;
        let present = await Account.find({username:username})
        if(present.length>0){
            flag=0;
        }

        if(flag!=0){
        const info = new Account({
            name: name,
            email: email,
            username: username,
            password: password,
            hosted: [],
            joined: []
        })
        info.save();
        res.redirect('/')
    }
    else{
        res.render('signup',{flag})
    }
    })
    app.get('/updatehome',async (req,res) => {
        console.log("Entered /updatehome")
        const event = await Events.find({})
        res.redirect('home', {event})
    })

    app.post('/addEvent/:id',async(req,res)=>{
        
        console.log("Entered /addeventPOST")
        const userid = req.params.id;
        const user = await Account.findById(userid)
        console.log(user)
        const {title,type,max,startDate,endDate,startPoint,destination,description} = req.body;
        const info = new Event({
            title:title,
            type:type,
            max:max,
            startDate:startDate,
            endDate:endDate,
            startPoint:startPoint,
            destination:destination,
            description:description,
            username:user.username,
            joined:[]
        })
        //SHOW
        
        info.save();
        let zzz = await Account.updateOne({_id:userid},{$push:{"hosted":info.id}})
        const events = await Event.find({})
        res.render('home',{events,user})
    })

    app.get('/host/:id',async(req,res)=>{
        console.log("Entered /host")
        var userid = req.params.id
        const user = await Account.findById(userid)
        console.log(userid)
        console.log(user)
        res.render('host', {user})
    })

    app.get('/:id',async(req,res)=>{
        console.log("Entered /:id")
        params = req.params.id
        id = params.slice(0,24)
        userid=params.slice(24)
        const event =await Event.findById(id)
        const user = await Account.findById(userid)
        console.log(userid)
        console.log(id)
        res.render('show',{event,user});
    })

    app.get('/joined',async(req,res)=>{
        console.log("Entered /joined")
        const event =await Event.find({})
        res.render('join',{event});
    })

    app.get('/register/:id',async(req,res)=>{
        console.log("Entered /register/:id")
        const params = req.params.id;
        id=params.slice(0,24)
        userid=params.slice(24)
        console.log(id)
        console.log(userid)
        const event =await Event.findById(id)
        const user = await Account.findById(userid)
        let reg = await Event.updateOne({_id:id},{$push:{"joined":user.id}});
        let zzz = await Account.updateOne({_id:userid},{$push:{"joined":event.id}})
        res.render('show',{event});
    })

    app.get('/hosted/:id', async(req,res)=>{
        const id = req.params.id
        console.log(id)
        const user = await Account.findById(id)
        console.log(user)
        const users = await Account.find({})
        const hosted = user.hosted;
        const list=[]
        j=0
        for(var i=0;i<hosted.length;i++){
            var event = await Event.findById(hosted[i])
            list.push(event)
        }
        res.render('hostedEvents',{list,user,users})
            
    })

    app.get('/joined/:id', async(req,res)=>{
        const id = req.params.id
        console.log(id)
        const user = await Account.findById(id)
        console.log(user)
        const users = await Account.find({})
        const joined = user.joined;
        const list=[]
        j=0
        for(var i=0;i<joined.length;i++){
            var event = await Event.findById(joined[i])
            list.push(event)
        }
        res.render('joinedEvents',{list,user,users})
            
    })
    
    app.post('/login', async(req,res)=>{
        console.log("Entered /loginPOST")
        const {username,password} = req.body;
        let flag=1;
        let users = await Account.find({username:username})
        if(req.body.length==0)
        flag=0;
        if(users.length == 0){
            flag=0;
        }
        else{
        console.log(users)
        user=users[0]
        if(users[0].password === password)
            {
                const events= await Event.find({})
                res.render('home',{events,user})
            }else{
                flag=0;
            }
        }
        if(flag === 0){
            res.render('login',{flag});
        }
            
    })
    
    
app.listen(process.env.PORT || 3000, () => {  
    console.log('Serving on port 80')
})