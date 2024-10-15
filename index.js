import express from "express";
import session from "express-session";
import { validateLogin, showPosts, findPost, createPost, updatePost, deletePost, createLogin, findUser } from "./queries.js";
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

// initial login screen
app.get("/", (req, res) => {
    res.render("login.ejs", {errorMessage:""});
});

// process login results
app.post("/login", async (req, res) => {
    var userID = req.body.userID;
    var password = req.body.password;
    var login = await validateLogin(userID, password);
    if (login) {
        req.session.user = userID;
        req.session.username = login.name;
        var posts = await showPosts();
        res.render("index.ejs", {posts:posts});             
    }
    else {
        res.render("login.ejs", {errorMessage:"UserID or password incorrect"}); 
    }  
});

// show register page
app.get("/register", async (req, res) => {
    res.render("create_user.ejs", {errorMessage:""});
});

// register page
app.post("/register", async (req, res) => {
    var user = await findUser( req.body.id );

    // unsuccessful
    if( user.rowCount != 0 )
    {
        res.render("create_user.ejs", {errorMessage: " ID is already in use "})
    }
    else {
        await createLogin( req.body.id, req.body.name, req.body.password );
        // if successful
        res.render("login.ejs", {errorMessage:""});
    }
});

// main blog page
app.get("/main", async (req, res) => {
    // get and render posts
    var posts = await showPosts();
    res.render("index.ejs", {posts:posts});
});

// edit post page
app.get("/editPost", async (req, res) => {
    // get user id
    var userID = req.session.user;
    var post = await findPost( req.query.id );

    if( !post ) {
        post = {post_id: undefined, name: req.session.name, date: undefined, title: undefined, content: undefined};
        res.render("editPost.ejs", {post:post});
    }
    else {
        if( post.creator_user_id == userID )
        {
            post = {blog_id: post.blog_id, name: post.creator_name, date: post.date_created, title: post.title, content: post.body};
            res.render("editPost.ejs", {post:post});
        }
        else {
            res.render("error.ejs", {errorMessage:"Cannot edit a post that's not yours"});
        }
    }
});

// process form results
app.post("/save", async (req, res) => {

    var post = undefined;
    // check if user ID matches post's user ID
    if( req.body.id ) {
        post = await findPost( req.body.id );
        if ( post?.creator_user_id != req.session.user ) {
            res.render("error.ejs", {errorMessage:"Cannot edit a post that's not yours"});
        }
    }
    // if post exists, update
    if( post ) {
        post = {id: Number(req.body.id), userid: req.session.user, name: req.body.name, date: new Date(), title: req.body.title, content: req.body.content};
        // update post
        await updatePost( post );
    }

    // if post does not exist, insert
    else {
        
        const newPost = 
        {
            id: Date.now(),
            userid: req.session.user,
            name: req.body.name,
            date: new Date(),
            title: req.body.title,
            content: req.body.content 
        }

        // insert post
        await createPost( newPost );
    }
     
    // render all posts
    var posts = await showPosts();
    res.render("index.ejs", {posts});
});

// process delete post
app.get("/delete", async (req, res) => {

    var post = undefined;
    post = await findPost( req.query.id );

    if ( post?.creator_user_id != req.session.user ) {
        res.render("error.ejs", {errorMessage:"Cannot edit a post that's not yours"});
    }
    else {
        // delete the post
        await deletePost( req.query.id );

        // render all post
        var posts = await showPosts();
        res.render("index.ejs", {posts:posts});  
    }       
});

app.listen(port, () => {
 console.log(`Server running on port ${port}.`);
});