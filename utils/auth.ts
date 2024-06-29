import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (inputPassword: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(inputPassword, hashedPassword);
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD,
    },
});

const loadTemplate = (templatePath: string) => {
    const source = fs.readFileSync(templatePath, 'utf-8').toString();
    return Handlebars.compile(source);
};

// Resolve the template path relative to the project root
const emailVerificationTemplatePath = path.resolve('public/templates/email_verification_otp.html');
const passwordResetTemplatePath = path.resolve('public/templates/forgotpassword_verification_otp.html');

const emailVerificationTemplate = loadTemplate(emailVerificationTemplatePath);
const passwordResetTemplate = loadTemplate(passwordResetTemplatePath);

const sendOTPEmail = async (email: string, OTP: string, firstname: string, template: HandlebarsTemplateDelegate) => {
    const html = template({ User: firstname, OTP_CODE: OTP });

    const mailOptions = {
        from: EMAIL_USERNAME,
        to: email,
        subject: 'Your OTP Code',
        html: html,
    };

    return await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (email: string, OTP: string, firstname: string) => {
    await sendOTPEmail(email, OTP, firstname, emailVerificationTemplate);
};

export const sendPasswordResetEmail = async (email: string, OTP: string, firstname: string) => {
    await sendOTPEmail(email, OTP, firstname, passwordResetTemplate);
};

export const generateRandomToken = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
