
const User = require('../models/userModel')
const Group = require('../models/groupModel')
const { connectedUsers } = require('../socketManager');
exports.createGroup = async(req,res)=>{
    try {
        const {name,coverPhoto,mainPhoto,about,userid,Admins,members,posts,dateCreated,time}= req.body
        const user = await User.findById(userid) 
        const group = new Group({name,coverPhoto,mainPhoto,about,userid:userid,Admins,members,posts,dateCreated,time})
        group.Admins.push(user)
        group.members.push(user)
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
        const isMember= group.members.map((member)=> member._id === sender._id)
        console.log(isMember)
        if(isMember.length==0){
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
    return res.json({msg:"wait until admin approaves ur join req!"})

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
    const isMember= group.members.map((member)=> member._id === ismember._id)
     if(isMember.length>0){
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

exports.groupPost = async(req,res)=>{
    try {
        const{userid,groupid,postType,postFile,content,stickers,tags,likes,comments
        ,location,dateCreated}=req.body
        // console.log(req.file)
        // const postFile = req.file.path;//file upload either pic audio video
       if(!userid || !postType){
        return res.status(400).json({error:"post cant be empty or userid not given"})
       }
       const group = await Group.findById(groupid)//get group in which post done
       const gropPost = new Group({userid:userid,groupId:groupid,postFile,postType,content,stickers,tags,likes,comments,location,dateCreated})
       await gropPost.save()
       group.posts.unshift(gropPost)//store post in groups post array
        await group.save()                    
        return res.status(200).json({success:true,post:gropPost})
        
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({error})
    }
}
