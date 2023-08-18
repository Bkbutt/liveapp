const express = require('express')
const router  = express.Router()
const multer = require('multer');
const upload = multer({dest:'postData/'})
const{ createPost,getPost,updatePost,deletePost,likePost,commentOnPost,myPosts,getAllPosts,getMediaCountThisMonth,getTimelinePostsForNew}= require('../controllers/postController')
router.post('/createPost',upload.single("postFile"),createPost)
router.get('/getPost/:id',getPost)
router.put('/updatePost/:id',updatePost)
router.delete('/deletePost/:id',deletePost)
router.post('/likePost',likePost)
router.post('/comment',commentOnPost)
router.post('/myPosts',myPosts)
router.get('/getAllPosts',getAllPosts)
router.get('/getMediaCountThisMonth',getMediaCountThisMonth)
router.post('/getTimelinePostsForNew',getTimelinePostsForNew)



module.exports= router