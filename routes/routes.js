const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const user = require("../models/user");


//image upload
var storage=multer.diskStorage({
     destination:function(req,file,cb){
          cb(null,"./uploads");
     },
     filename:function(req,file,cb){
          cb(null,file.fieldname+"_"+Date.now()+"_"+file.originalname);
                  
     }
})
 // 
 var upload=multer({
     storage:storage,

 }).single("image");

 //insert a user into database route
 router.post('/add', upload, async (req, res) => {
     try {
         // Check if file exists in the request
         if (!req.file) {
             return res.status(400).json({ message: "Image is required", type: "danger" });
         }
 
         // Create a new user instance
         const user = new User({
             name: req.body.name,
             phone: req.body.phone,
             email: req.body.email,
             image: req.file.filename, // Get filename from Multer
         });
 
         // Save the user to the database
         const savedUser = await user.save();
 
         // Print the saved user in the console
         console.log('Added user:', savedUser);
 
         // Set a success message in the session
         req.session.message = {
             type: "success",
             message: "User added successfully",
         };
 
         // Redirect to the home page
         res.redirect("/");
     } catch (error) {
         console.error("Error saving user:", error);
 
         // Return error message as a response
         res.status(500).json({ message: error.message, type: "danger" });
     }
 });
 
// Get all users route
router.get("/", async (req, res) => {
     try {
         // Use the User model to fetch all users from the database
         const users = await User.find({});
         
         // Render the index page and pass the users to it
         res.render("index", {
             title: "Home Page",
             users: users,
         });
     } catch (err) {
         // Handle any errors that occur during the database query
         console.error("Error fetching users:", err);
         res.json({ message: err.message });
     }
 });
 

router.get('/',(req,res)=>{
     res.render("index",{title:'Home Page'})
});
router.get('/add',(req,res)=>{
     res.render("add_users",{title:'Add Users'})
});

// Edit user route
// Edit user
router.get("/edit/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.redirect("/");
        res.render("edit_users", { title: "Edit User", user });
    } catch (err) {
        res.redirect("/");
    }
});

// Update user

router.post("/update/:id", upload, async (req, res) => {
    try {
        const newImage = req.file ? req.file.filename : req.body.old_image;
        await User.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            image: newImage,
        });
        req.session.message = { type: "success", message: "User updated successfully" };
        res.redirect("/");
    } catch (err) {
        req.session.message = { type: "danger", message: "Failed to update user" };
        res.redirect(`/edit/${req.params.id}`);
    }
});

//delete user route

router.get('/delete/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Find and delete the user by ID
        const result = await User.findByIdAndDelete(userId);

        if (!result) {
            // Handle the case where the user is not found
            req.session.message = { type: 'danger', message: 'User not found' };
            return res.redirect('/');
        }

        // Handle optional image deletion (if required by third-party services)
        if (result.image) {
            console.log(`Placeholder action to remove image: ${result.image}`);
            // Any logic for database cleanup or API calls can go here.
        }

        // Success response
        req.session.message = { type: 'info', message: 'User Deleted Successfully' };
        res.redirect('/');
    } catch (err) {
        console.error('Error deleting user:', err);
        req.session.message = { type: 'danger', message: 'Failed to delete user' };
        res.redirect('/');
    }
});

module.exports = router;
