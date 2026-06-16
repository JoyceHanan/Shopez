import jwt from 'jsonwebtoken'
const {verify}=jwt
export function verifyToken (req,res,next){
    //token verification logic 
   const token=req.cookies.token;
    // we use cookie parser middleware to access cookies property of req obj otherwise req.cookies is undefined 
    //if req from unauthorized user 
    if(!token){
        return res.status(401).json({message:"please login"})
    }
    try{          // we need try catch beacause this is not a route
    //token exits
   const decodedToken= verify(token,process.env.SECRET_KEY) //this is the same secret key used to encode the token')
   console.log(decodedToken)
   //attach user or decoded user  to req
   req.user = decodedToken
   //call next
   next()
    }
    catch(err){
     res.status(401).json({message:"session expires re-login"})
    }
}