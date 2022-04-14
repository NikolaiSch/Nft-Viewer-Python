console.log("INITIALISED");

import TG from "node-telegram-bot-api";
import config from "./config";
import { PrismaClient, users } from "@prisma/client";
import NowPayments from "@nowpaymentsio/nowpayments-api-js";
import { CreatePaymentReturn } from "@nowpaymentsio/nowpayments-api-js/src/actions/create-payment";
import { GetPaymentStatusReturn } from "@nowpaymentsio/nowpayments-api-js/src/actions/get-payment-status";
var AsciiTable = require('ascii-table')


const NP = new NowPayments({ apiKey: config.nowpayments.apiKey });
const prisma = new PrismaClient({
    errorFormat: "pretty",
});
const bot = new TG(config.bot.tg_api, { polling: true });


bot.onText(/\/start/, async (msg) => {
    const x = await prisma.users.upsert({
        create: {
            balance: 0,
            chatid: msg.chat.id.toString(),
        },
        where: {
            chatid: msg.chat.id.toString(),
        },
        update: {},
    });
    bot.sendMessage(
        msg.chat.id,
        "You have successfully initialised your account!"
    );
});

bot.onText(/\/myBalance/, async (msg) => {
    const x = await prisma.users.findFirst({
        where: {
            chatid: msg.chat.id.toString(),
        },
    });
    bot.sendMessage(msg.chat.id, `Your current balance is £${x?.balance}`);
});

bot.onText(/\/list/, async (msg) => {
    const x = await prisma.fullz.findMany({
        where: {
            owner: 0,
        },
    });
    let table = new AsciiTable()
    table.setHeading("id", "bin", "dob")
    x.forEach((a) => table.addRow(a.id, a.bin, a.dob))
    bot.sendMessage(msg.chat.id, `<pre>${table.toString()}</pre>`, { parse_mode: "HTML" });
});

bot.onText(/\/bin (\d\d\d\d\d\d)/, async (msg, match) => {
    const x = await prisma.fullz.findMany({
        where: {
            owner: 0,
            bin: match?.[1]
        },
    });
    let table = new AsciiTable()
    table.setHeading("id", "bin", "dob")
    x.forEach((a) => table.addRow(a.id, a.bin, a.dob))
    bot.sendMessage(msg.chat.id, `<pre>${table.toString()}</pre>`, { parse_mode: "HTML" });
});

bot.onText(/\/buy (\d+)/, async (msg, match) => {
    let x = await prisma.users.findFirst({
        where: {
            chatid: msg.chat.id.toString()
        }
    })
    if (x?.balance! >= config.bot.price) {
        await prisma.users.update({
            data: {
                balance: {
                    decrement: config.bot.price
                }
            },
            where: {
                chatid: msg.chat.id.toString()
            }
        })
        let fullz = await prisma.fullz.update({
            data: {
                owner: msg.chat.id
            },
            where: {
                id: parseInt(match![1])
            }
        })
        bot.sendMessage(msg.chat.id, `<pre>${fullz.data}</pre>`, { parse_mode: "HTML" });
    } else {
        bot.sendMessage(msg.chat.id, `Not enough balance to buy this. ${config.bot.price} is needed to purchase. Use /topup btc 40 or /topup eth 40`)
    }
});

bot.onText(/\/sendToAll (.+)/, async (_, match) => {
    const x = await prisma.users.findMany();
    const text = match?.slice(1)!;
    x.forEach((a) => bot.sendMessage(Number(a?.chatid), text?.join(" ")!));
});

bot.onText(/\/topup (eth|btc|ltc) (\d+)/, async (msg, match) => {
    const currency = match![1];
    const amount = Number(match![2]);
    let payment = await NP.createPayment({
        price_amount: amount,
        price_currency: "gbp",
        pay_currency: currency,
        order_id: msg.chat.id.toString()
    });

    if (payment instanceof Error) {
        bot.sendMessage(msg.chat.id, `Error: ${payment.message}`)
    } else {
        payment = <CreatePaymentReturn>payment
        await prisma.payments.create({
            data: {
                np_id: payment.payment_id.toString(),
                chatid: msg.chat.id,
                currency: currency,
                amount: amount,
                status: "waiting"
            },
        });
        bot.sendMessage(msg.chat.id, `Amount: ${payment.pay_amount} ${payment.pay_currency.toUpperCase()}\nAddress: ${payment.pay_address}`)
    }
});

bot.onText(/\/paymentStatus/, async (msg: TG.Message) => {
    let payments = await prisma.payments.findMany({
        where: {
            chatid: msg.chat.id
        }
    })
    let table = new AsciiTable()
    table.setHeading("status", "paid")
    let a: string[][] = [];
    let z = 1;
    payments.forEach(async (p) => {
        z++
        let status = await NP.getPaymentStatus({ payment_id: p.np_id! })
        status = <GetPaymentStatusReturn>status
        if (status.payment_status == "waiting" || status.payment_status == "confirming") {
            table.addRow("test", "test")
        } else if (status.payment_status == "finished" || status.payment_status == "confirmed") {
            let x = await prisma.payments.findUnique({
                where: {
                    np_id: status.order_id
                }
            })
            await prisma.payments.delete({
                where: {
                    np_id: status.order_id
                }
            })
            let am = x?.amount as number
            await prisma.users.update({
                data: {
                    balance: {
                        increment: am
                    }
                },
                where: {
                    chatid: msg.chat.id.toString()
                }
            })
            bot.sendMessage(msg.chat.id, `Added £${am} to your account`)
        }

        if (z == payments.length - 1) {
            bot.sendMessage(msg.chat.id, `<pre>${table.toString()}</pre>`, { parse_mode: "HTML" })
        }
    })


})


bot.onText(/\/addBalance (\d+) (\d+)/, async (msg, match) => {
    if (msg.chat.id == config.bot.admin) {
        await prisma.users.update({
            data: {
                balance: {
                    increment: parseInt(match![1])
                }
            },
            where: {
                chatid: match![2]
            }
        })
        bot.sendMessage(msg.chat.id, "Success")
    }
});

bot.onText(/\/id/, async (msg) => {
    bot.sendMessage(msg.chat.id, msg.chat.id.toString())
});
