// import client from "../prisma";

export const gettingReviewOfEachProduct = async(req ,res) => {
    try{

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while getting all the product ,please try again later !'
        })
    }
}

