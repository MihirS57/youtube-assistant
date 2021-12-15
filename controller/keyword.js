
exports.testing = async(req,res,next) => {
    try{
        const Id = req.params.Id;
        res.status(200).json({
            success:true,
            Id: Id
        });
    }catch(err){
        console.log(err.stack);
        res.status(400).json({
            success:false,
            error: err
        })
    }
}