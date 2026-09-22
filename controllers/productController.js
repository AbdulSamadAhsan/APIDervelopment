const  createProduct =async(req,res)=>{
const {name,price}= req.body || {};
console.log(req.body);
    if(!price){
            return res.status(400).json({
                success: false,
                message: "Price is required"
            });
    }
    if(isNaN(price)){
           return res.status(400).json({
                success: false,
                message: "Price is Not Number"
            });
    }
  if (price < 1000 || price > 10000) {
    return res.status(400).json({
        success: false,
        message: "Price must be between 1000 and 10000"
    });
}
    
return res.status(201).json({
    message:"Product Created Successfully",
    status:true

});
}

const getProducts= async(req,res)=>{
     console.log("Product Get Api Called");
     
        return res.status(200).json({
            success: true
         
        });

}
module.exports = {
    createProduct,
    getProducts
}