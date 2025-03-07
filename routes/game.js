var express = require("express");
var fs = require("fs");
var path = require("path");
var router = express.Router();

var db = {};
async function getGame(id){
    if(db[id]) return db[id];
    else {
        try{
            var con = await fs.promises.readFile(path.join(__dirname, "..", "games", String(parseInt(id))+".json"));
            var jn = JSON.parse(con);
            db[id] = jn;
            return jn;
        }catch(e){
            return null;
        }
    }
}

function rndchoose(arr){
    return arr[Math.floor(Math.random() * (arr.length - 1)) + 1];
}

router.get("/choose/:id", async function (req, res, next) {
    if(req.session.cur){
        var json = await getGame(req.session.cur);
        if(json){
            if(!req.session.lv) req.session.lv = 0;
            var id = req.session.lv;
            var toc = req.params.id;
            if(json[id]){
                var togo = json[id][1];
                if(Array.isArray(togo)){
                    var goes = togo[toc];
                    if(goes){
                        var toid = rndchoose(goes);
                        req.session.lv = toid;
                        res.json({status: 200, msg: "选择成功！"});
                    }else{
                        res.json({status: 404, msg: "按钮不存在"});
                    }
                }else{
                    res.json({status: 404, msg: "没有按钮了"});
                }
            }else{
                res.json({status: 404, msg: "页面不存在"});
            }
        }else{
            res.json({status: 404, msg: "关卡不存在"});
        }
    }else{
        res.json({status: 404, msg: "未开启游戏"});
    }
});

router.get("/", async function(req, res, next){
    if(req.session.cur){
        var json = await getGame(req.session.cur);
        if(json){
            if(!req.session.lv) req.session.lv = 0;
            var id = req.session.lv;
            if(json[id]){
                res.render("game", {arr: json[id]});
            }else{
                res.json({status: 404, msg: "页面不存在"});
            }
        }else{
            res.json({status: 404, msg: "关卡不存在"});
        }
    }else{
        res.render("nogame");
    }
});
router.get("/play/:id", async function(req, res, next){
    if(await getGame(req.params.id)){
        req.session.cur = req.params.id;
        res.redirect("/game/");
    }else{
        res.send("游戏不存在");
    }
});
router.get("/out", function(req, res, next){
    try{
        delete req.session.cur;
        delete req.session.lv;
        res.json({status: 200, msg: "退出成功！"});
    }catch(e){
        res.json({status: 404, msg: "未开启游戏"});
    }
});

module.exports = router;
