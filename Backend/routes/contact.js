const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// ====================
// Ruta de contacto normal
// ====================
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.MAIL_TO,
      subject: subject,
      html: `
        <h3>Nuevo mensaje desde el formulario de contacto</h3>
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Asunto:</b> ${subject}</p>
        <p><b>Mensaje:</b><br>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Correo enviado correctamente ✅" });
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    res.status(500).json({ error: "No se pudo enviar el correo" });
  }
});

// ====================
// Nueva ruta: Cotización
// ====================
router.post("/cotizar", async (req, res) => {
  try {
    const { name, email, producto, imagen, mensaje } = req.body;

    if (!name || !email || !producto || !mensaje) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.MAIL_TO,
      subject: `🛒 Nueva cotización: ${producto}`,
      html: `
        <h2>Solicitud de cotización</h2>
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Producto:</b> ${producto}</p>
        <p><b>Mensaje:</b> ${mensaje}</p>
        ${imagen ? `<p><b>Imagen del producto:</b><br><img src="${imagen}" alt="Producto" width="300"></p>` : ""}
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Cotización enviada correctamente ✅" });
  } catch (error) {
    console.error("❌ Error enviando cotización:", error);
    res.status(500).json({ error: "No se pudo enviar la cotización" });
  }
});

module.exports = router;
