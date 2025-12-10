// index.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend de contacto funcionando ✅');
});

app.post('/contact', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      countryCode,
      phone,
      help,
      privacyAccepted,
    } = req.body;

    // Validación básica en el servidor
    if (!firstName || !lastName || !email || !help || !privacyAccepted) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Formulario Web" <${process.env.SMTP_USER}>`,
      to: 'carloagarcia1405@gmail.com', // 👉 aquí el correo que debe recibir los mensajes
      subject: 'Nuevo mensaje desde la web',
      text: `
Nuevo mensaje de contacto:

Nombre: ${firstName} ${lastName}
Email: ${email}
Teléfono: ${countryCode} ${phone || '-'}
Mensaje:
${help}
      `,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${countryCode} ${phone || '-'}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${help.replace(/\n/g, '<br />')}</p>
      `,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error enviando correo:', err);
    return res.status(500).json({ error: 'Error al enviar el correo' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
