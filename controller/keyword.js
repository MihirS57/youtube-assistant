const Video = require('../models/video')
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

exports.getVideo = async(req,res,next) => {
    try{
        const vId = req.params.Id;
        const v = await Video.findOne({videoId: vId});
        if(!v){
            return next(res.status(400).json({
                success: true,
                message: "Not Found"
            }))
        }
        res.status(200).json({
            success: true,
            video: v
        });
    }catch(err){
        console.log(err.stack);
        res.status(400)
        .json({
            success: false,
            error: err
        })
    }
}

exports.insertVideo = async (req,res,next) => {
    try{
        const reqId = req.params.Id;
        const video = await Video.create({videoId:reqId,query: [{key: "mihir",count:5}]});
        if(!video){
            return next(res.status(400).json({
                success: true,
                message: "Some error occured please try again later"
            }));
        }
        res.status(200).json({
            success: true,
            message:"Successfully inserted",
            video: video
        });
    }catch(err){
        console.log(err.stack);
        res.status(400)
        .json({
            success: false,
            error: err
        })
    }
}