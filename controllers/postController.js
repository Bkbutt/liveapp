const { contains } = require('underscore')
const Post = require('../models/postModel')
const User = require('../models/userModel')
const Ad = require('../models/adModel')

exports.createPost = async(req,res)=>{
try {
    const{userid,postType,content,stickers,category,tags,likes,comments,copyLink,noOfShares,noOfreports
    ,location,postUploadTime,downloadPost}=req.body
    if(!userid || !postType){
        return res.status(400).json({error:"post cant be empty or userid not given"})
    }
    // console.log(req.file)
    // const postFile = req.file.path;//file upload either pic audio video
   const post = new Post({userid:userid,postType,content,category,stickers,tags,likes,comments,copyLink
                          ,noOfShares,noOfreports,location,postUploadTime,downloadPost})

    await post.save()                    
    const user = await User.findById(userid)
    user.mediaCount+=1
    await user.save()                      
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

exports.getMediaCountThisMonth=async(req,res)=>{
    try {
        const users = await User.find({});
    
        const currentMonth=new Date().getMonth()
        const currentYear=new Date().getFullYear()
        const monthUsers = users.filter((user) => {
          const userDate = new Date(user.time);
          return (
            userDate.getMonth() === currentMonth && // Month is 0-indexed
            userDate.getFullYear() === currentYear
          );
        });
      
        let monthMedia=0
      monthUsers.map((user=>{
        monthMedia+=user.mediaCount
      }))
  return res.status(400).json({msg:`total media uploded by this month new users is:${monthMedia}`})
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)   
    }
}




exports.getTimelinePostsForNew = async (req, res) => {
    try {

        function mixAndMatchPosts(arr1, arr2,arr3,arr4,arr5,arr6) {
                        const mixedPosts = [];
                        const minLength = Math.min(arr1.length, arr2.length,arr3.length,arr4.length,arr5.length,arr6.length);
                        
                        for (let i = 0; i < minLength; i++) {
                            mixedPosts.push(arr1[i]);
                            mixedPosts.push(arr2[i]);
                            mixedPosts.push(arr3[i])
                            mixedPosts.push(arr4[i])
                            mixedPosts.push(arr5[i])
                            mixedPosts.push(arr6[i])
                        }
                      // If one array is longer than the other, add the remaining posts
                        mixedPosts.push(...arr1.slice(minLength));
                        mixedPosts.push(...arr2.slice(minLength));
                        mixedPosts.push(...arr3.slice(minLength))
                        mixedPosts.push(...arr4.slice(minLength))
                        mixedPosts.push(...arr5.slice(minLength))
                        mixedPosts.push(...arr6.slice(minLength))
                        
                        return mixedPosts;
                    }
        const { userid } = req.body;
        const user = await User.findById(userid);
        // console.log('user', user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const posts = await Post.find({});
        const totalPostCount = posts.length;

        const countryPerCount = Math.floor((20 / 100) * totalPostCount);
        const interestPerCount = Math.floor((30 / 100) * totalPostCount);
        const friendPostsCount = Math.floor((20 / 100) * totalPostCount);
        const adsPostsCount = Math.floor((10 / 100) * totalPostCount);
        const fansPerCount = Math.floor((20 / 100) * totalPostCount);


        const countryPosts =[]
       for(const post of posts)  {
           const postUser = await User.findById(post.userid);
                        // console.log('user counteery',user.country)
                         if (postUser.country === user.country) 
                             countryPosts.push(post);
         }
        // Trend posts in the user's country
        const trendRegex = /trend|popular/gi;
        const trendPosts = countryPosts.filter((post) => {
            const matched = trendRegex.test(post.content);
            return matched;
        }) // Take the first 'countryPerCount' posts
        const shuffledCountryPosts = trendPosts.sort(()=>Math.random()-0.5)
        const slicedCountryPosts= shuffledCountryPosts.slice(0, countryPerCount);

        // Category-wise interest posts
        console.log('user interest', user.interest);
        const interestPosts = await Post.find({ category: user.interest });
        const shuffledInterestPosts = interestPosts.sort(()=>Math.random()-0.5) // Take the first 'interestPerCount' posts
        const sliceInterestPosts = shuffledInterestPosts.slice(0,interestPerCount)

        //friends posts
        let friends = user.friends;
        // console.log('friends',friends)
        const friendsPosts = posts
        .filter((post) => friends.map((friend) => friend._id === post.userid ))
        const shuffledFriendPosts = friendsPosts.sort(()=>Math.random()-0.5)
        const sliceFriendPosts= shuffledFriendPosts.slice(0,friendPostsCount)
        console.log('shuffledFriendsPosts',sliceFriendPosts)

        //ads posts 
        const ads = await Ad.find({})
        const shuffleAds = ads.sort(()=> Math.random()-0.5)
        const adsToInclude= shuffleAds.slice(0,adsPostsCount)
        
        //fans activity 20 per
        let fans = user.likes
        const fansActivityPosts = posts.filter((post) => {
            // Check if the post was created by a fan
            const isCreatedByFan = fans.map((fan) =>fan._id === post.userid)
            // console.log('postscommnts',post.comments)
            // Check if any of the fans have commented on the post
            const hasFanCommented = post.comments.map((comment) =>
              fans.filter((fan) => fan._id === comment.user._id)
            )
            // if any fan liked the post
            const isLikedByFan =post.likes.map((user) =>
            fans.filter((fan) => fan._id === user._id)
          )
             return isCreatedByFan || hasFanCommented || isLikedByFan
          })
          const shuffledFanPosts = fansActivityPosts.sort(()=>Math.random()-0.5)
          const sliceFanPosts= shuffledFanPosts.slice(0,fansPerCount)
          console.log('shuffledFanPosts',sliceFanPosts)
        console.log('after fans actiscity')

        // Filter posts by age (1-7 days and 8-30 days)
        const currentDate = new Date();
        const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

        const recentPosts = posts.filter((post) => {
            const postDate = new Date(post.time);
            return postDate >= oneWeekAgo && postDate <= currentDate;
        });

        const olderPosts = posts.filter((post) => {
            const postDate = new Date(post.time);
            return postDate >= thirtyDaysAgo && postDate < oneWeekAgo;
        });

        // Calculate the number of recent and older posts to include
        const recentPostCount = Math.floor((80 / 100) * totalPostCount);
        const olderPostCount = totalPostCount - recentPostCount;

        // Shuffle recent and older posts separately
        const shuffledRecentPosts = recentPosts.sort(() => Math.random() - 0.5);
        const shuffledOlderPosts = olderPosts.sort(() => Math.random() - 0.5);

        // Take the first 'recentPostCount' recent posts and 'olderPostCount' older posts
        const recentPostsToInclude = shuffledRecentPosts.slice(0, recentPostCount);
        const olderPostsToInclude = shuffledOlderPosts.slice(0, olderPostCount);

        // Combine trend posts, interest posts, recent posts, and older posts
        const combinedPosts = mixAndMatchPosts(slicedCountryPosts, sliceInterestPosts,sliceFriendPosts,adsToInclude,sliceFanPosts, recentPostsToInclude.concat(olderPostsToInclude));

        return res.status(200).json(combinedPosts);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Server error' });
    }
};