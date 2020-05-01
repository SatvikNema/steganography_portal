const fs = require("fs");
downloadEncPhotoName = "C:\webDevelopment\justStegFront\public\images\encSatviktoKartik.png";

fs.unlink(downloadEncPhotoName,(err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("deleted!!");
    }
});

//testing the pull command
