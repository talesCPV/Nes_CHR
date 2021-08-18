let screen = [1200,800];
let header = 200;
let grid = 34;
let grid_size = [16,16]
let my_draw = [];
let color = [0,0,0];
let bg_color = [0,0,0];
let json_output;
let tool = "BRUSH";
let undo = [];
let pivot = [1,1];
let copy = [[0,0],[0,0]];
let copy_mem = [];
let cp_click = false;
let count = 0;
let bank_sel = 0;
let bank_color = [];
let bank_size = 16;
let palette = [[0,0,0],[180,185,0],[200,20,0],[20,140,62],[0,0,0],[180,185,0],[0,20,0],[120,140,62],[0,200,0],[180,185,0],[200,20,0],[20,140,62],[0,0,0],[180,185,0],[200,20,0],[20,140,62]];

let chr = ["00000011","00001111","00011111","00011111","00011100","00100100","00100110","01100110",
           "00000000","00000000","00000000","00000000","00011111","00111111","00111111","01111111",
           "11100000","11000000","10000000","11111100","10000000","11000000","00000000","00100000",
           "00000000","00100000","01100000","00000000","11110000","11111100","11111110","11111110"];


function setup() {
    createCanvas(screen[0], screen[1]);
    frameRate(6)
    textSize(15);
    stroke(255);

    for(let i=0;i<bank_size;i++){
      bank_color.push([0,0,0]);
    }

    btnNew = createButton('New');
    btnNew.position(25, 15);
    btnNew.mousePressed(new_file);
    btnSave = createButton('Save');
    btnSave.position(25, 45);
//    btnSave.mousePressed(generator);

//    sld_tool = createSlider(0, 1, 0);
//    sld_tool.position(110, 90);
/*
    cmbTool = createSelect();
    cmbTool.position(120, 90);
    cmbTool.option('BRUSH');
    cmbTool.option('POINT');
    cmbTool.option('LINE');
    cmbTool.option('FILL');
    cmbTool.option('COPY');
    cmbTool.option('TURN');
    cmbTool.option('PASTE');
*/

/*
    sld_R = createSlider(0, 255, 50);
    sld_R.position(270, 10);
    sld_R.input(update_color);
    sld_G = createSlider(0, 255, 50);
    sld_G.position(270, 35);
    sld_G.input(update_color);
    sld_B = createSlider(0, 255, 50);
    sld_B.position(270, 60);
    sld_B.input(update_color);

    sld_X = createSlider(1, 150, grid_size[0]);
    sld_X.position(560, 10);
    sld_Y = createSlider(1, 150, grid_size[1]);
    sld_Y.position(560, 35);
//    sld_Z = createSlider(4, 40, grid);
//    sld_Z.position(560, 60);
*/
    input = createFileInput(open_file);
    input.position(25, 75);

    edtName = createInput();
    edtName.position(800, 50);
    edtName.elt.value = "object_name";
    edtName.size(170);
/**    
    cmbPivot = createSelect();
    cmbPivot.position(800, 90);
    cmbPivot.option('X Left   | Y Top');
    cmbPivot.option('X Center | Y Top');
    cmbPivot.option('X Rigth  | Y Top');
    cmbPivot.option('X Left   | Y Center');
    cmbPivot.option('X Center | Y Center');
    cmbPivot.option('X Rigth  | Y Center');
    cmbPivot.option('X Left   | Y Botton');
    cmbPivot.option('X Center | Y Botton');
    cmbPivot.option('X Rigth  | Y Botton');
    cmbPivot.selected('X Center | Y Center');
    cmbPivot.changed(change_pivot);
*/
    edtRGB = createInput();
    edtRGB.position(270, 90);
    edtRGB.size(120);
//    edtRGB.elt.value = sld_R.value()+","+sld_G.value()+","+sld_B.value();
//    edtRGB.changed(apply_color);

    btnFlipX = createButton('Flip X');
    btnFlipX.position(400, 90);
//    btnFlipX.mousePressed(flip_x);
    btnFlipY = createButton('Flip Y');
    btnFlipY.position(500, 90);
//    btnFlipY.mousePressed(flip_y);
    btnUnod = createButton('Undo');
    btnUnod.position(600, 90);
//    btnUnod.mousePressed(restore_undo);

    fill(100);
    new_file(0);
}

function draw() {
    background(0, 0, 0);
    draw_header();
    count ++;
    if(count > 1000){
      count = 0;
    }
    if (mouseIsPressed) { // every frame in click
      if(mouseY > header && mouseX < grid * grid_size[0] + grid && mouseX > grid ){
        let x = Math.floor( (mouseX - grid) / grid);
        let y = grid_size[1] - 1 - (Math.floor((mouseY - header) / grid));
        if(mouseButton === LEFT){
          if(tool == "BRUSH"){
//            my_draw[x][y] = color;
            cp_click = false;
          }
        }else if(mouseButton === CENTER && y >= 0){
          sld_R.elt.value = my_draw[x][y][0];
          sld_G.elt.value = my_draw[x][y][1];
          sld_B.elt.value = my_draw[x][y][2];
          update_color();
          
        }
      }else if(mouseX  >= 175 && mouseX <= 230 && mouseY >= 10 && mouseY <= 55){
        bg_color = color;
      }
    }
    draw_grid();


    bank();

}

function mousePressed() { // only once on click

  if(mouseY >= 125 && mouseY <= 170){
    if(mouseX >= 35 && mouseX <= 715){

      bank_sel = Math.floor((mouseX - 35)/170);
//      alert()

    }
  }



}

function draw_header(){ // monta o cabeçalho com as ferramentas

    const rgb = edtRGB.value();

    fill(0, 102, 153);
    noStroke();

    fill(color)
    stroke(150);
    fill(bg_color)

}

function draw_grid(){ // monta desenho na tela
  textSize(grid/2);
  const HEXA = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
  
  for(let i=0; i<grid_size[0]; i++){
    fill(0, 102, 153);
    noStroke();
    let index_i = i;
    while(index_i > 15){
      index_i -= 16;
    }
    text(HEXA[index_i], grid +grid/5 + (i*grid), (header+grid_size[1]*grid) + grid );
    for(let j=0; j<grid_size[1];j++){
      fill(0, 102, 153);
      noStroke();
      let index_j = j;
      while(index_j > 15){
        index_j -= 16;
      }
      text('  '+HEXA[index_j], 0, (header+j*grid) + 1.2*grid/2);

//      if(chr[x] != undefined){

        draw_tile(i,j);

//      }



      stroke(150);

//        fill(my_draw[i][grid_size[1]- 1 - j]); // inverte o eixo Y
        rect((i + 1) * grid,j * grid + header , grid, grid);
    }
  }

  if(cp_click){
    if(count % 4 == 0){
      fill(255);
    }else{
      fill(0);
    }
    rect((copy[0][0] + 1) * grid, (grid_size[1]-copy[0][1]-1) * grid + header , grid, grid);
  }

  textSize(15);

}

function new_file(N){ // novo arquivo => apaga tudo
  if (N==0 || confirm('Deseja apagar todo o desenho??')) {
 
  }  
}

function open_file(files) {

  const file =  files.file;
//  console.log(file)
  const ext = file.name.split('.')[1];
//  console.log(ext)


  if(ext == "chr"){

    var reader = new FileReader();
    reader.readAsBinaryString(file);  
    
    reader.onload = function(e) {
      // binary data
      const bin = e.target.result;
      let i=0;
      chr = [];

      while(bin[i] != '\r\n'){
        if(i>4088){
          break;
        }
        chr.push(bin[i].charCodeAt(0).toString(2).padStart(8,0));
//        console.log(i)
//        console.log(bin[i].charCodeAt(0).toString(2).padStart(8,0)); //binary    

        i++;
      }



      console.log('tamanho da linha: '+i)

    };
  
    reader.onerror = function(e) {
      // error occurred
      console.log('Error : ' + e.type);
    };

  }else{
    alert("This is not a binary CHR file.");
  }

}

function draw_pixel(N,of_x, of_y){

}



function bank(){
  let space = 0;
  const size = 40;

  for(let i=0; i<bank_color.length; i++){
  
    if(i%4 == 0){
      space += size * 0.3;

    }

    if(i == bank_sel){
      fill(0);
    rect(size*i*4.3 + 25 + space - (size*0.1),125,size*4.2,size*1.2);      
    }    
    
    fill(palette[i]);    
    rect(size*i + 25 + space,130,size,size);
  }

}

function draw_tile(i,j){


/*    
  console.log(chr)
  console.log(i,j)
  
  alert(chr[i])
*/  
  for(let t=0; t<8;t++){
    const x = t + i*16 + j*256;
    if(chr[x] != undefined && chr[x+8] != undefined){
      for(let r=0; r<8; r++){
      const y = r;


        if(chr[x][y] == '0'){ 
          if(chr[x+8][y] == '0'){ 
            fill(palette[(bank_sel * 4) + 0]);
          }else{
            fill(palette[(bank_sel * 4) + 1]);
          }
        }else{
          if(chr[x+8][y] == '0'){ 
            fill(palette[(bank_sel * 4) + 2]);
          }else{
            fill(palette[(bank_sel * 4) + 3]);
          }
        }  
        rect(r * (grid/8) + ((i + 1) * grid)  , t * (grid/8) + (j * grid + header) , grid/8, grid/8);
      }

      noFill()

    }
  }

}