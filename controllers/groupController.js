const Post = require('../models/postModel')
const User = require('../models/userModel')
const Group = require('../models/groupModel')

exports.createGroup = async(req,res)=>{
    try {
        const {name,coverPhoto,mainPhoto,about,userid,Admins,members,posts,dateCreated,time}= req.body
        const user = await User.findById(userid) 
        const group = new Group({name,coverPhoto,mainPhoto,about,userid,Admins,members,posts,dateCreated,time})
        group.Admins.push(user)
        await group.save()
        return res.status(400).json({MSG:"group created",group})   
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({MSG:"ERRor"})   
    }
}

exports.sendGrouopInvite = async(req,res)=>{
    try {
        
        const {senderid, invitedid,grpid}=req.body
        const sender =await User.findById(senderid)
        const invited=await User.findById(invitedid)
        const group = await Group.findById(grpid)
        const isMember= group.members.find((member)=> member._id === sender._id)
        if(!isMember){
        return res.status(400).json({MSG:"not a member ,cant invite people"})  
       }
       //send msg to user for group join using socket io
           // Assuming you have a 'connectedUsers' object to keep track of Socket.io connections
    const invitedSocket = connectedUsers[invitedid];
    if (invitedSocket) {
      // Emit a 'groupInvitation' event to the invited user
      invitedSocket.emit('groupInvitation', {
        sender: sender.username,
        group: group.name,
      });
    }
       return res.json({msg:"group invitation sent !"})
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({MSG:"ERRor"})    
    }
}


exports.acceptGroupInvitation = async(req,res)=>{
    try {
         // Assuming the frontend sends information about the group invitation and admin user
    const { adminid, invitedid, grpid } = req.body;
    const admin = await User.findById(adminid);
    const invited = await User.findById(invitedid);
    const group = await Group.findById(grpid);

    // Assuming you have a 'connectedUsers' object to keep track of Socket.io connections
    const adminSocket = connectedUsers[adminid];
    if (adminSocket) {
      // Emit an 'approvalRequest' event to the admin user
      adminSocket.emit('approvalRequest', {
        invited: invited.username,
        group: group.name,
      });
    }

    } catch (error) {
        console.log(error.message)
        return res.status(400).json({MSG:"ERRor"})     
    }
}

exports.approaveJoinRequest = async(req,res)=>{
    try {
    const {invitedid,grpid} = req.body
    const invited =await User.findById(invitedid)
    const group = await Group.findById(grpid)
    group.members.unshift(invited)
    return res.json({msg:"your req approaved for group, now u r a member"})
} catch (error) {
        console.log(error.message)
        return res.status(400).json({MSG:"ERRor"})     
    }
}


exports.leaveGroup= async(req,res)=>{
    try {
    const {memberid,grpid} = req.body
    const ismember =await User.findById(memberid)
    const group = await Group.findById(grpid)
    const isMember= group.members.find((member)=> member._id === ismember._id)
     if(isMember){
        const index =group.members.indexOf(isMember)
        group.members.splice(index,1)
        await group.save()
        return res.json({msg:"you left group"})
     } 

    return res.json({msg:"you are not in group members"})
} catch (error) {
        console.log(error.message)
        return res.status(400).json({MSG:"ERRor"})     
    }
}


