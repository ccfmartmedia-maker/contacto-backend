require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Permitir peticiones desde cualquier origen (puedes restringir a tu dominio luego)
app.use(cors());
app.use(express.json());

// Ruta simple para probar que el backend vive
app.get('/', (req, res) => {
  res.send('Backend de contacto funcionando ✅');
});

// 👉 Transporter usando "service: gmail" (más simple)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // tu correo Gmail
    pass: process.env.SMTP_PASS, // contraseña de aplicación
  },
});

// Verificar que el SMTP esté listo
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error verificando SMTP:', error);
  } else {
    console.log('✅ SMTP listo para enviar correos');
  }
});

// Ruta del formulario
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

    console.log('📥 Datos recibidos:', req.body);

    // Validaciones básicas
    if (!firstName || !lastName || !email || !help || !privacyAccepted) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // 👉 CORREO QUE RECIBE EL MENSAJE (del cliente)
    const destinatario = 'carloagarcia1405@gmail.com';

    await transporter.sendMail({
      from: `"Formulario Web" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: 'Nuevo mensaje desde el formulario de contacto',
      html: `
        <h2>Nuevo mensaje desde la web</h2>
        <p><strong>Nombre:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${countryCode || ''} ${phone || ''}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${help}</p>
      `,
    });

    console.log('✅ Correo enviado correctamente');
    return res.json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    return res.status(500).json({ error: 'Error al enviar el correo' });
  }
});

// Arrancar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
