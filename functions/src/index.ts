
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// To make this function work, you need to:
// 1. Sign up for an email sending service like Resend (https://resend.com)
// 2. Get your API key from the service.
// 3. Set it as a secret in your Firebase project by running this command:
//    firebase functions:secrets:set RESEND_API_KEY
//    (and follow the prompts)
// 4. Install the Resend Node.js library in this `functions` directory:
//    npm install resend
// 5. Uncomment the code below.

// import { Resend } from "resend";

interface ApprovalEmailData {
    parentEmail: string;
    childName: string;
}

export const sendApprovalEmail = functions.https.onCall(
    async (data: ApprovalEmailData, context) => {
        const {parentEmail, childName} = data;

        // Uncomment this line and the import above after setting the secret
        // const resend = new Resend(process.env.RESEND_API_KEY);

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
            // Uncomment the following lines when Resend is set up
            /*
            await resend.emails.send({
                from: "onboarding@your-domain.com", // Must be a verified domain in Resend
                to: parentEmail,
                subject: subject,
                html: body,
            });
            */

            // For now, we'll log to the console to show it's working
            console.log(`Simulating email send to ${parentEmail} for ${childName}.`);
            console.log("Email body:", body);


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
