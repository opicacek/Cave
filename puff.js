function Puff(x, y, small) {
    this.x = x;
    this.y = y;
    
    this.small = small;
    
    this.img = puff_img;
    
    this.speed_x = -1;
    this.speed_y = -1;
};
Puff.prototype.move = function(){
    this.x += this.speed_x - Math.random()*2;
    this.y += this.speed_y - Math.random()*2;
}
Puff.prototype.draw = function(ctx){
    if (this.small) {
        var scale = 0.5;
        ctx.save();
        ctx.scale(scale, scale);
        ctx.drawImage(this.img, (this.x)/scale, (this.y-this.img.height)/scale);
        ctx.restore();
    } else {
        ctx.drawImage(this.img, this.x, this.y);
    }
}