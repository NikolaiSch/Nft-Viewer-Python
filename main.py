from tkinter import *
from tkinter import ttk
from PIL import ImageTk, Image
import os
import random
from time import time
import json

root = Tk()

frame = ttk.Frame(root, padding=10)
style = ttk.Style()
frame.grid()

os.mkdir("./export")
d = r"./assets"
dl = [os.path.join(d, o) for o in os.listdir(d) if os.path.isdir(os.path.join(d, o))]
l = []
dic = {}

for i in dl:
    l.append(i.split("\\")[-1])


for i in l:
    d = "./assets" + f"/{i}"
    dl = [
        os.path.join(d, o)
        for o in os.listdir(d)
        if not os.path.isdir(os.path.join(d, o))
    ]
    dic[i] = []
    for a in dl:
        dic[i].append(a.replace("\\", "/"))

art_dict = {}


def random_art():
    for i in l:
        art_dict[i] = random.choice(dic[i])
    return art_dict


z = random_art()

count = 1


def render_stats():
    count = 1
    for i in l:
        ttk.Label(frame, text=i).grid(column=0, row=count)
        ttk.Label(frame, text=art_dict[i].split("/")[-1]).grid(column=1, row=count)
        count += 1


x = 0
out = 1


def save():
    t = str(time()).split(".")[0]
    os.mkdir(f"./export/{t}")
    img.save(f"./export/{t}/img.png")
    d = json.dumps(art_dict)
    with open(f"./export/{t}/img.json", "w+") as f:
        f.write(d)


def randomise():
    random_art()
    for widgets in frame.winfo_children():
        widgets.destroy()
    render_stats()
    ttk.Button(frame, command=randomise, padding=20, width=20, text="Randomise!").grid(
        column=0, row=0
    )
    ttk.Button(frame, command=save, padding=20, width=20, text="Save!").grid(
        column=1, row=0
    )
    x = Image.open("assets/blank.png")
    for i in l:
        a = Image.open(art_dict[i]).resize((600, 600))
        x.paste(a, (0, 0), a)
    global img
    img = x
    global out
    out = ImageTk.PhotoImage(x)
    ttk.Label(frame, image=out, borderwidth=4).grid(column=3)


randomise()

root.mainloop()
