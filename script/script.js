const socket=io()
const videoElemOne=document.querySelector('[data-video-1]')
const videoElemTwo=document.querySelector('[data-video-2]')
let localStream,remoteStream,peerConnection

const servers = {
    iceServers:[{
        urls:['stun:stun2.l.google.com:19302','stun:stun1.l.google.com:19302']
    }]
}

let username=String(Math.floor(Math.random()*10000))


let init = async () =>{

    socket.on("connect",()=>{
        socket.emit("user-connected",username)
    })

    socket.on("new-user-connected",(id)=>{
        createOffer(id)
    })

    socket.on("offer-obj",(offer)=>{
        createAnswer(offer.id,offer.offer)
    })

    socket.on("candidate-obj",(candidate)=>{
        if(peerConnection){
            peerConnection.addIceCandidate(candidate)
        }
    })

    socket.on("answer-obj",(answer)=>{
        addAnswer(answer)
    })


    localStream=await navigator.mediaDevices.getUserMedia({audio:false,video:true})
    videoElemOne.srcObject=localStream
    
}

let createPeerConnection = async (id) =>{
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    videoElemTwo.srcObject=remoteStream

    localStream.getTracks().forEach((track)=>{
        peerConnection.addTrack(track,localStream)
    })

    peerConnection.ontrack = (event) =>{
        event.streams[0].getTracks().forEach((track)=>{
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            socket.emit("candidate",event.candidate)
        }
    }
}

let createOffer = async (id) =>{
    
    await createPeerConnection(id)

    let offer = await peerConnection.createOffer()
    peerConnection.setLocalDescription(offer)

    socket.emit("offer",{offer,id})
    
}

let createAnswer = async (id,offer) =>{
    await createPeerConnection(id)

    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    socket.emit("answer",answer)
}

let addAnswer = async (answer) => {
    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer)
    }
}

init()