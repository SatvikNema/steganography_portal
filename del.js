<<<<<<< HEAD
=======
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
>>>>>>> aee4c81c851b30321c461d1030e24a2df0198d8a
