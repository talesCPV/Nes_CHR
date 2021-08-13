#!/usr/bin/python3

chr_file = "data/mario.chr"
tile = []

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

def open_chr(path):
    try:
        resp = []
        buff = []
        count = 0
        f = open(path, "rb")
        for byt in f:
            for i in byt:
                buff.append(i)
                count += 1
                if count > 15:
                    count = 0
                    tl= get_tile(buff)
                    buff.clear()
                    resp.append(tl)
        f.close()
        return resp
    except Exception as e:
        print('Error!: {0}'.format(e))

def new_chr(pages=1):
    try:
        resp = []
        buff = [0,0,0,0,0,0,0,0]
        pg = 0
        while pg < pages:
            for i in range(256):
                resp.append([buff] * 8)
            pg += 1
        return resp
    except Exception as e:
        print('Error!: {0}'.format(e))