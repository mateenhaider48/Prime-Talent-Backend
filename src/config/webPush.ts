import webpush from "web-push";

const subject = process.env.VAPID_SUBJECT;
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (!subject) {
  throw new Error("VAPID_SUBJECT is not defined");
}

if (!publicKey) {
  throw new Error("VAPID_PUBLIC_KEY is not defined");
}

if (!privateKey) {
  throw new Error("VAPID_PRIVATE_KEY is not defined");
}

webpush.setVapidDetails(
  subject,
  publicKey,
  privateKey
);

export default webpush;