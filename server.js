const express=require('express')
const app=express()
const http=require('http').createServer(app)
const  io=require('socket.io')(http)

app.use(express.static(__dirname+'/script'));
app.use(express.static(__dirname));

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html')
})

http.listen(3000,()=>{
    console.log("connected")
})

io.on("connection",(socket)=>{
    console.log("connection established")

    socket.on("user-connected",(userId)=>{
        socket.broadcast.emit("new-user-connected",userId)
    })

    socket.on("offer",(offer)=>{
        socket.broadcast.emit("offer-obj",offer)
    })

    socket.on("candidate",(candidate)=>{
        socket.broadcast.emit("candidate-obj",candidate)
    })

    socket.on("answer",(answer)=>{
        socket.broadcast.emit("answer-obj",answer)
    })

})