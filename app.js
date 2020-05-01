require('dotenv').config()
var express = require("express"),
	bodyParser = require("body-parser"),
	multer = require("multer"),
	path = require("path"),
	fs = require("fs"),
	PNG = require('pngjs').PNG;

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))
 
app.set("view engine", "ejs");

const storage = multer.diskStorage({
    destination: './public/images/',
    filename: function(req, file, cb){
        cb(null,"raw" + req.body.sender + "to" + req.body.reciever + path.extname(file.originalname).toLowerCase());
    }
});

const upload = multer({
    storage: storage,
    limits:{fileSize: 2000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('myImage');

function checkFileType(file, cb){
    const filetypes = /png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
}

const p = process.env.P, q = process.env.Q, e = process.env.E, d = process.env.D;

const n = p*q, phi = (p-1)*(q-1);

var downloadReady=0, downloadEncPhotoName = "", savedFilePath = "", name="", message = "";

var handleError = (err, res) => {
	res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
};

app.get("/", (req, res)=>{
	res.render("homeOptions");
});

app.get("/enc", (req, res)=>{
	res.render("encrypt");
});

app.get("/dec", (req, res)=>{
	res.render("decrypt", {messageShow: message});
});

app.post("/enc",(req, res) => {
    upload(req, res, (err)=>{
        if(err){
            res.render("encrypt", {msg: err});
        }else if(req.file == undefined){
            res.render("encrypt", {
                msg:"Please select a file"
            });
        }
        else{
            var msg = req.body.message;
            var len = msg.length;
            downloadEncPhotoName = path.join(__dirname, '/public/images/enc'+req.body.sender+"to"+req.body.reciever+path.extname(req.file.originalname).toLowerCase());
        	fs.createReadStream(req.file.path).pipe(new PNG()).on('parsed', function() {
			    for (var x = 0; x < len; x++) {
                    var idx = x << 2;
			        enc = modPow(msg.charCodeAt(x), e, n);
			        this.data[idx] = enc;
			    }
			    lenIndex = (this.height-1)<<2;
			    this.data[lenIndex] = len;
			    this.pack().pipe(fs.createWriteStream(downloadEncPhotoName));
			});
            // fs.unlink(req.bo);
            res.render("encrypt",{                
                msg: "File uploaded successfully",
                downloadReady: 1,
                d:d
            });
        }
    });
});

app.post("/dec",(req, res) => {

    upload(req, res, (err)=>{
        if(err){
            res.render("decrypt", {msg: err});
        }else if(req.file == undefined){
            res.render("decrypt", {
                msg:"Please select a file"
            });
        }
        else{
            var decodedMsg = "", dec;
            const decFileName = path.join(__dirname, "/public/images/decImage"+path.extname(req.file.originalname).toLowerCase());
            // console.log(req.file);
            const d = parseInt(req.body.key);
            fs.rename(req.file.path, decFileName, (err)=>{
                if(err) console.log(err);
                else{
                    fs.createReadStream(decFileName).pipe(new PNG()).on('parsed', function() {
                        len = this.data[(this.height-1)<<2];
                        // console.log("Length recieved from: "+((this.height-1)<<2))
                        for (var x = 0; x < len; x++) {
                            idx = x << 2;
                            dec = modPow(this.data[idx], d, n);
                            decodedMsg += String.fromCharCode(dec);
                        }
                        fs.unlink(decFileName, ()=>{
                            if(err){
                                console.log(err);
                            }else{
                                console.log("Decoded message: "+decodedMsg);
                                res.render("decrypt", {messageShow: decodedMsg});
                            }
                        });
                    });
                    
                }
                
            });
        	
        }
    });
});

app.get("/download", (req, res)=>{
    res.download(downloadEncPhotoName, (err)=>{
        if(err){
            console.log(err);
        }else{
            fs.unlink(downloadEncPhotoName,(err)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("the file is deleted");
                }
            });
        }
    });
    
});

function modPow(a,n,m){
    if(n==0){
        return 1;
    }else if(n==1){
        return a;
    }else{
        if (n%2==0){
            return modPow(Math.pow(a,2)%m,n/2,m)%m;
        }else{
            return a*(modPow(Math.pow(a,2)%m,Math.floor(n/2),m)%m)%m;
        }
    }
}

app.listen(3000, function(){
	console.log("Server started!")
});