import {OAuth2Client}  from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function googleVerify(token = '') {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
  });
  const {name, email, picture} = ticket.getPayload();
  return {
    nickname: name,
    correo: email,
    img: picture
  }
}
