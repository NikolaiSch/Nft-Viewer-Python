import express from "express"
import { PrismaClient } from "@prisma/client";
import TG from "node-telegram-bot-api";
import config from "./config"

const prisma = new PrismaClient({
    errorFormat: "pretty",
});
const bot = new TG(config.bot.tg_api, { polling: true });
let app = express()
let port = process.env.PORT || 3001;

app.get('/add', async (req, res) => {
    await prisma.fullz.create({
        data: {
            owner: 0,
            dob: req.query.dob?.toString(),
            bin: req.query.bin?.toString(),
            data: req.query.data?.toString(),
        }
    })
    res.send("true")
})

app.get('/ipn', async (req) => {
    if (req.body.payment_status == "finished") {
        prisma.users.update({
            data: {
                balance: {
                    increment: req.body.price_amount
                }
            },
            where: {
                chatid: req.body.order_id
            }
        })
    }
})

app.listen(port)