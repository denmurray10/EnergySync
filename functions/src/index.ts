
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";

admin.initializeApp();

// This function requires the RESEND_API_KEY secret to be set in Firebase:
// firebase functions:secrets:set RESEND_API_KEY
// You must also verify a domain with Resend to use in the `from` field.
const resend = new Resend(process.env.RESEND_API_KEY);

interface ApprovalEmailData {
    parentEmail: string;
    childName: string;
}

export const sendApprovalEmail = functions.runWith({ secrets: ["RESEND_API_KEY"] }).https.onCall(
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
                to: parentEmail,
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
