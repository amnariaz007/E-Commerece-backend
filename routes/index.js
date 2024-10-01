const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');
const mongoose = require('mongoose');

router.get('/', function(req,res) {
    let error = req.flash("error")
    res.render('index', {error, loggedin: false});
})

router.get('/shop',isLoggedIn,  async(req,res) =>{
   let product = await productModel.find();
   let success = req.flash("success");
    res.render('shop', {product, success});
} )

router.get('/cart',isLoggedIn,  async(req,res) =>{
    let user = await userModel.findOne({email: req.user.email}).populate('cartDetail');

    const bill = (Number(user.cartDetail.price)+20)-Number(user.cartDetail.discount);
     res.render('cart', {user, bill});
 } )
 
 

router.get('/addtocart/:productid',isLoggedIn,  async(req,res) =>{
   let user = await userModel.findOne({email: req.user.email});
   user.cartDetail.push(req.params.productid);
   await user.save();
  req.flash("success", "added to the cart");
   res.redirect('/shop');
 } )


router.get('/delete/:productid', isLoggedIn, async (req, res) => {
    try {
        // Find the user by their email
        let user = await userModel.findOne({ email: req.user.email });

        // Convert the req.params.productid to ObjectId
        const productIdToRemove = new mongoose.Types.ObjectId(req.params.productid);

        // Remove the product from the cartDetail array using $pull
        user.cartDetail = user.cartDetail.filter(item => item.toString() !== productIdToRemove.toString());
        await user.save();
        res.redirect('/cart');
    } catch (error) {
        console.error('Error deleting product from cart:', error);
        res.status(500).send('Server error');
    }
});

router.get('/increase/:productId', isLoggedIn,  async(req,res)=>{


    try {
        let user = await userModel.findOne({ email: req.user.email });
        const productIdToAdd = new mongoose.Types.ObjectId(req.params.productId);
    
        // Debugging to check the ID format
        console.log("Product ID to add:", productIdToAdd.toString());
        
        console.log("Cart details:", user.cartDetail);
    
        // Find the cart item using the correct `productId`
        const cartItem = user.cartDetail.find(item => {
            console.log("Comparing:", item.productId.toString(), "with", productIdToAdd.toString());
            return item.productId.toString() === productIdToAdd.toString();
        });
        console.log(cartItem);

        
        // Check if the cart item exists
        if (cartItem) {
            cartItem.quantity += 1;  // Increase the quantity
        } else {
            return res.status(404).json({ message: 'Product not found in cart' });
        }
    
        // Save the updated user document
        await user.save();
        return res.status(200).json({ message: 'Product quantity increased', cart: user.cartDetail });
    
    } catch (error) {
        return res.status(500).json({ message: 'Error updating cart', error });
    }
    
 })


   

router.get('/logout', isLoggedIn,  function(req,res){
    res.render("shop");
})

module.exports = router;





