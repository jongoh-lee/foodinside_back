import { adjectives, nouns } from "./words";
import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
// 토크화 해주는 모듈
import jwt from "jsonwebtoken";


export const generateSecret = () => {
  const randomNumber = Math.floor(Math.random() * adjectives.length);
  //return `${adjectives[randomNumber]} ${nouns[randomNumber]}`;
  return String(Math.floor(Math.random() * 1000000) + 1);

};

export const sendSecretMail = async (address, secret) => {
  const transporter = nodemailer.createTransport(smtpTransport({
    service: 'Gmail',
    host:'smtp.google.com',
    port:587,
    secure: false,
    auth:{
      user:  process.env.SENDGRID_USERNAME,
      pass: process.env.SENGRID_PASSWORD,
    }
  }));

  const email = {
    from: "푸드인사이드 <whddh5285@naver.com>",
    to: address,
    subject: "로그인 인증키🔑",
    html: `안녕하세요! 푸드인사이드 로그인 인증 키는 <strong>${secret}</strong><br/>입니다. 안전한 로그인을 위해 정확한 키를 입력해 주세요`
  };

  try {
    await transporter.sendMail(email);
    console.log(`mail have sent to ${ address }`);
  } catch (error) {
    console.error(error);
  }
}

export const sendReservationConfirmMail = async (username, totalPrice) => {
  const transporter = nodemailer.createTransport(smtpTransport({
    service: 'Gmail',
    host:'smtp.google.com',
    port:587,
    secure: false,
    auth:{
      user:  process.env.SENDGRID_USERNAME,
      pass: process.env.SENGRID_PASSWORD,
    }
  }));

  const email = {
    from: "푸드인사이드 <whddh5285@naver.com>",
    to: "ljo.foodinside@gmail.com",
    subject: "음식점을 예약했습니다.",
    html: `<strong>${username}</strong>님의 총 입금액은 ${totalPrice}원 입니다.`
  };

  try {
    await transporter.sendMail(email);
    console.log(`mail have sent to ${ "ljo.foodinside@gmail.com" }`);
  } catch (error) {
    console.error(error);
  }
}

export const sendReservationCancelMail = async (username, refundPrice) => {
  const transporter = nodemailer.createTransport(smtpTransport({
    service: 'Gmail',
    host:'smtp.google.com',
    port:587,
    secure: false,
    auth:{
      user:  process.env.SENDGRID_USERNAME,
      pass: process.env.SENGRID_PASSWORD,
    }
  }));

  const email = {
    from: "푸드인사이드 <whddh5285@naver.com>",
    to: "ljo.foodinside@gmail.com",
    subject: "예약을 취소했습니다.",
    html: `<strong>${username}</strong>님의 총 환불액은 ${refundPrice}원 입니다.`
  };

  try {
    await transporter.sendMail(email);
    console.log(`mail have sent to ${ "ljo.foodinside@gmail.com" }`);
  } catch (error) {
    console.error(error);
  }
}



// passport를 이용해 id를 jwt에 삽입 합니다. 이때 비밀 번호가 필요 합니다.
export const generateToken = id => jwt.sign({ id }, process.env.JWT_SECRET);