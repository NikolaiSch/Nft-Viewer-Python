from tkinter import *
from tkinter import ttk
from PIL import ImageTk, Image
import os
import random
from time import time
import json
from tqdm import tqdm

root = Tk()


text = 0
frame = ttk.Frame(root, padding=10)
style = ttk.Style()
frame.grid()

try:
    os.mkdir("./export")
except FileExistsError:
    print("'./export' already exists")
d = r"./assets"
dl = [os.path.join(d, o) for o in os.listdir(d) if os.path.isdir(os.path.join(d, o))]
l = []
dic = {}

for i in dl:
    l.append(i.split("\\")[-1])


for i in l:
    d = f"{i}"
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
    """
    Generates a random piece of artwork.
    :param None
    :return: art_dict: a dictionary of art dimensions and a randomly selected art piece"""
    for i in l:
        art_dict[i] = random.choice(dic[i])
    return art_dict


z = random_art()

count = 1


def render_stats():
    """
    Renders the current stats of the artwork.
    :param None
    :return: None"""
    count = 1
    for i in l:
        ttk.Label(frame, text=i).grid(column=0, row=count)
        ttk.Label(frame, text=art_dict[i].split("/")[-1]).grid(column=1, row=count)
        count += 1


x = 0
out = 1


def save():
    """
    Saves the current piece of artwork to a directory.
    :param None
    :return: None"""
    t = "".join(str(time()).split("."))
    os.mkdir(f"./export/{t}")
    img.save(f"./export/{t}/img.png")
    d = json.dumps(art_dict, indent=4, sort_keys=True)
    with open(f"./export/{t}/img.json", "w+") as f:
        f.write(d)


def save_multiple():
    """
    Saves multiple pieces of artwork to a directory.
    :param None
    :return: None"""
    totalDict = []
    x = text.get()
    for widgets in frame.winfo_children():
        widgets.destroy()
    t = "".join(str(time()).split("."))
    os.mkdir(f"./export/{t}")
    for i in tqdm(range(int(x))):
        randomise_optimised()
        img.save(f"./export/{t}/{i}.png")
        totalDict.append({i: art_dict})
    with open(f"./export/{t}/data.json", "w+") as f:
        d = json.dumps(totalDict, indent=4, sort_keys=True)
        f.write(d)
    randomise()


def randomise():
    """
    Randomises the current piece of artwork.
    :param None
    :return: None"""
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
    global text
    text = ttk.Entry(frame, width=20, text="How Many?")
    text.grid(column=2, row=0)
    ttk.Button(
        frame, command=save_multiple, padding=20, width=20, text="Save Multiple!"
    ).grid(column=3, row=0)
    x = Image.open("./assets/blank.png").resize((300, 300))
    for i in l:
        a = Image.open(art_dict[i]).resize((300, 300))
        x.paste(a, (0, 0), a)
    global img
    img = x.copy()
    global out
    out = ImageTk.PhotoImage(x)
    ttk.Label(frame, image=out, borderwidth=4).grid(column=2, row=2, rowspan=100)


def randomise_optimised():
    """
    Randomises the current piece of artwork, optimised for multiple"""
    random_art()
    x = Image.open("./assets/blank.png").resize((1000, 1000))
    for i in l:
        a = Image.open(art_dict[i]).resize((1000, 1000))
        x.paste(a, (0, 0), a)
    global img
    x.resize((1000, 1000))
    img = x


randomise()

root.mainloop()
