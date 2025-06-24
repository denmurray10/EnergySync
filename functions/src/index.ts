
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";

admin.initializeApp();

// WARNING: Hardcoding API keys is not a good practice for production applications.
// This is a temporary measure for prototyping. In a real app, use Firebase secrets.
const RESEND_API_KEY = "re_8h4ubuf6_FQ9ZBz8acDKgbaeMxjAPP2wX";
const resend = new Resend(RESEND_API_KEY);

interface ApprovalEmailData {
    parentEmail: string;
    childName: string;
}

export const sendApprovalEmail = functions.https.onCall(
    async (data: ApprovalEmailData, context) => {
        const {parentEmail, childName} = data;

        const subject = `Approval needed for ${childName}'s EnergySync account`;
        const body = `
            <h1>Hi there!</h1>
            <p>
                <b>${childName}</b> has requested to create an account on EnergySync and listed you as their parent or guardian.
            </p>
            <p>
                To approve their account, please click the link below.
            </p>
            <p>
                <a href="https://your-app-url/approve?token=SOME_SECURE_TOKEN">Approve Account</a>
            </p>
            <p>
                If you did not expect this, you can safely ignore this email.
            </p>
            <p>Thanks,<br/>The EnergySync Team</p>
        `;

        try {
            await resend.emails.send({
                from: "YOUR_VERIFIED_EMAIL@your-domain.com", // This must be a verified domain in your Resend account.
                to: "dennis.murray10@gmail.com",
                subject: subject,
                html: body,
            });

            return {success: true, message: "Email sent successfully."};
        } catch (error) {
            console.error("Error sending email:", error);
            throw new functions.https.HttpsError(
                "internal",
                "Failed to send approval email.",
                error,
            );
        }
    },
);
