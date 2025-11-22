'use server';

/**
 * @fileOverview Converts text to speech using a Genkit flow.
 * - textToSpeech - a function that takes a string and returns a data URI for an audio file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

// Define the output schema for the flow
const TTSOutputSchema = z.object({
  media: z.string().describe("A data URI of the generated audio in WAV format. e.g., 'data:audio/wav;base64,...'"),
});
export type TTSOutput = z.infer<typeof TTSOutputSchema>;

/**
 * Converts a text string to speech and returns it as a base64 encoded WAV data URI.
 * @param query The text to convert to speech.
 * @returns A promise that resolves to an object containing the audio data URI.
 */
export async function textToSpeech(query: string): Promise<TTSOutput> {
  return textToSpeechFlow(query);
}

// Helper function to convert PCM buffer to WAV base64 string
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

// Define the Genkit flow for text-to-speech
const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.string(),
    outputSchema: TTSOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Using a friendly, standard British English voice
            prebuiltVoiceConfig: { voiceName: 'Alloy' },
          },
        },
      },
      prompt: query,
    });
    
    if (!media) {
      throw new Error('No media was returned from the TTS model.');
    }

    // The returned media URL is a base64 encoded PCM data URI.
    // We need to extract the base64 data and convert it to a WAV buffer.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      media: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
