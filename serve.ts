import express from "express"
import { PrismaClient } from "@prisma/client";
import TG from "node-telegram-bot-api";
import config from "./config"

const prisma = new PrismaClient({
    errorFormat: "pretty",
});
const bot = new TG(config.bot.tg_api);
let app = express()
app.use(express.json())
let port = process.env.PORT || 3000;

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

app.post('/ipn', async (req, res) => {
    if (req.body.payment_status == "finished") {
        console.log(req.body)
        let x = await prisma.users.update({
            data: {
                balance: {
                    increment: parseFloat(req.body.price_amount)
                }
            },
            where: {
                chatid: req.body.order_id
            }
        })
        res.status(200).json({ status: true, message: x })
        bot.sendMessage(parseInt(x.chatid!), `Your balance has been updated by ${req.body.price_amount}`)
    } else {
        bot.sendMessage(parseInt(req.body.order_id), `The current status of your topup is now: ${req.body.payment_status}`)
    }

})

app.listen(port)