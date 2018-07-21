const readline = require('readline');

var io = require('socket.io')();
io.on('connection', (socket)=>{
    console.log("A user has been connected.");
    io.emit("message", "Connected");
    socket.on('start', (data)=>{
        io.emit("message", "Start Cleaning");
        console.log(`Start cleaning at ${data.time}`);
        Robot.getInstance().run();
    })
});

io.listen(8080);
console.log('listening on 8080');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

/* const MAPSTRING = 
"##########\n"+
"#        #\n"+
"####     #\n"+
"#        #\n"+
"####     #\n"+
"#        #\n"+
"##########\n"; */
const MAPSTRING = 
"##############\n"+
"#       ## # #\n"+
"# # # # ## # #\n"+
"# #        # #\n"+
"# # ### ## # #\n"+
"#          # #\n"+
"# # ### ## # #\n"+
"# #        # #\n"+
"# # ##  ## # #\n"+
"#            #\n"+
"##############\n";

class Robot {
    constructor(v, h){
        this.v = v;
        this.h = h;
        console.log("The robot is established at ( vertical: " + v + ", horizental: " +h +")");
        this.clean();
        this.route = new Array();
    }
    static initInstance(v, h){
        if(!this.instance){
            this.instance = new Robot(v, h);
        }
        return this.instance;
    }
    static getInstance(){
        return this.instance;
    }
    getPosition(){
        return [this.v, this.h];
    }
    clean(){
        Map.getInstance().mapCharset[this.v][this.h] = '-';
    }
    showPosition(){
        Map.getInstance().mapCharset[this.v][this.h] = '*';
    }
    moveRight(){
        const max = Map.getInstance().mapCharset[this.v].length-1;
        if(this.h === max){ // Robot is at the very right point
            return false; // Fail to move right
        }
        if( Map.getInstance().mapCharset[this.v][this.h+1] === '#'){
            // Wall to robot's right
            return false; // Fail to move right
        }
        this.h += 1;
        this.clean();
        return true;
    }
    moveLeft(){
        const min = 0
        if(this.h === min){ // Robot is at the very left point
            return false; // Fail to move left
        }
        if( Map.getInstance().mapCharset[this.v][this.h-1] === '#'){
            // Wall to robot's left
            return false; // Fail to move left
        }
        this.h -= 1;
        this.clean();
        return true;
    }
    moveUp(){
        const min = 0
        if(this.v === min){ // Robot is at the very top point
            return false; // Fail to move up
        }
        if( Map.getInstance().mapCharset[this.v-1][this.h] === '#'){
            // Wall to robot's top
            return false; // Fail to move up
        }
        this.v -= 1;
        this.clean();
        return true;
    }
    moveDown(){
        const max = Map.getInstance().mapCharset.length-1;
        if(this.v === max){ // Robot is at the very bottom point
            return false; // Fail to move down
        }
        if( Map.getInstance().mapCharset[this.v+1][this.h] === '#'){
            // Wall to robot's bottom
            return false; // Fail to move down
        }
        this.v += 1;
        this.clean();
        return true;
    }
    isTopWallorEdge(){
        var result = false;
        // if edge
        if(this.v-1 === 0) return true;
        // if is wall
        if(Map.getInstance().mapCharset[this.v-1][this.h] === '#') return true;
        return result;
    }
    isBottomWallorEdge(){
        var result = false;
        // if edge
        if(this.v+1 === Map.getInstance().mapCharset.length) return true;
        // if is wall
        if(Map.getInstance().mapCharset[this.v+1][this.h] === '#') return true;
        return result;
    }
    isLeftWallorEdge(){
        var result = false;
        // if edge
        if(this.h-1 === 0) return true;
        // if is wall
        if(Map.getInstance().mapCharset[this.v][this.h-1] === '#') return true;
        return result;
    }
    isRightWallorEdge(){
        var result = false;
        // if edge
        if(this.h+1 === Map.getInstance().mapCharset[this.v].length) return true;
        // if is wall
        if(Map.getInstance().mapCharset[this.v][this.h+1] === '#') return true;
        return result;
    }
    //if it's edge, return true(clean)
    isTopClean(){
        var result = false;
        // if edge
        if(this.v-1 === 0) return true;
        // if is wall
        if(Map.getInstance().mapCharset[this.v-1][this.h] === '-') return true;
        return result;
    }
    isBottomClean(){
        var result = false;
        // if edge
        if(this.v+1 === Map.getInstance().mapCharset.length) return true;
        // if is wall
        if(Map.getInstance().mapCharset[this.v+1][this.h] === '-') return true;
        return result;
    }
    isLeftClean(){
        var result = false;
        // if edge
        if(this.h-1 === 0) return true;
        // if is wall
        if(Map.getInstance().mapCharset[this.v][this.h-1] === '-') return true;
        return result;
    }
    isRightClean(){
        var result = false;
        // if edge
        if(this.h+1 === Map.getInstance().mapCharset[this.v].length) return true;
        // if is wall
        if(Map.getInstance().mapCharset[this.v][this.h+1] === '-') return true;
        return result;
    }
    run(){
        let startTime = Date.now();
        var interval = setInterval(()=>{
            //6. if everywhere is cleaned, end
            //1. detect top, move if not clean and movable
            //2. detect right, move if not clean and movable
            //3. detect bottom move if not clean and movable
            //4. detect left move if not clean and movable
            //5. backward
            if(Map.getInstance().getNumberOfClean() === Map.getInstance().totalSpace){
                this.clean();
                clearInterval(interval);
                let endTime = Date.now();
                let timeDuration = endTime - startTime;
                console.log("Cleaning task is done.");
                console.log(Map.getInstance().mapCharset);
                io.emit('finish', {
                    timeDuration: timeDuration*0.001,
                    msg: "Task complete."
                })
                return;
            }
            if(!this.isTopWallorEdge() && !this.isTopClean()){
                this.move(1); this.route.push(-1); return;
            }
            if(!this.isRightWallorEdge() && !this.isRightClean()){
                this.move(2); this.route.push(-2); return;
            }
            if(!this.isBottomWallorEdge() && !this.isBottomClean()){
                this.move(-1); this.route.push(1); return;
            }
            if(!this.isLeftWallorEdge() && !this.isLeftClean()){
                this.move(-2); this.route.push(2); return;
            }
            // backward
            this.move(this.route.pop());
            //console.log('move');
        },200);
    }
    
    move(direction){
        console.log('moving...' + direction);
        // 1: top
        // 2: right
        // -1 down
        // -2 left
        switch(direction){
            case 1: 
                this.moveUp();break;
            case 2: 
                this.moveRight();break;
            case -1: 
                this.moveDown();break;
            case -2: 
                this.moveLeft();break;
            default: break;
        }
        //console.log(Map.getInstance().mapCharset);
        console.log("Progress: " + Map.getInstance().getNumberOfClean() + "/" + Map.getInstance().totalSpace);
        io.emit('data refresh', {
            charMap: Map.getInstance().mapCharset,
            position: Robot.getInstance().getPosition(),
            totalSpace: Map.getInstance().totalSpace,
            cleanSpace: Map.getInstance().getNumberOfClean()
        })
    }
}

class Map {
    // Singleton
    constructor(mapstring){
        var charArray = mapstring.split('');
        var buffer = new Array();
        var spaceCount = 0;
        this.mapCharset = new Array();
        charArray.forEach(element => {
            if(element !== '\n'){
                if(element === ' ')
                    spaceCount++;
                buffer.push(element);
            }
            else {
                this.mapCharset.push(buffer);
                buffer = [];
            }
        });
        this.totalSpace = spaceCount;
    }
    static initInstance(mapstring) {
        if(!this.instance) {
            this.instance = new Map(mapstring);
        }
        return this.instance;
    }
    static getInstance() {
        return this.instance;
    }
    getNumberOfClean(){
        var count = 0;
        for(i=0; i<this.mapCharset.length; i++){
            this.mapCharset[i].forEach(element => {
                if(element === '-'){
                    count++;
                }
            });
        }
        return count;
    }
    getElement(v, h){
        return this.mapCharset[v][h];
    }
    cleanElement(v, h) {
        this.mapCharset[v][h] = '-';
    }
}

console.log(MAPSTRING);
// Initialize a map
Map.initInstance(MAPSTRING);
// Initialize a robot in a resonable radom postion;
var i = 0, j = 0;
while ( Map.getInstance().getElement(i, j) !== ' ' ){
    i = Math.floor(Math.random() * (Map.getInstance().mapCharset.length - 0) );
    j = Math.floor(Math.random() * (Map.getInstance().mapCharset[i].length - 0) );
}
Robot.initInstance(i, j);
/* 
rl.question('Press any button to start cleaning.', ()=>{
    Robot.getInstance().run();
}) */

/* Robot.getInstance().run(); */
