const { contains } = require('underscore')
const Post = require('../models/postModel')
const User = require('../models/userModel')

exports.createPost = async(req,res)=>{
try {
    const{userid,postType,content,stickers,tags,likes,comments,copyLink,noOfShares,noOfreports
    ,location,postUploadTime,downloadPost}=req.body
    console.log(req.file)
    const postFile = req.file.path;//file upload either pic audio video
   if(!userid || !postType){
    return res.status(400).json({error:"post cant be empty or userid not given"})
   }
   const post = new Post({userid:userid,postFile,postType,content,stickers,tags,likes,comments,copyLink
                          ,noOfShares,noOfreports,location,postUploadTime,downloadPost})

    await post.save()                    
    return res.status(200).json({success:true,post:post})
    
} catch (error) {
    console.log(error.message)
    return res.status(400).json({error})
}

}

exports.getPost= async(req,res)=>{

   const{postid}= req.params.id
   const post = await Post.findById(postid)
   if(!post){
     return res.json({msg:"no such post exists with this id"})
   }
   return res.status(200).json({success:true,post:post})
}


exports.updatePost= async(req,res)=>{
try {
    let update = req.body
    let post = await Post.findByIdAndUpdate(req.params.id,update,{success:true})
    await post.save()
    return res.status(200).json({msg:"post updated successfully",updatedPost:post})
      
    
} catch (error) {
    console.log(error)
    return res.status(400).json(error)
}
}

exports.deletePost= async(req,res)=>{
    try {
        const {postid} =req.params.id
        let deletePost = await Post.findByIdAndDelete(postid)
        if(!deletePost){
            return res.status(200).json({ success: true, message: "Post not found or deleted already" });
        }
        return res.status(200).json({ success: true, message: "Post Deleted Successfully ✔" });

    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)
    }
}



exports.likePost = async(req,res)=>{
    try {
        const {postid,userid}= req.body
        const post = await Post.findById(postid)
        if(!post){
            return res.json({msg:"no such post exists with this id"})  
        }
        const user= await User.findById(userid)
        if(!user){
            return res.json({msg:"no such user exists with this id"})   
        }
         //check it user already in likes
        const isLiked = post.likes.some((user)=> user === user);
        console.log(isLiked)
        if(isLiked){
            return res.json({msg:"you already liked this post"})  
        }
        console.log(user)
        post.likes.unshift(user)
        await post.save()

        return res.status(200).json({msg:"you liked this post"})

    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error) 
    }
}

exports.commentOnPost= async(req,res)=>{
    try {
        const {postid,userid,comment}= req.body
        const post = await Post.findById(postid)
        if(!post){
            return res.json({msg:"no such post exists with this id"})  
        }
        const user= await User.findById(userid)
        if(!user){
            return res.json({msg:"no such user exists with this id"})   
        } 
        //store comment
        const Comment={
            user, comment:comment
        }
        //save in array
        post.comments.push(Comment)
        await post.save()

        return res.status(200).json({msg:"comment uploaded successfully",post})
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)  
    }
}


exports.myPosts = async(req,res)=>{
    try {
        const{ userid}=  req.body
       const myPosts= await Post.find({userid:userid})
       if(myPosts ==[]){
        return res.status(200).json({msg:"seems like you dont have shared any post.Post now"})
       }
       return res.status(200).json({msg:"Yours Posts..",myPosts})


    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)   
    }

}

exports.getAllPosts = async(req,res)=>{
    try {

       const Posts= await Post.find({})
       if(Posts==[]){
        return res.status(200).json({msg:"no posts"})
       }
       return res.status(200).json({msg:"All Posts",Posts})


    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)   
    }

}