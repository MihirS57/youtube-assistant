const { listenerCount } = require('../models/video');
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
        var qList = v.query;
        for(var i=0;i<qList.length;i++){
            var k = qList[i].key;
            var c = qList[i].count;
            console.log(k+":"+c);
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

exports.insertKey = async (req,res,next) => {
    try{
        const videoId = req.params.Id;
        const {key} = req.body;
        console.log(key);
        const video = await Video.findOne({videoId:videoId});
        if(!video){
            const videoNew = await Video.create({videoId:videoId,query: [{key: key,count:1}]});
            if(!videoNew){
                return next(res.status(400).json({
                    success: true,
                    message: "Some error occured please try again later"
                }));
            }
            return res.status(200).json({
                success: true,
                message:"Successfully inserted",
                video: videoNew
            });
        }
        var qList = video.query;
        var flag = false;
        var ind = -1;
        for(var i=0;i<qList.length;i++){
            var k = qList[i].key;
            var c = qList[i].count;
            if(k == key){
                qList[i].count = c+1;
                ind = i;
                flag = true;
                break;
            }
        }
        if(!flag){
            qList.push({key: key,count: 1});
            ind = qList.length - 1;
        }
        
        qList = checkAndSort(qList,ind);
        
        const videoUpdated = await Video.findOneAndUpdate(videoId,{query:qList},{
            new: true,
            newValidators: true
        });
        return res.status(200).json({
            success: true,
            message:"Successfully key inserted/updated",
            video: videoUpdated});
    }catch(err){
        console.log(err.stack);
        res.status(400)
        .json({
            success: false,
            error: err
        })
    }
}

function checkAndSort(qList, keyIndex){
    var keyCurr = qList[keyIndex].key;
    var countCurr = qList[keyIndex].count;
    if(keyIndex-1 >= 0){
        var k = keyIndex-1;
        while(k>=0 && countCurr > qList[k].count){
            k=k-1;
        }
        if(k<0){
            qList.splice(keyIndex,1);
            qList.splice(0,0,{"key":keyCurr,"count":countCurr});
            console.log(qList[0])
        }else if(!(countCurr > qList[k].count)){
            qList.splice(keyIndex,1);
            qList.splice(k+1,0,{"key":keyCurr,"count":countCurr});
            console.log(qList[k+1]);
        }
    }
    
    return qList;
}