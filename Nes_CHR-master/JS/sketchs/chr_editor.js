let screen = [1200,800];
let header = 200;
let grid = 34;
let grid_size = [32,16]
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
let bank_size = 15;

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
    btnSave.mousePressed(generator);

//    sld_tool = createSlider(0, 1, 0);
//    sld_tool.position(110, 90);
    cmbTool = createSelect();
    cmbTool.position(120, 90);
    cmbTool.option('BRUSH');
    cmbTool.option('POINT');
    cmbTool.option('LINE');
    cmbTool.option('FILL');
    cmbTool.option('COPY');
    cmbTool.option('TURN');
    cmbTool.option('PASTE');

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
    sld_Z = createSlider(4, 40, grid);
    sld_Z.position(560, 60);

    input = createFileInput(open_file);
    input.position(25, 75);

    edtName = createInput();
    edtName.position(800, 50);
    edtName.elt.value = "object_name";
    edtName.size(170);
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

    edtRGB = createInput();
    edtRGB.position(270, 90);
    edtRGB.size(120);
    edtRGB.elt.value = sld_R.value()+","+sld_G.value()+","+sld_B.value();
    edtRGB.changed(apply_color);

    btnFlipX = createButton('Flip X');
    btnFlipX.position(400, 90);
    btnFlipX.mousePressed(flip_x);
    btnFlipY = createButton('Flip Y');
    btnFlipY.position(500, 90);
    btnFlipY.mousePressed(flip_y);
    btnUnod = createButton('Undo');
    btnUnod.position(600, 90);
    btnUnod.mousePressed(restore_undo);

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
            my_draw[x][y] = color;
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


    if(tool == "TURN"){
      if(copy_mem.length > 0 ) {
        if(confirm('Deseja girar 90 graus a direita o desenho da memoria?')){
          let new_mem = [];
          for(let i=0; i<copy_mem[0].length; i++){
            new_mem.push([]);
            for(let j=0; j<copy_mem.length; j++){
              new_mem[i].push(copy_mem[j][i]);
            }
            
          }
          copy_mem = new_mem;
          cmbTool.selected("PASTE");        
        }else{
          cmbTool.selected("BRUSH");        
        }
      }else{
        alert("Você não possui nenhum desenho copiado na memoria")
        cmbTool.selected("COPY");
      }
    }

    bank();

}

function mousePressed() { // only once on click
  if(mouseY > header && mouseX < grid * grid_size[0] + grid && mouseX > grid && mouseButton === LEFT){
    add_undo();      
    let x = Math.floor( (mouseX - grid) / grid);
    let y = grid_size[1] - 1 - (Math.floor((mouseY - header) / grid));

    if(mouseButton === LEFT){
      if(tool == "POINT"){
        my_draw[x][y] = color;
        cp_click = false;
      }else if(tool == "FILL"){
        let old_col = [ my_draw[x][y][0],my_draw[x][y][1],my_draw[x][y][2] ];
        fill_color(x,y,color, old_col);
        cp_click = false;
      }else if(tool == "COPY"){
        if(!cp_click){
          copy[0] = [x,y];
          cp_click = true;
        }else{
          copy[1] = [x,y];
          cp_click = false;
          alert("copy square: "+copy);
          cmbTool.selected("PASTE");
          let x1 = copy[0][0];
          let x2 = copy[1][0];
          if(copy[0][0] > copy[1][0]){
            x1 = copy[1][0];
            x2 = copy[0][0];
          }
          let y1 = copy[0][1];
          let y2 = copy[1][1];
          if(copy[0][1] > copy[1][1]){
            y1 = copy[1][1];
            y2 = copy[0][1];
          }
          copy_mem = [];
          for(let x=x1; x<=x2; x++){
            let copy_line = my_draw[x].slice();
            copy_mem.push([]);
            for(let y=y1; y<=y2; y++){
              copy_mem[copy_mem.length-1].push(copy_line[y])
            }
          }
        }
      }else if(tool == "PASTE"){    
        cp_click = false;
        if(x>=0 && x< grid_size[0] && y>=0 && y< grid_size[1])
          for(let y1=0; y1<copy_mem.length; y1++){
            let copy_line = copy_mem[y1].slice();
            for(let x1=0; x1<copy_line.length; x1++){
              let offset_y = y+x1 - copy_line.length +1;
              let offset_x =  x+y1;
              if(offset_x >= 0 && offset_x < grid_size[0] && offset_y >= 0 && offset_y < grid_size[1] && !comp_colors(bg_color,copy_line[x1])){                              
                my_draw[offset_x][offset_y] = copy_line[x1] 
              }
            }
          }
      }else if(tool == "LINE"){
        if(!cp_click){
          copy[0] = [x,y];
          cp_click = true;
        }else{
          cp_click = false;
          copy[1] = [x,y];
          draw_line();
        }
      }
    }    
  }else{

    if(mouseY >= 130 && mouseY <= 180){

      for(let i=0; i<bank_color.length; i++){
        if(mouseX  >= 60*i+20 && mouseX < 60*i+70){

          sld_R.elt.value = bank_color[i][0];
          sld_G.elt.value = bank_color[i][1];
          sld_B.elt.value = bank_color[i][2];

          update_color();

          bank_sel = i;
        }
      }

    }




  }
}

function draw_header(){ // monta o cabeçalho com as ferramentas
    const r = sld_R.value();
    const g = sld_G.value();
    const b = sld_B.value();
    const rgb = edtRGB.value();

    color = [r,g,b];
    grid = sld_Z.value();


    fill(0, 102, 153);
    noStroke();
    text('R', 240, 17);
    text('G', 240, 42);
    text('B', 240, 67);
    text("COLOR", 110, 75);
    text("BCKGD", 175, 75);

    text("GRID X "+sld_X.value(), 460, 17);
    text("GRID Y "+sld_Y.value(), 460, 42);
    text("ZOOM "+sld_Z.value(), 460, 67);
    text("Open:", 735, 32);
    text("Name:", 735, 65);
    text("Pivot:", 735, 105);
    fill(color)
    stroke(150);
    rect(110,10, 55,45)
    fill(bg_color)
    rect(175,10, 55,45)
    tool = cmbTool.value();

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
//    text(i, grid +grid/5 + (i*grid), (header+grid_size[1]*grid) + grid );
    text(HEXA[index_i], grid +grid/5 + (i*grid), (header+grid_size[1]*grid) + grid );
    for(let j=0; j<grid_size[1];j++){
      fill(0, 102, 153);
      noStroke();
      let index_j = j;
      while(index_j > 15){
        index_j -= 16;
      }
//      text("  "+(grid_size[1] - j-1), 0, (header+j*grid) + 1.2*grid/2);
      text('  '+HEXA[index_j], 0, (header+j*grid) + 1.2*grid/2);

      stroke(150);

        fill(my_draw[i][grid_size[1]- 1 - j]); // inverte o eixo Y
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

    let x = screen[0];
    let y = screen[1];

    if(sld_X.value() > 33){
      x += (sld_X.value() - 33) * grid;
    }

    if(sld_Y.value() > 19){
      y += (sld_Y.value() - 17) * grid;
    }

    resizeCanvas(x, y);

    undo = [];
    my_draw = [];
    color = [0,0,0];
    bg_color = [0,0,0];
    grid_size = [sld_X.value(),sld_Y.value()];
    for(let i=0; i<grid_size[0]; i++){ // create grid array
      my_draw.push([]);
      for(let j=0; j<grid_size[1];j++){
          my_draw[i].push(color);
      }
    }
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
//      console.log(bin[5])   // ascii
//      console.log(bin[5].charCodeAt(0));    // decimal
//      console.log(bin[5].charCodeAt(0).toString(2).padStart(8,0)); //binary
//      console.log(bin[5].charCodeAt(0).toString(16));   //hexa

      let i=0;
      while(bin[i] != '\n'){
        if(i>1000){
          break;
        }

        console.log(bin[i].charCodeAt(0).toString(2).padStart(8,0)); //binary    

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
  for(let i=0;i<N.length;i++){
      let color = N[i].color;
      for(let j=0; j<N[i].data.length; j++){
          let x = N[i].data[j][0] + of_x;
          let y = N[i].data[j][1] + of_y;

          if(N[i].data[j].length > 2){
            let x2 =  N[i].data[j][2];
            for(let k=0;k<x2;k++){
              my_draw[x+k][y] = color;
            }
          }else{
            my_draw[x][y] = color;
          }
      }
  }
}


function Blank_obj(x,y,name){
  this[name] =  new Object();
  this[name].x = x;
  this[name].y = y;
  this[name].pivot_x = pivot[0];
  this[name].pivot_y = pivot[1];
  this[name].dots = []
  this[name].lines = []
}

function Data_obj(color){
  this.color = color;
  this.data = [];
}

Data_obj.prototype.add = function(data){
  this.data.push(data);
}

function generator(){ // gera o JSON dos sprites
  let last_x;
  let last_color;
  let colors = [];
  let dots = [];
  let lines = [];
  let json_file = new Blank_obj(grid_size[0],grid_size[1],edtName.elt.value);

  for(let y=0; y<my_draw[0].length ; y++){
    last_x = 0;
    last_color = my_draw[0][y];
    for(let x=0; x<my_draw.length;x++){
      if( !comp_colors(last_color,my_draw[x][y]) ){
        add_points(x,y,last_x,last_color,colors,dots,lines);
        last_x = x;
        last_color = my_draw[x][y];
      }

    }
    add_points(my_draw.length,y,last_x,last_color,colors,dots,lines);

  }
  let index = find_color(bg_color,colors);
  if(index >= 0 ){
    dots.splice(index,1);
    lines.splice(index,1);
  }

  json_file[edtName.elt.value].dots = dots;
  json_file[edtName.elt.value].lines = lines;
  json_output = JSON.stringify(json_file);
  alert(json_output);
  console.log ("json:"+json_output);
  saveJSON(json_output, edtName.elt.value+'.json');

}

function add_points(x,y,last_x,last_color,colors,dots,lines){ // adiciona os pontos nos vetores
  let index = find_color(last_color,colors);
  if(index == -1 ){
    colors.push(last_color)
    dots.push(new Data_obj(last_color))
    lines.push(new Data_obj(last_color))
    index = colors.length - 1; // aponta p/ ultimo registro
  }


  let offset_x = last_x;
  let offset_y = y;

  if(pivot[0] == 1 ){
    offset_x -= Math.ceil(grid_size[0] / 2);
  }else if(pivot[0] == 2){
    offset_x -= grid_size[0];
  }

  if(pivot[1] == 1 ){
    offset_y = y - Math.ceil(grid_size[1] / 2);
  }else if(pivot[1] == 2){
    offset_y = y - grid_size[1];
  }



  // muda o pivot pro centro do sprite


  if(x - last_x == 1 ){
    dots[index].data.push([offset_x,offset_y]);
//    dots[index].data.push([last_x,y]);
  }else{
    lines[index].data.push([offset_x,offset_y,x - last_x,1]);
//    lines[index].data.push([last_x,y,x - last_x,1]);
  }
}

function find_color(col, obj){ // verifica se esta cor já apareceu antes, se sim retorna o indice
  for(let i=0; i< obj.length;i++){
    if(comp_colors(obj[i],col)){
      return i;
    }
  }
  return -1;
}

function comp_colors(C1,C2){ // compara duas cores
  if(C1[0] == C2[0] && C1[1] == C2[1] && C1[2] == C2[2] ){
    return true;
  }else{
    return false;
  }
}

function fill_color(x,y,new_col, old_col){ // pinta uma área
  if(comp_colors(my_draw[x][y],old_col) && !comp_colors(new_col,old_col)){
    my_draw[x][y] = [new_col[0],new_col[1],new_col[2]];

    // Verifica os vizinhos
    if(x > 0){
      if( comp_colors(my_draw[x-1][y][0], old_col[0]) ){
        fill_color(x-1,y,new_col, old_col);
      }
    }

    if(x < my_draw.length -1){
      if( comp_colors(my_draw[x+1][y][0], old_col[0]) ){
        fill_color(x+1,y,new_col, old_col);
      }
    }

    if(y > 0){
      if( comp_colors(my_draw[x][y-1][0], old_col[0]) ){
        fill_color(x,y-1,new_col, old_col);
      }
    }

    if(y < my_draw[0].length -1){
      if( comp_colors(my_draw[x][y+1][0], old_col[0]) ){
        fill_color(x,y+1,new_col, old_col);
      }
    }

  }
}

function flip_x(){
  add_undo();
  let copy_draw = my_draw.slice();
  for(let x=0; x<my_draw.length ; x++){
    my_draw[x] = copy_draw[my_draw.length - 1 - x];
  }
}

function flip_y(){
  add_undo();
  for(let x=0; x<my_draw.length ; x++){
    let copy_line = my_draw[x].slice();
    for(let y=0; y<copy_line.length ; y++){
      my_draw[x][y] = copy_line[copy_line.length - 1 - y];
    }
  }
}

function apply_color(){

    let rgb = edtRGB.value();
    rgb = rgb.split(",");

    if(rgb.length == 3){
      sld_R.elt.value = rgb[0];
      sld_G.elt.value = rgb[1];
      sld_B.elt.value = rgb[2];
    }else if(rgb.length == 1){
      sld_R.elt.value = rgb[0];
      sld_G.elt.value = rgb[0];
      sld_B.elt.value = rgb[0];
    }

  bank_color[bank_sel] = [sld_R.value(),sld_G.value(),sld_B.value()];
  bank_sel++;
  if(bank_sel == bank_color.length){
    bank_sel = 0;
  }

}

function update_color(){
  edtRGB.elt.value = sld_R.value()+","+sld_G.value()+","+sld_B.value();
}

function add_undo(){
//  if(my_draw.length > 0){
    let copy_draw =[];
    for(let x=0; x<my_draw.length ; x++){
      copy_draw.push([])
      let copy_line = my_draw[x].slice();
      for(let y=0; y<copy_line.length ; y++){
        copy_draw[x].push(copy_line[y]);
      }
    }
    undo.push(copy_draw);
    if(undo.length > 15){
      undo.splice(0,1);
    }
//  }
}

function restore_undo(){
//  alert(undo.length)
  if(undo.length > 0){
    let copy_draw = undo[undo.length-1].slice();
    my_draw = copy_draw;
    undo.splice(undo.length-1,1);
  }
}

function change_pivot(){
  if(cmbPivot.value() == "X Left   | Y Top"){
    pivot = [0,2];
  }else if(cmbPivot.value() == "X Center | Y Top"){
    pivot = [1,2];
  }else if(cmbPivot.value() == "X Rigth  | Y Top"){
    pivot = [2,2];
  }else if(cmbPivot.value() == "X Left   | Y Center"){
    pivot = [0,1];
  }else if(cmbPivot.value() == "X Center | Y Center"){
    pivot = [1,1];
  }else if(cmbPivot.value() == "X Rigth  | Y Center"){
    pivot = [2,1];
  }else if(cmbPivot.value() == "X Left   | Y Botton"){
    pivot = [0,0];
  }else if(cmbPivot.value() == "X Center | Y Botton"){
    pivot = [1,0];
  }else if(cmbPivot.value() == "X Rigth  | Y Botton"){
    pivot = [2,0];
  }
}

function restore_pivot(){

  let opt = [[ "X Left   | Y Botton","X Center | Y Botton","X Rigth  | Y Botton"],
              ["X Left   | Y Center","X Center | Y Center","X Rigth  | Y Center"],
              ["X Left   | Y Top",   "X Center | Y Top",   "X Rigth  | Y Top"]];

  cmbPivot.selected(opt[pivot[0]][pivot[1]]);

}

function draw_line(){
  let line = [];

  let x1 = copy[0][0];
  let x2 = copy[1][0];
  let y1 = copy[0][1];
  let y2 = copy[1][1];

  if(x1 > x2){ // x1 sempre menor q x2
    x1 = copy[1][0];
    x2 = copy[0][0];
    y1 = copy[1][1];
    y2 = copy[0][1];
  }

  let sy = 1; // y sobe ou desce
  if(y2 < y1){
    sy = -1;
  }  

  let offset_x = 0;
  if(y2 == y1){
    offset_x = x2-x1;
  }else if(x2 == x1){
    offset_x = 0;
  }else{
    offset_x = (x2 - x1) / Math.abs(y2-y1) ;
  }

  let in_x = offset_x;
//  my_draw[x1][y1] = color;

  while( x1 != x2 || y1 != y2) {

    my_draw[x1][y1] = color;
//    alert([x1,y1]);

    if(x1 < Math.floor(x1+in_x)){
      x1++;
      in_x--;
    }else{
      y1 += sy;
      in_x += offset_x
    }

  }

  my_draw[x2][y2] = color;
  
}

function bank(){

  for(let i=0; i<bank_color.length; i++){
  
    if(i == bank_sel){
      fill(0);
    rect(60*i + 15,125,60,60);      
    }    
    fill(bank_color[i]);    
    rect(60*i + 20,130,50,50);
  }

}