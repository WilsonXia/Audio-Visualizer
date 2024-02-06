class Sprite{
    constructor(obj = {}){
        this.x = obj.x;
        this.y = obj.y;
        let img = new Image();
        img.src = obj.image;
        this.image = img;
        this.width = obj.width;
        this.height = obj.height; 
        this.rotate = obj.rotate * Math.PI / 180; // In Degrees
        this.scale = 1;
    }

    setScale(x){
        this.scale = x;
    }
    
    draw(ctx){
        // drawImage
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotate * Math.PI / 180);
        ctx.scale(this.scale, this.scale);
        ctx.drawImage(this.image, 0, 0, this.width, this.height);
        ctx.restore();
    }
}