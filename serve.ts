import express, { request } from "express";
import { PrismaClient } from "@prisma/client";
import TG from "node-telegram-bot-api";
import config from "./config";

const prisma = new PrismaClient({
  errorFormat: "pretty",
});
const bot = new TG(config.bot.tg_api);
let app = express();
app.use(express.json());
let port = process.env.PORT || 3000;

interface input {
  dob: string;
  bin: string;
  data: string;
}

app.post("/add", async (req, res) => {
  try {
    request.body as input;
    await prisma.fullz.create({
      data: {
        owner: 0,
        dob: req.body.dob.toString(),
        bin: req.body.bin.toString(),
        data: req.body.data.toString(),
      },
    });
    res.send("true");
  } catch (e) {
    res.send(e);
  }
});

app.post("/ipn", async (req, res) => {
  if (req.body.payment_status == "finished") {
    console.log(req.body);
    let x = await prisma.users.update({
      data: {
        balance: {
          increment: parseFloat(req.body.price_amount),
        },
      },
      where: {
        chatid: req.body.order_id,
      },
    });
    res.status(200).json({ status: true, message: x });
    bot.sendMessage(
      parseInt(x.chatid!),
      `Your balance has been updated by ${req.body.price_amount}`
    );
  } else {
    bot.sendMessage(
      parseInt(req.body.order_id),
      `The current status of your topup is now: ${req.body.payment_status}`
    );
  }
});

app.listen(port);
