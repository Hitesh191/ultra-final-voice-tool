
import type { VoiceOption, StyleOption } from './types';

export const VOICE_OPTIONS: VoiceOption[] = [
  { value: 'Puck', label: 'Male Voice 1 (Puck)', previewText: 'Hello, this is a sample of my voice.' },
  { value: 'Charon', label: 'Male Voice 2 (Charon)', previewText: 'नमस्ते, यह मेरी आवाज़ का एक नमूना है।' },
  { value: 'Fenrir', label: 'Male Voice 3 (Fenrir)', previewText: 'This is a test of the text to speech system.' },
  { value: 'Zephyr', label: 'Male Voice 4 (Zephyr)', previewText: 'आपकी आवाज़ अब तैयार है।' },
  { value: 'Kore', label: 'Androgynous Voice (Kore)', previewText: 'Welcome to the Hinglish AI voice generator.' },
];

export const EMOTION_OPTIONS: StyleOption[] = [
    { value: '', label: 'Default' },
    { value: 'cheerful', label: 'Cheerful' },
    { value: 'sad', label: 'Sad' },
    { value: 'angry', label: 'Angry' },
    { value: 'excited', label: 'Excited' },
    { value: 'calm', label: 'Calm' },
];

export const VIBE_OPTIONS: StyleOption[] = [
    { value: '', label: 'Default' },
    { value: 'deep', label: 'Deep' },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'energetic', label: 'Energetic' },
    { value: 'whispering', label: 'Whispering' },
];
