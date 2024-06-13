const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const {registermodel}=require("./models/register")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const {busmodel}=require("./models/bus")


const generateHashedPassword=async(password)=>{
    const salt=await bcrypt.genSalt(10)
    return bcrypt.hash(password,salt)
}

const app=express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://snehatk:6282011259@cluster0.jd3vcot.mongodb.net/busdb?retryWrites=true&w=majority&appName=Cluster0")

app.post("/signup",async(req,res)=>{
    let input=req.body
    let hashedPassword=await generateHashedPassword(input.password)
    console.log(hashedPassword)
    input.password=hashedPassword
    let register=new registermodel(input)
    register.save()
    console.log(register)
    res.json({"status":"success"})
})

app.post("/signin", (req, res) => {
    let input = req.body
     registermodel.find({"email":req.body.email}).then(
        (response)=>{
           if (response.length>0) {
            let dbPassword=response[0].password
            console.log(dbPassword)
            bcrypt.compare(input.password,dbPassword,(error,isMath)=>{
                if (isMath) {
                   jwt.sign({email:input.email},"bus-app",{expiresIn:"1d"},(error,token)=>{
                    if(error){
                        res.json({"status":"unable to create token"})
                    }else{
                        res.json({"status":"success","userid":response[0]._id,"token":token})
                    }
                   })
                } else {
                    
                    res.json("incorrect password")
                }
            })
           } else {

            res.json({"status":"user not found"})

           }
        }
    ).catch()

})
 
app.post("/view", (req, res) => {
    let token =req.headers["token"]
    jwt.verify(token,"bus-app",(error,decoded)=>{
        if(error){
            res.json({"status":"unauthorized access"})
        }
        else{
            if(decoded)
            {
                registermodel.find().then(
                    (response)=>{
                        res.json(response)
                    }
                ).catch()
            }
        }
    })

})

app.post("/add",(req,res)=>{
    let input=req.body
    let bus =new busmodel(input)
    bus.save()
    console.log(bus)
    res.json({"status":"success"})
})

app.post("/viewall",(req,res)=>{
    busmodel.find().then(
        (data)=>{
            res.json(data)
        }
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})

app.post("/search",(req,res)=>{
    let input=req.body
    busmodel.find(input).then(
        (data)=>{
            res.json(data)
        }
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})

app.post("/delete",(req,res)=>{
    let input=req.body
    busmodel.findByIdAndDelete(input._id).then(
        (response)=>{
        res.json({"status":"success"})
        }
        ).catch(
        (error)=>{
        res.json("error")
        }
        )
        
    })



app.listen(8080,()=>{
    console.log("server started")
})
    