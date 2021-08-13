#!/usr/bin/python3
from tkinter import *
from tkinter import filedialog
import chrlib as CHR
import pickle as pick

#chr_file = "data/mario.chr"
tile = []
buffer = []
pixel_width = 5
filename = 'neschr.cfg'

colors = ('#7C7C7C','#0000FC','#0000BC','#4428BC','#940084','#A80020','#A81000','#881400','#503000','#007800','#006800','#005800','#004058','#000000','#000000','#000000',
          '#BCBCBC','#0078F8','#0058F8','#6844FC','#D800CC','#E40058','#F83800','#E45C10','#AC7C00','#00B800','#00A800','#00A844','#008888','#000000','#000000','#000000',
          '#F8F8F8','#3CBCFC','#6888FC','#9878F8','#F878F8','#F85898','#F87858','#FCA044','#F8B800','#B8F818','#58D854','#58F898','#00E8D8','#787878','#000000','#000000',
          '#FCFCFC','#A4E4FC','#B8B8F8','#D8B8F8','#F8B8F8','#F8A4C0','#F0D0B0','#FCE0A8','#F8D878','#D8F878','#B8F8B8','#B8F8D8','#00FCFC','#F8D8F8','#000000','#000000')

used_color = [13,23,5,8,4,5,6,7,8,9,10,11,12,13,14,15]
select_color = [0,0,20]  #For palette screen, [0] -> Color clicked, [1] -> cursor 1 in X position, [2] -> cursor 2 in X position

class Screen:
    def __init__(self,raiz):
        self.canvas = Canvas(raiz, width=640, height=640, bg='white')
        self.canvas.bind('<1>', self.click)
        self.canvas.pack(side=LEFT)

    def draw_tile(self,tile, lin=0, col=0, pixel_width = 5, palette = select_color[1]):
        cor = [colors[used_color[palette*4]],colors[used_color[palette*4+1]],colors[used_color[palette*4+2]],colors[used_color[palette*4+3]] ]
        pos = [col * 8,lin * 8]

        ret=self.canvas.create_rectangle
        for x in range(8):
            for y in range(8):
                ret(pos[0], pos[1], pos[0]+pixel_width, pos[1]+pixel_width, fill=cor[tile[x][y]])
                pos[0] += pixel_width

            pos[0] = col * 8
            pos[1] += pixel_width

    def grid(self,show=True,size=5,color='white'):
        if show:
            x = size * 8
            for i in range(16):
                self.canvas.create_line(x,0, x, size*128, fill=color, tag='linha')
                x += (size*8)
            y = size * 8
            for i in range(16):
                self.canvas.create_line(0,y, size*128, y, fill=color,tag='coluna' )
                y += (size*8)
    def click(self,event):
        x = (self.canvas.winfo_pointerx() - self.canvas.winfo_rootx())//40 # get horizontal pixel click
        y = (self.canvas.winfo_pointery() - self.canvas.winfo_rooty())//40 # get vertical pixel click

        print('click', x, y, buffer[y*16+ x])
        self.draw_tile(buffer[y*16+ x],12,10)


class Palette:
    def __init__(self, raiz):
        self.canvas = Canvas(raiz, width=500, height=200, bg='white')
        self.canvas.bind('<1>', self.click)
        self.canvas.pack()
        self.btnApply = Button(raiz, text='Apply')
        self.btnApply.bind('<Button-1>', self.apply)
        self.btnApply.pack()
        self.show_colors()
        self.show_palette()
        self.cursor()
        self.pointer()


    def apply(self, event):
        print( 'apply ->')
        reload_image()


    def show_colors(self):
        width = 30  # Largura e altura do quadrado da cor
        ret = self.canvas.create_rectangle
        multiply = 0
        row = 0
        padx = 10
        for i in range(64):
            ret(padx + multiply*width,row,padx + (multiply+1)*width,row + width,  fill=colors[i])
            multiply += 1
            if multiply >15:
                multiply = 0
                row += width

    def show_palette(self):
        width = 30  # Largura e altura do quadrado da cor
        ret = self.canvas.create_rectangle
        x=0
        i=0
        while x < 16:
            if x%4 == 0:
                i += 5
            ret(i,150 , i+width, 150+width, fill=colors[used_color[x]])
            i += width
            x += 1

    def click(self, event):
        global select_color
        global used_color

        _x = self.canvas.winfo_pointerx() - self.canvas.winfo_rootx() # get horizontal pixel click
        _y = self.canvas.winfo_pointery() - self.canvas.winfo_rooty() # get vertical pixel click

        y = _y//30

        if(y == 5): # Choose pallete position
            offset= 5 * (_x//125 + 1)
            x = (_x - offset)//30
            select_color[2] = offset + x*30 + 15
            self.cursor(x=offset + x*30 + 15)
            used_color[x] = select_color[0]
            self.show_palette()

        elif(y < 4): # Choose color
            offset = 10
            x = (_x - offset)//30
            select_color[0] = x + (y%4)* 16
            self.pointer(y*30 + 15, x*30 + 25)
        elif(y == 4):
            x= -1
            select_color[1] = _x//125
            self.cursor()
        else:
            x = -1

    def cursor(self, x=20, y=190):
        self.canvas.delete('seta')
        self.seta1 = self.canvas.create_text(select_color[2],y, text='⬆', font=('Arial','15','bold'), tag='seta')
        self.seta2 = self.canvas.create_text(select_color[1]*125+65,140, text='⬇', font=('Arial','15','bold'), tag='seta')

    def pointer(self,row=15,col=25):
        self.canvas.delete('cursor')
        self.point = self.canvas.create_text(col, row, text='o', font=('Arial', '20', 'bold'), tag='cursor', fill='white')
        self.point = self.canvas.create_text(col, row, text='o', font=('Arial', '15', 'bold'), tag='cursor', fill='black')

class SpritesSheet:
    def __init__(self, raiz):
        self.canvas = Canvas(raiz, width=500, height=400, bg='black')
        self.canvas.bind('<1>', self.click)
        self.canvas.pack()
    def click(self, event):
        print('spritesheet click')

def reload_image():
    row, col = 0, 0
    for x in buffer:
        tela.draw_tile(x, lin=row * pixel_width, col=col * pixel_width, palette = select_color[1])
        col += 1
        if (col == 16):
            col = 0
            row += 1

def save_project(new_file): # guarda um projeto
    global used_color, select_color, buffer, filename
    if new_file:
        filename = filedialog.asksaveasfilename(title="Save your NES Image Project",
                                              filetypes=(('NES Image Project', '*.nip'), ('all files', '*.*')))
        root.title('Open NES CHR' + filename)
    try:
        file_cfg = open(filename,"wb")
        pick.dump(used_color, file_cfg)
        pick.dump(select_color, file_cfg)
        pick.dump(buffer, file_cfg)
        file_cfg.close()
    except IOError:
        print('erro!!!!')

def load_project(): # guarda um projeto
    global used_color, select_color, buffer, filename
    filename = filedialog.askopenfilename(title="Choose your NES Image Project",
                                            filetypes=(('NES Image Project', '*.nip'), ('all files', '*.*')))
    root.title('Open NES CHR' + filename)
    try:
        file_cfg = open(filename,"rb")
        used_color = pick.load(file_cfg)
        select_color = pick.load(file_cfg)
        buffer = pick.load(file_cfg)
        reload_image()

    except IOError:
        print('erro!!!!')


def get_tile(tile): # Recebe um tile de 16 bytes e converte num array 8x8 de 4 cores
    rows = []
    for y in range(8):
        byte_1 = '{0:0>8}'.format(bin(tile[y])[2:])
        byte_2 = '{0:0>8}'.format(bin(tile[y + 8])[2:])
        cols = []
        for x in range(8):
            cols.append(int(byte_1[x] + byte_2[x], 2))
        rows.append(cols)
    return rows

def abrir():
    try:
        global buffer
        buffer.clear()
        chr_file = filedialog.askopenfilename(title="Choose you CHR file",
                                              filetypes=(('CHR file', '*.chr'), ('all files', '*.*')))
        root.title('Open NES CHR - ' + chr_file)
        buffer =  CHR.open_chr(chr_file)
        reload_image()
    except:
        print('Canceled by user!')

def novo():
    global buffer
    buffer.clear()
    buffer = CHR.new_chr()
    reload_image()

def create_menu(root):
    menubar = Menu(root)
    grid = IntVar()

    def showgrid():
        if grid.get():
            tela.grid()
        else:
            tela.canvas.delete('linha', 'coluna')

    def showpalette():
        x = root.winfo_x()+root.winfo_reqwidth() + 5
        y = root.winfo_y() - 50
        frmPalette = Tk()
        frmPalette.title('Choose your Palette!')
        frmPalette.geometry('%dx%d+%d+%d' % (500, 220, x, y))
        palheta = Palette(frmPalette)
        frmPalette.mainloop()

    def showeditcanvas():
        x = root.winfo_x()+root.winfo_reqwidth() + 5
        y = root.winfo_y() + 180
        frmEdit = Tk()
        frmEdit.title('Make your Nes Images Here!')
        frmEdit.geometry('%dx%d+%d+%d' % (500, 440, x , y))
        mycanvas = SpritesSheet(frmEdit)
        frmEdit.mainloop()

    sair = lambda: exit()
    save_over = lambda: save_project(False)
    save_as = lambda: save_project(True)

    root.config(menu=menubar)
    filemenu = Menu(menubar, tearoff=0)
    tollmenu = Menu(menubar)
    menubar.add_cascade(label='Files', menu=filemenu)
    filemenu.add_command(label='New', command=novo)
    filemenu.add_command(label='Open CHR', command=abrir)
    filemenu.add_command(label='Export CHR')
    filemenu.add_separator()
    filemenu.add_command(label='Load Project', command=load_project)
    filemenu.add_command(label='Save Project', command=save_over)
    filemenu.add_command(label='Save Project as...', command=save_as)
    filemenu.add_separator()
    filemenu.add_command(label='Exit', command=sair)
    menubar.add_cascade(label='Tolls', menu=tollmenu)
    tollmenu.add_checkbutton(label='Show Grid', variable=grid, onvalue=1, offvalue=0, command=showgrid)
    tollmenu.add_command(label='Palette', command=showpalette)
    tollmenu.add_command(label='Sprite Sheet', command=showeditcanvas)

                    ########################## MAIN PROGRAM ########################

root=Tk()
root.title('Open NES CHR')
root.geometry('%dx%d+%d+%d' % (640, 640, 150, 150))

create_menu(root)

tela = Screen(root)
root.mainloop()